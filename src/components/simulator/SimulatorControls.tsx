import { IMachineWorkerMessageRun, IMachineWorkerMessageStop, IMachineWorkerMessageTick, MachineWorkerMessageTypes } from "src/backend/Emulator/Machine";
import { useMachine } from "./MachineContext";
import { useState } from "preact/hooks";
import { useProject } from "../ProjectContext";

export function SimulatorControls() {
    const machine = useMachine();
    const project = useProject();

    if (!project.project) return (<div></div>);

    const [isRunning, setRunning] = useState(false);

    return (
        <div style={{ display: "flex", alignItems: "stretch", gap: "4px" }}>
            <button onClick={() => {
                project.project.builder.run(project.project);
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