import {Exists, FSFile, FSFolder, Open, SaveAll} from "src/backend/FileSystem";
import {rootFolder} from "src/backend/FileSystem";
import {Machine} from "src/backend/Emulator/Machine";
import type {ISystemConfiguration} from "src/backend/Emulator/Machine";
import {type IProjectBuilder, ProjectBuilder} from "src/backend/BuildSystem/ProjectBuilder";
import {signal} from '@preact/signals';

export class Project {
    public machineTick: number;
    protected _machine: Machine;
    protected _projectBuilder: ProjectBuilder;

    public constructor(systemConfiguration: ISystemConfiguration, projectBuilder: ProjectBuilder) {
        this._machine = Machine.FromSystemConfiguration(systemConfiguration);
        this._projectBuilder = projectBuilder;
    }

    public static FromJSON(json: IProjectJson): Project {
        const project = new Project(
            json.systemConfiguration ?? {master: null, devices: []},
            ProjectBuilder.FromJSON(json.projectBuilder)
        );
        return project;
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
}

export interface IProjectJson {
    systemConfiguration: ISystemConfiguration,
    projectBuilder: IProjectBuilder
}

export const PROJECT_EXTENSION: string = ".rvedu";

export function makeProject(folderName: string): void {
    SaveAll();

    const exists = Exists(`/${folderName}/${PROJECT_EXTENSION}`);
    if (exists)
        throw `Project ${folderName} already exists`;

    let mainSFile = Open(`/${folderName}/main.s`, true, true);
    mainSFile?.write("start:\n\tnop\n\taddi x1, x0, $40\n\taddi x2, x0, $2\n\tadd x3, x1, x2\n\tsw x3, $128(x0)\n\tj $0");

    updateAvailableProjects();
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