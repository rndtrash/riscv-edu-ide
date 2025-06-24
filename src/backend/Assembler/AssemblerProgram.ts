import { Program, ProgramStatus } from "../BuildSystem/Program";
import { ROM32 } from "../Emulator/Devices/ROM32";
import { assemble } from "./Compiler";
import { tokenize } from "./Tokenizer";

export const AssemblerProgram: Program = (project, ...args: any[]): ProgramStatus => {
    let program: Uint32Array = new Uint32Array();
    try {
        program = new Uint32Array(assemble(tokenize(args[0])).buffer);
    } catch (ex) {
        console.error(ex);
    }

    for (const device of project.machine.masterBus.devices) {
        if (device.info.name === "rom32") {
            const rom = device as ROM32;
            for (let i = 0; i < program.length; i++) {
                rom.setDword(i * 4, program[i]);
            }
            break;
        }
    }

    return ProgramStatus.Success;
};