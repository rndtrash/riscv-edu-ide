import { ComponentChildren, createElement, FunctionComponent } from "preact";
import { useState } from "preact/hooks";
import collapseIcon from "src/assets/angle-double-line.svg";
import style from "./TabbedSideBar.module.css";

export function TabbedSideBar(props: {
    tabs: { title: string, component: FunctionComponent<any> }[],
    visibleByDefault?: boolean,
    isLeftSide: boolean
}) {
    const [visible, setVisible] = useState<boolean>(props.visibleByDefault ?? true);
    const [tabIndex, setTabIndex] = useState<number>(0);
    const classList = ["sidebar"];
    if (visible) {
        classList.push("visible");
    }

    return (
        <div class={classList.join(" ")}>
            <div class={`header ${style.t_header}`}>
                <button onClick={() => setVisible(!visible)}><img src={collapseIcon} style={
                    {
                        width: '20px',
                        height: '20px',
                        // Initial rotation of 90 (Up -> Left), +180 for the left side, another +180 if closed
                        rotate: `${90 + (props.isLeftSide ? 0 : 180) + (visible ? 180 : 0)}deg`
                    }
                } /></button>
                {visible && <div class={style.tabs}>
                    {props.tabs.map((tab, index) =>
                        <span
                            class={`${style.tab} ${index === tabIndex ? style.active : ""}`}
                            onClick={() => setTabIndex(index)}>
                            {tab.title}
                        </span>
                    )}
                </div>}
            </div>
            <div class="content">
                {visible && (<>{createElement(props.tabs[tabIndex].component, {})}</>)}
            </div>
        </div>
    );
}