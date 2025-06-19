import { render } from 'preact';
import { signal } from '@preact/signals';
import { useEffect } from 'preact/hooks';

import MachineWorker from 'src/workers/machineWorker?worker';
import { IMachineWorkerMessageTick, Machine } from 'src/backend/Emulator/Machine';
import { ZeroToZero } from 'src/backend/Emulator/Masters/ZeroToZero';
import { ConsoleLog } from 'src/backend/Emulator/Devices/ConsoleLog';
import { ProjectSelect } from 'src/components/ProjectSelect';
import { Tabs } from 'src/components/Tabs';

import 'src/colors.css';
import 'src/style.css';

export function App() {
	return (
		<main>
			<nav>
				<ProjectSelect/>
				<Tabs/>
			</nav>
			<div class="sidebar">Files</div>
			<div class="editor"></div>
			<div class="sidebar">Status</div>
		</main>
	);
}

render(<App />, document.getElementById('app'));
