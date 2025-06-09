import {BuildPrograms, ProgramStatus} from "$lib/backend/BuildSystem/Program";
import type {FSFile} from "$lib/backend/FileSystem";
import {LoggerManager, LogLevel} from "$lib/backend/Logger";

export interface IObjectBase {
    type: string
}

export interface IObjectBinary extends IObjectBase {
    type: "binary",
    binary: Uint8Array
}

export interface IObjectLabel extends IObjectBase {
    type: "label",
    name: string
}

export enum ObjectInstructionLinkType {
    Invalid = 0,
    AbsHigh20,
    AbsLow12,
    RelHi20,
    RelLow12
}

export interface IObjectInstruction extends IObjectBase {
    type: "instruction",
    instruction: number,
    link: string,
    linkType: ObjectInstructionLinkType
}

export interface IObjectSection {
    base: number,
    contents: IObjectBase[]
}

export interface IObject {
    sections: {
        [name: string]: IObjectSection
    };
}

export enum LinkerExportType {
    Binary = 0
}

class Linker {
    constructor() {
    }

    public link(files: FSFile[], outputPath: string, exportAs: LinkerExportType) {
        for (const file of files) {
            LoggerManager.The.getLogger("linked").log(`${file.contents}`, LogLevel.Info);
        }
    }
}

BuildPrograms["ld"] = {
    program: (logger, ...args) => {
        const linker = new Linker();
        return ProgramStatus.Success;
    }
};