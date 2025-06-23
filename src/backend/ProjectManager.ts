import {Exists, FSFile, FSFolder, Open, SaveAll} from "src/backend/FileSystem";
import {rootFolder} from "src/backend/FileSystem";
import {Machine} from "src/backend/Emulator/Machine";
import type {ISystemConfiguration} from "src/backend/Emulator/Machine";
import {MakeADD, MakeADDI, MakeNOP, MakeSW, MakeJ} from "src/backend/Assembler/Instructions";
// import {LoggerManager} from "src/backend/Logger";
import {BuildStage, type IProjectBuilder, ProjectBuilder} from "src/backend/BuildSystem/ProjectBuilder";
import {signal} from '@preact/signals';

export class Project {
    public machineTick: number;
    protected _machine: Machine;
    protected _file: FSFile;
    protected _projectBuilder: ProjectBuilder;

    public constructor(systemConfiguration: ISystemConfiguration, file: FSFile, projectBuilder: ProjectBuilder) {
        this._machine = Machine.FromSystemConfiguration(systemConfiguration);
        this._file = file;
        this._projectBuilder = projectBuilder;
    }

    public static FromJSON(json: IProjectJson, file: FSFile): Project {
        const project = new Project(
            json.systemConfiguration ?? {master: null, devices: []},
            file,
            ProjectBuilder.FromJSON(json.projectBuilder)
        );
        project.Save();
        return project;
    }

    public static FromFile(file: FSFile): Project | null {
        const projectJson = getJsonFromString(file.text);
        if (projectJson != null)
            return Project.FromJSON(projectJson, file);
        return null;
    }

    public get projectFile(): FSFile {
        return this._file;
    }

    public get folder(): FSFolder {
        return this._file.parent!;
    }

    public get machine(): Machine {
        return this._machine;
    }

    public MachineTick(): void {
        this._machine.doTick();
        this.machineTick = this._machine.tick;
    }

    public ToJSON(): IProjectJson {
        return {
            systemConfiguration: this._machine.toSystemConfiguration(),
            projectBuilder: this._projectBuilder.toJSON()
        };
    }

    public Save() {
        this._file.write(JSON.stringify(this.ToJSON()), false);
        this._file.parent?.Save();
    }
}

export interface IProjectJson {
    systemConfiguration: ISystemConfiguration,
    projectBuilder: IProjectBuilder
}

export const PROJECT_EXTENSION: string = ".rvedu";

// TODO: download example projects from the static folder
export const ExampleProjects = ['/example-projects/hellorld.rvedu'];

export const currentProject = signal<Project | null>(null);

function listenToProjectChange() {
    currentProject.value?.projectFile.addEventListener('fsnode-updated', reloadProject);
}

export function reloadProject(): void {
    const project = currentProject.value;
    if (project === null) {
        console.error("Nothing to reload.");
        return;
    }

    const projectFolder: string = project.folder.name;
    currentProject.value = null;
    openProject(projectFolder);
}

export function makeProject(folderName: string): void {
    SaveAll();

    closeProject();

    const exists = Exists(`/${folderName}/${PROJECT_EXTENSION}`);
    if (exists)
        throw `Project ${folderName} already exists`;

    let projectFile = Open(`/${folderName}/${PROJECT_EXTENSION}`, true, true)!;
    // TODO: replace with a proper machine setup wizard
    currentProject.value = Project.FromJSON({
        systemConfiguration: {
            master: {
                name: "rv32",
                context: null
            },
            devices: [
                {
                    name: "consolelog",
                    context: null
                }, {
                    name: "ram32",
                    context: {address: 128, size: 128}
                }, {
                    name: "rom32",
                    context: {
                        address: 0,
                        contents: [
                            MakeNOP(),
                            MakeADDI(0, 1, 40),
                            MakeADDI(0, 2, 2),
                            MakeADD(1, 2, 3),
                            MakeSW(0, 3, 128),
                            MakeJ(0),
                        ],
                        readOnly: true
                    }
                }
            ]
        },
        projectBuilder: (new ProjectBuilder([
            // TODO:
            new BuildStage("run", ["main.s"], ["main.s.o"], [])
        ])).toJSON()
    }, projectFile);

    let mainSFile = Open(`/${folderName}/main.s`, true, true);
    mainSFile?.write("start:\n\tnop\n\taddi x1, x0, $40\n\taddi x2, x0, $2\n\tadd x3, x1, x2\n\tsw x3, $128(x0)\n\tj $0");

    listenToProjectChange();
    updateAvailableProjects();
}

export function openProject(folderName: string): void {
    SaveAll();

    closeProject();

    let projectFile = Open(`/${folderName}/${PROJECT_EXTENSION}`, false, false);
    if (projectFile === null)
        throw "Invalid project";

    currentProject.value = Project.FromFile(projectFile);
    listenToProjectChange();
}

export function closeProject(): void {
    const project = currentProject.value;
    if (project != null) {
        project.folder.removeEventListener('fsnode-updated', reloadProject);
        project.Save();
    }
    currentProject.value = null;

    // LoggerManager.The.reset();
}

function getJsonFromString(jsonString: string): IProjectJson | null {
    // TODO: exceptions
    const jsonProject: IProjectJson = JSON.parse(jsonString);

    return jsonProject;
}

export const allProjects = signal<string[]>([]);

export function initializeProjectManager() {
    rootFolder.addEventListener('fsnode-updated', updateAvailableProjects);
    updateAvailableProjects();
}

function updateAvailableProjects(): void {
    allProjects.value = availableProjects();
}

function availableProjects(): string[] {
    let projects = Array.of<string>();

    for (const child of (rootFolder as FSFolder).children) {
        if (!(child instanceof FSFolder))
            continue;

        for (const fChild of (child as FSFolder).children) {
            if (fChild instanceof FSFile && fChild.name == PROJECT_EXTENSION) {
                try {
                    let projectJson = getJsonFromString((fChild as FSFile).text);
                    if (projectJson != null)
                        projects = [...projects, child.name];
                } catch (e) {
                    console.error(`Error while looking for available projects: ${e}`);
                }

                break;
            }
        }
    }

    return projects;
}