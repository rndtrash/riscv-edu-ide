import {get, writable} from "svelte/store";
import {Exists, FSFile, FSFolder, Open, SaveAll} from "$lib/backend/FileSystem";
import {rootFolder} from "$lib/backend/FileSystem";
import {Machine} from "$lib/backend/Emulator/Machine";
import type {ISystemConfiguration} from "$lib/backend/Emulator/Machine";
import {CPUInstructions} from "$lib/backend/Emulator/Masters/SimpleCPU";

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

// TODO: download example projects from the Internet
export const ExampleProjects = ['/example-projects/hellorld.rvedu'];

export const currentProject = writable<Project | undefined>(undefined);
export const currentTick = writable<number>(0);

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
                name: "simplecpu",
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
                            CPUInstructions.Noop,
                            CPUInstructions.LoadImmediate, 5,
                            CPUInstructions.AddToRegister, 3,
                            CPUInstructions.StoreAtAddress, 128,
                            CPUInstructions.LoadFromAddress, 128
                        ],
                        readOnly: true
                    }
                }
            ]
        }
    }, projectFile));

    allProjects.set(availableProjects());
}

export function openProject(folderName: string): void {
    SaveAll();

    closeProject();

    let projectFile = Open(`/${folderName}/${PROJECT_EXTENSION}`, false, false);
    if (projectFile === undefined)
        throw "Invalid project";

    currentProject.set(Project.FromFile(projectFile));
}

export function closeProject(): void {
    get(currentProject)?.Save();
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
        allProjects.set(availableProjects());
        return;
    }
    console.error("root folder is not ready yet");
}, 200);

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