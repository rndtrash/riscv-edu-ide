import { IMachineWorkerMessageRun, IMachineWorkerMessageStop, IMachineWorkerMessageTick, MachineWorkerMessageTypes } from "src/backend/Emulator/Machine";
import { reloadMachine, useMachine } from "./MachineContext";
import { useState } from "preact/hooks";
import { useProject } from "../ProjectContext";
import { AssemblerProgram } from "src/backend/Assembler/AssemblerProgram";

export function SimulatorControls() {
    const machine = useMachine();
    const project = useProject();

    if (!project.project) return (<div></div>);

    const [isRunning, setRunning] = useState(false);

    return (
        <div style={{ display: "flex", alignItems: "stretch", gap: "4px" }}>
            <button onClick={async () => {
                // TODO:
                project.project.builder.run(project.project);

                reloadMachine(machine, project);

                const asmHandle = await project.projectFolder.getFileHandle("main.s");
                const asmFile = await asmHandle.getFile();
                const asmText = await asmFile.text();
                AssemblerProgram(project.project, asmText);
            }}>BUILD</button>

            <button onClick={() => {
                if (isRunning)
                    machine.sendMessage({ type: MachineWorkerMessageTypes.Stop } as IMachineWorkerMessageStop);
                else
                    machine.sendMessage({ type: MachineWorkerMessageTypes.Run } as IMachineWorkerMessageRun);

                setRunning(!isRunning);
            }}>{isRunning ? "STOP" : "RUN"}</button>
            <button onClick={() => {
                machine.sendMessage({ type: MachineWorkerMessageTypes.Tick } as IMachineWorkerMessageTick);
            }}>STEP</button>
        </div>
    );
}