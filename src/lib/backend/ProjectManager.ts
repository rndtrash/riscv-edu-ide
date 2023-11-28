import {get, writable} from "svelte/store";
import {Exists, FSFile, FSFolder, Open, SaveAll} from "$lib/backend/FileSystem";
import {rootFolder} from "$lib/backend/FileSystem";

class Project {
    public systemConfiguration: { name: string, context: any }[];
    protected file: FSFile;

    public constructor(systemConfiguration: { name: string, context: any }[], file: FSFile) {
        this.systemConfiguration = systemConfiguration;
        this.file = file;
    }

    public static FromFile(file: FSFile): Project {
        const projectJson = getJsonFromString(file.text);
        const project = new Project(
            projectJson.systemConfiguration ?? [],
            file
        );
        project.Save();
        return project;
    }

    public ToJSON(): IProjectJson {
        return {
            systemConfiguration: this.systemConfiguration
        };
    }

    public Save() {
        this.file.text = JSON.stringify(this.ToJSON());
        this.file.parent?.Save();
    }
}

interface IProjectJson {
    systemConfiguration: { name: string, context: any }[],
}

export const PROJECT_EXTENSION: string = ".rvedu";

export const ExampleProjects = ['/example-projects/hellorld.rvedu'];

export const currentProject = writable<Project | undefined>(undefined);

export function makeProject(folderName: string): void {
    SaveAll();

    closeProject();

    if (Exists(`/${folderName}/${PROJECT_EXTENSION}`))
        throw `Project ${folderName} already exists`;

    let projectFile = Open(`/${folderName}/${PROJECT_EXTENSION}`, true, true)!;
    currentProject.set(Project.FromFile(projectFile));
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

export function availableProjects(): string[] {
    let projects = Array.of<string>();
    if (rootFolder === undefined) {
        console.error("root folder is not ready yet")
        return projects;
    }

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