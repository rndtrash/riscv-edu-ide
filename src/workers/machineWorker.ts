import { IMachineWorkerMessage, IMachineWorkerMessageLoad, Machine, MachineWorkerMessageTypes } from "src/backend/Emulator/Machine";

let machine: Machine;
let runner: number | null = null;
let isRunning = false;

self.onmessage = (e: MessageEvent<IMachineWorkerMessage>) => {
    console.log("To worker:", e.data);

    switch (e.data.type) {
        case MachineWorkerMessageTypes.Load:
            {
                const exchange = (e.data as IMachineWorkerMessageLoad).machine;
                machine = Machine.FromWorkerExchange(exchange);
            }
            break;

        case MachineWorkerMessageTypes.Tick:
            {
                machine.doTick();
            }
            break;

        case MachineWorkerMessageTypes.Run:
            {
                if (isRunning) break;

                isRunning = true;

                function run() {
                    machine.doTick();

                    if (!isRunning) {
                        clearInterval(runner);
                        runner = null;
                    }
                }

                runner = setInterval(run, 0);
            }
            break;

        case MachineWorkerMessageTypes.Stop:
            {
                isRunning = false;
            }
            break;

        default:
            throw `Unsupported message type ${e.data.type}`;
    }
};

export { };