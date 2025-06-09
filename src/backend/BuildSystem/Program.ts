import type {Logger} from "$lib/backend/Logger";

export enum ProgramStatus {
    Success = 0,
    Failure
}

export type Program = (logger: Logger, ...args: any[]) => ProgramStatus;

export const BuildPrograms: {
    [name: string]: {
        // TODO: scheme
        program: Program
    }
} = {};