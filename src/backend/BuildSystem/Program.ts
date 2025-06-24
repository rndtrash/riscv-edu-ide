import { AssemblerProgram } from "../Assembler/AssemblerProgram";
import { Project } from "../ProjectManager";

export enum ProgramStatus {
    Success = 0,
    Failure
}

export type Program = (project: Project, ...args: any[]) => ProgramStatus;

export const BuildPrograms = new Map<string, {
    // TODO: scheme
    program: Program
}>([
    ["asm", { program: AssemblerProgram }]
]);