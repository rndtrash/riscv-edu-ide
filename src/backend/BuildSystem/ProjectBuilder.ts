import type { Project } from "src/backend/ProjectManager";
import { LogLevel } from "src/backend/Logger";
import { BuildPrograms, type Program, ProgramStatus } from "src/backend/BuildSystem/Program";

export interface IBuildStageProgram {
    name: string;
    arguments: any[]
}

export interface IBuildStage {
    name: string;
    inputFiles: string[];
    outputFiles: string[];
    programsSequence: IBuildStageProgram[];
}

export interface BuildStageProgram {
    program: Program;
    arguments: any[]
}

export class BuildStage {
    public name: string;
    public inputFiles: string[];
    public outputFiles: string[];
    public programsSequence: BuildStageProgram[];

    public constructor(name: string, inputFiles: string[], outputFiles: string[], programsSequence: BuildStageProgram[]) {
        this.name = name;
        this.inputFiles = inputFiles;
        this.outputFiles = outputFiles;
        this.programsSequence = programsSequence;
    }

    public get isUpToDate(): boolean {
        // TODO: check whether the output file is older than any of the input files
        return false;
    }

    public run(project: Project): boolean {
        for (const value of this.programsSequence) {
            try {
                const result = value.program(project, value.arguments);
                if (result != ProgramStatus.Success) {
                    console.log(`Program exited with status ${result}`, LogLevel.Error);
                }
            } catch (exception) {
                console.log(`Program threw an exception: ${exception}`, LogLevel.Error);
                return false;
            }
        }

        return true;
    }

    public toJSON(): IBuildStage {
        return {
            name: this.name,
            inputFiles: this.inputFiles,
            outputFiles: this.outputFiles,
            programsSequence: [] // TODO: serialize program sequence
        };
    }

    public static fromJSON(json: IBuildStage): BuildStage {
        return new BuildStage(json.name ?? "",
            json.inputFiles,
            json.outputFiles,
            json.programsSequence.map((value) => {
                return {
                    program: BuildPrograms.get(value.name).program,
                    arguments: value.arguments
                } as BuildStageProgram;
            }));
    }
}

export interface IProjectBuilder {
    buildStages: IBuildStage[];
}

export class ProjectBuilder {
    private buildStages: BuildStage[];

    public constructor(buildStages: BuildStage[]) {
        this.buildStages = buildStages;
    }

    public run(project: Project, force: boolean = false): boolean {
        for (const stage of this.buildStages) {
            if (force || !stage.isUpToDate) {
                const success = stage.run(project);
                if (!success)
                    return false;
            }
        }

        return true;
    }

    public toJSON(): IProjectBuilder {
        return {
            buildStages: this.buildStages.map((bs) => bs.toJSON())
        };
    }

    public static FromJSON(json: IProjectBuilder): ProjectBuilder {
        return new ProjectBuilder(json.buildStages.map((ibs) => BuildStage.fromJSON(ibs)));
    }
}