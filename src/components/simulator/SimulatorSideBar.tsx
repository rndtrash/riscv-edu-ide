import { TabbedSideBar } from "./TabbedSideBar";
import dashboard from "src/assets/dashboard.svg";
import info from "src/assets/info.svg";
import childArrowLine from "src/assets/child-arrow-line.svg";
import textLine from "src/assets/text-line.svg";
import storageLine from "src/assets/storage-line.svg";
import style from "./SimulatorSideBar.module.css";
import { useProject } from "../ProjectContext";
import { RV32_REGISTERS_COUNT, Rv32CPU } from "src/backend/Emulator/Masters/RISCV32";
import { useEffect, useState } from "preact/hooks";
import { RAM32 } from "src/backend/Emulator/Devices/RAM32";
import { ROM32 } from "src/backend/Emulator/Devices/ROM32";

function Overview() {
    const project = useProject();

    if (!project?.project?.machine) return (<div>Loading...</div>);

    const [registers, setRegisters] = useState<string[]>(Array(RV32_REGISTERS_COUNT));
    const [bus, setBus] = useState({ address: '-', value: '-', direction: '-' });

    function formatHex(n: number): string {
        return '0x' + Number(n).toString(16).padStart(8, '0');
    }

    function getRegister(n: number): string {
        return formatHex((project.project.machine._master as Rv32CPU).getRegister(n));
    }

    useEffect(() => {
        let animationFrameId: number;

        const check = () => {
            const newRegs = Array(RV32_REGISTERS_COUNT);
            for (let i = 0; i < RV32_REGISTERS_COUNT; i++) {
                newRegs[i] = getRegister(i);
            }
            setRegisters(newRegs);

            const newBus = {
                direction: (project.project.machine._masterBus.isRead !== null) ? (project.project.machine._masterBus.isRead ? "Read" : "Write") : "-",
                address: (project.project.machine._masterBus.address !== null) ? formatHex(project.project.machine._masterBus.address) : "-",
                value: (project.project.machine._masterBus.value !== null) ? formatHex(project.project.machine._masterBus.value) : "-"
            };
            setBus(newBus);

            animationFrameId = requestAnimationFrame(check);
        };

        animationFrameId = requestAnimationFrame(check);

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return (
        <div class={style.tabContent}>
            <h5>Machine</h5>
            <div class={style.table3}>
                <img class={style.icon} src={dashboard} />
                <span>Clock speed</span>
                <span class={style.value}>8kHz</span>
                <img class={style.icon} src={info} />
                <span>Machine ID/Version</span>
                <span class={style.value}>243 v1</span>
            </div>
            <h5>Registers</h5>
            <div style={{ display: "flex", flexFlow: "row nowrap", justifyContent: "space-between", gap: "8px" }}>
                <div style={{ display: "grid", flexGrow: "1", gridTemplateColumns: "auto 1fr", gridTemplateRows: "repeat(16, 1fr)" }}>
                    {[...Array(16).keys()].map((r) => <><span>r{r}</span><span class={style.hexValue}>{registers[r]}</span></>)}
                </div>
                <div style={{ display: "grid", flexGrow: "1", gridTemplateColumns: "auto 1fr", gridTemplateRows: "repeat(16, 1fr)" }}>
                    {[...Array(16).keys()].map((r) => <><span>r{r + 16}</span><span class={style.hexValue}>{registers[r + 16]}</span></>)}
                </div>
            </div>
            <h5>Bus</h5>
            <div class={style.table3}>
                <img class={style.icon} src={childArrowLine} />
                <span>Address</span>
                <span class={style.hexValue}>{bus.address}</span>

                <img class={style.icon} src={textLine} />
                <span>Value</span>
                <span class={style.hexValue}>{bus.value}</span>

                <img class={style.icon} src={storageLine} />
                <span>Direction</span>
                <span class={style.value}>{bus.direction}</span>
            </div>
        </div>
    );
}

function Memory() {
    const project = useProject();

    if (!project?.project?.machine) return (<div>Loading...</div>);

    const [memoryDevices, setMemoryDevices] = useState<{ name: string, address: string, contents: Uint32Array }[]>([]);

    function formatHex(n: number): string {
        return '0x' + Number(n).toString(16).padStart(8, '0');
    }

    useEffect(() => {
        let animationFrameId: number;

        const check = () => {
            const memdev: { name: string, address: string, contents: Uint32Array }[] = [];
            project.project.machine._masterBus.devices.forEach((device) => {
                if (device instanceof RAM32) {
                    const ram = device as RAM32;
                    memdev.push({ name: "RAM32", address: formatHex(ram.position), contents: ram.getState() });
                } else if (device instanceof ROM32) {
                    const rom = device as ROM32;
                    memdev.push({ name: "ROM32", address: formatHex(rom.position), contents: rom.getState() });
                }
            });
            setMemoryDevices(memdev);

            animationFrameId = requestAnimationFrame(check);
        };

        animationFrameId = requestAnimationFrame(check);

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    if (!project?.project?.machine) return (<div>Loading...</div>);

    return (
        <div class={style.tabContent}>
            {memoryDevices.map((memdev) => <>
                <h5>{memdev.name} @ <span class={style.hexValue}>{memdev.address}</span></h5>
                <div class={style.table4}>
                    {
                        (() => {
                            let arr = [];
                            for (const value of memdev.contents) {
                                arr.push(<span class={style.hexValue}>{formatHex(value)}</span>);
                            }
                            return arr;
                        })()
                    }
                </div>
            </>)}
        </div>
    );
}

export function SimulatorSideBar() {
    return (<TabbedSideBar
        isLeftSide={false}
        tabs={[
            {
                title: "Overview",
                component: Overview
            },
            {
                title: "Memory",
                component: Memory
            }
        ]}
    />);
}
