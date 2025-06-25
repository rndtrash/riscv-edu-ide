import { describe, it, expect } from 'vitest';
import { Machine } from 'src/backend/Emulator/Machine';
import { ZeroToZero } from 'src/backend/Emulator/Masters/ZeroToZero';
import { ConsoleLog } from 'src/backend/Emulator/Devices/ConsoleLog';

describe('simulator', () => {
	let machine: Machine;
    it('runs with default setup', () => {
        expect(() => {
        	machine = Machine.FromMasterDevices(ZeroToZero.fromContext(undefined), [ConsoleLog.fromContext(undefined)]);
        }).not.toThrowError();
    });
    it('can tick', () => {
        expect(() => {
        	for (const i of Array(10)) {
        		machine.doTick();
        	}
        }).not.toThrowError();
    });
});
