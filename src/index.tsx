import { render } from 'preact';
import { signal } from '@preact/signals';
import { useEffect } from 'preact/hooks';

import MachineWorker from 'src/workers/machineWorker?worker';
import { IMachineWorkerMessageTick, Machine } from 'src/backend/Emulator/Machine';
import { ZeroToZero } from 'src/backend/Emulator/Masters/ZeroToZero';
import { ConsoleLog } from 'src/backend/Emulator/Devices/ConsoleLog';
import './style.css';

const testMachine = Machine.FromMasterDevices(ZeroToZero.fromContext(undefined), [ConsoleLog.fromContext(undefined)]);
console.log(testMachine.toWorkerExchange());

const worker = new MachineWorker();
testMachine.shareWith(worker);
const machineState = signal("");
// worker.onmessage = (e: MessageEvent<typeof testSignal.value>) => {
// 	testSignal.value = e.data;
// };

function tick() {
	const message: IMachineWorkerMessageTick = { type: "tick" };
	worker.postMessage(message);
}

export function App() {
	useEffect(() => {
		let animationFrameId: number;

		const check = () => {
			const state = testMachine._masterBus.getState();
			const s = JSON.stringify(state);
			if (machineState.value !== s) {
				machineState.value = s;
			}

			animationFrameId = requestAnimationFrame(check);
		};

		animationFrameId = requestAnimationFrame(check);

		return () => cancelAnimationFrame(animationFrameId);
	}, []);

	return (
		<div>
			тест {machineState}
			<br></br>
			<button onClick={() => tick()}>Tick</button>
		</div>
	);
}

function Resource(props) {
	return (
		<a href={props.href} target="_blank" class="resource">
			<h2>{props.title}</h2>
			<p>{props.description}</p>
		</a>
	);
}

render(<App />, document.getElementById('app'));
