import { ComponentChildren, createContext } from 'preact';
import { useContext, useEffect, useRef, useState } from 'preact/hooks';
import { IMachineWorkerMessage, IMachineWorkerMessageLoad, MachineWorkerMessageTypes } from 'src/backend/Emulator/Machine';

import MachineWorker from 'src/workers/machineWorker?worker';
import { ProjectContextType, useProject } from '../ProjectContext';

interface IMachineManager {
    sendMessage: (message: IMachineWorkerMessage) => void;
    lastMessage: IMachineWorkerMessage | null;
}

const MachineManagerContext = createContext<IMachineManager>(null);

export function reloadMachine(machineContext: IMachineManager, projectContext: ProjectContextType) {
    if (projectContext.project !== null) {
        projectContext.project.resetMachine();
        machineContext.sendMessage({ type: MachineWorkerMessageTypes.Load, machine: projectContext.project.machine.toWorkerExchange() } as IMachineWorkerMessageLoad);
    }
}

export function MachineProvider({ children }: { children: ComponentChildren }) {
    const worker = useRef<Worker>(null);
    const [message, setMessage] = useState<IMachineWorkerMessage | null>(null);

    useEffect(() => {
        const w = new MachineWorker();
        worker.current = w;

        w.onmessage = (e) => {
            setMessage(e.data);
        };

        return () => {
            worker.current.terminate();
        };
    }, []);

    const sendMessage = (msg: IMachineWorkerMessage) => {
        worker.current?.postMessage(msg);
    };

    const project = useProject();
    useEffect(() => {
        if (project.project !== null)
            project.project.machine.shareWith(worker.current);
    }, [project.project]);

    return (
        <MachineManagerContext.Provider value={{ sendMessage, lastMessage: message }}>
            {children}
        </MachineManagerContext.Provider>
    );
}

export function useMachine() {
    return useContext(MachineManagerContext);
}