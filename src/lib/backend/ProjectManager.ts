import {get, writable} from "svelte/store";
import {Exists, FSFile, FSFolder, Open, SaveAll} from "$lib/backend/FileSystem";
import {rootFolder} from "$lib/backend/FileSystem";
import {Machine} from "$lib/backend/Emulator/Machine";
import type {ISystemConfiguration} from "$lib/backend/Emulator/Machine";
import {MakeADD, MakeADDI, MakeNOP, MakeSW} from "$lib/backend/Emulator/Masters/RISCV32";

export class Project {
    protected _machine: Machine;
    protected file: FSFile;

    public constructor(systemConfiguration: ISystemConfiguration, file: FSFile) {
        this._machine = Machine.FromSystemConfiguration(systemConfiguration);
        this.file = file;
    }

    public static FromJSON(json: IProjectJson, file: FSFile): Project {
        const project = new Project(
            json.systemConfiguration ?? [],
            file
        );
        project.Save();
        return project;
    }

    public static FromFile(file: FSFile): Project {
        const projectJson = getJsonFromString(file.text);
        return Project.FromJSON(projectJson, file);
    }

    public get folder(): FSFolder {
        return this.file.parent!;
    }

    public get machine(): Machine {
        return this._machine;
    }

    public MachineTick(): void {
        this._machine.Tick();
        currentTick.set(this._machine.tick);
    }

    public ToJSON(): IProjectJson {
        return {
            systemConfiguration: this._machine.ToSystemConfiguration()
        };
    }

    public Save() {
        this.file.text = JSON.stringify(this.ToJSON());
        this.file.parent?.Save();
    }
}

interface IProjectJson {
    systemConfiguration: ISystemConfiguration,
}

export const PROJECT_EXTENSION: string = ".rvedu";

// TODO: download example projects from the static folder
export const ExampleProjects = ['/example-projects/hellorld.rvedu'];

export const currentProject = writable<Project | undefined>(undefined);
export const currentTick = writable<number>(0);

function listenToProjectChange() {
    get(currentProject)?.folder.addEventListener('fsnode-updated', reloadProject);
}

export function reloadProject(): void {
    const project = get(currentProject);
    if (project === undefined) {
        console.error("Nothing to reload.");
        return;
    }

    const projectFolder: string = project.folder.name;
    currentProject.set(undefined);
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
    currentProject.set(Project.FromJSON({
        systemConfiguration: {
            master: {
                name: "rv32",
                context: undefined
            },
            devices: [
                {
                    name: "consolelog",
                    context: undefined
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
                            MakeSW(0, 3, 128)
                        ],
                        readOnly: true
                    }
                }
            ]
        }
    }, projectFile));
    listenToProjectChange();
}

export function openProject(folderName: string): void {
    SaveAll();

    closeProject();

    let projectFile = Open(`/${folderName}/${PROJECT_EXTENSION}`, false, false);
    if (projectFile === undefined)
        throw "Invalid project";

    currentProject.set(Project.FromFile(projectFile));
    listenToProjectChange();
}

export function closeProject(): void {
    const project = get(currentProject);
    if (project !== undefined) {
        project.folder.removeEventListener('fsnode-updated', reloadProject);
        project.Save();
    }
    currentProject.set(undefined);
}

function getJsonFromString(jsonString: string): IProjectJson {
    const jsonProject: IProjectJson = JSON.parse(jsonString);
    /*if (jsonProject.name === undefined)
        throw "Invalid project JSON";*/

    return jsonProject;
}

export const allProjects = writable<string[]>([]);

// TODO: hack!!!
const rootFolderInterval = setInterval(() => {
    if (rootFolder !== undefined) {
        clearInterval(rootFolderInterval);
        rootFolder.addEventListener('fsnode-updated', updateAvailableProjects);
        updateAvailableProjects();
        return;
    }
    console.error("root folder is not ready yet");
}, 200);

function updateAvailableProjects(): void {
    allProjects.set(availableProjects());
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
                    if (projectJson !== undefined)
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