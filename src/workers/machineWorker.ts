import { IMachineWorkerMessage, IMachineWorkerMessageLoad, ISystemWorkerExchange, Machine } from "src/backend/Emulator/Machine";

let machine: Machine;

self.onmessage = (e: MessageEvent<IMachineWorkerMessage>) => {
    console.log("From worker:", e.data);

    switch (e.data.type) {
        case "load":
            {
                const exchange = (e.data as IMachineWorkerMessageLoad).machine;
                machine = Machine.FromWorkerExchange(exchange);
            }
            break;

        case "tick":
            {
                machine.doTick();
            }
            break;
        
        default:
            throw `Unsupported message type ${e.data.type}`;
    }
};

export {};