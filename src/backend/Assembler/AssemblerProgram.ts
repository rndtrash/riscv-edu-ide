import { Program, ProgramStatus } from "../BuildSystem/Program";

export const AssemblerProgram: Program = (project, ...args: any[]): ProgramStatus => {
    return ProgramStatus.Success;
};