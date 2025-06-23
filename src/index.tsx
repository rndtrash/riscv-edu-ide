import { ComponentChildren, render } from 'preact';
import { signal } from '@preact/signals';
import { useEffect } from 'preact/hooks';

import MachineWorker from 'src/workers/machineWorker?worker';
import { IMachineWorkerMessageTick, Machine } from 'src/backend/Emulator/Machine';
import { ZeroToZero } from 'src/backend/Emulator/Masters/ZeroToZero';
import { ConsoleLog } from 'src/backend/Emulator/Devices/ConsoleLog';
import { ProjectSelect } from 'src/components/ProjectSelect';
import { Tabs } from 'src/components/Tabs';
import { FileSystemProvider, useFileSystem } from 'src/components/FileSystemContext';

import 'src/colors.css';
import 'src/style.css';
import { SideBar } from './components/sidebars/SideBar';
import { ProjectProvider } from './components/ProjectContext';
import { FileBrowserSideBar } from './components/sidebars/FileBrowserSideBar';
import { EditorContainer } from './components/editors/EditorContainer';

export function App() {
	return (
		<FileSystemProvider>
			<LoadingBarrier>
				<ProjectProvider>
					<main>
						<nav>
							<ProjectSelect />
							<Tabs />
						</nav>
						<FileBrowserSideBar />
						<EditorContainer />
						<SideBar title="Status" isLeftSide={false}>
							<div>Test</div>
						</SideBar>
					</main>
				</ProjectProvider>
			</LoadingBarrier>
		</FileSystemProvider>
	);
}

function LoadingBarrier(props: { children: ComponentChildren }) {
	const { rootDir } = useFileSystem();
	return rootDir ? <>{props.children}</> : <p>Loading, please wait...</p>;
}

render(<App />, document.getElementById('app'));
