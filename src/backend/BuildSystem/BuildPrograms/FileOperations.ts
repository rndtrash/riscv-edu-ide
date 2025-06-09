import {BuildPrograms, ProgramStatus} from "$lib/backend/BuildSystem/Program";

function runCp(...args: any[]): ProgramStatus {
    return ProgramStatus.Failure;
}

function runRm(...args: any[]): ProgramStatus {
    return ProgramStatus.Failure;
}

BuildPrograms["cp"] = {
    program: runCp
};

BuildPrograms["rm"] = {
    program: runRm
};