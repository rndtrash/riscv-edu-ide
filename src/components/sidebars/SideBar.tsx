import { ComponentChildren } from "preact";
import { useState } from "preact/hooks";
import collapseIcon from "src/assets/angle-double-line.svg";

export function SideBar(props: {
    title: string,
    visibleByDefault?: boolean,
    isLeftSide: boolean,
    children: ComponentChildren
}) {
    const [visible, setVisible] = useState<boolean>(props.visibleByDefault ?? true);
    const classList = ["sidebar"];
    if (visible) {
        classList.push("visible");
    }

    return (
        <div class={classList.join(" ")}>
            <div class="header">
                {visible && <span>{props.title}</span>}
                <button onClick={() => setVisible(!visible)}><img src={collapseIcon} style={
                    {
                        width: '20px',
                        height: '20px',
                        // Initial rotation of 90 (Up -> Left), +180 for the left side, another +180 if closed
                        rotate: `${90 + (props.isLeftSide ? 0 : 180) + (visible ? 180 : 0)}deg`
                    }
                } /></button>
            </div>
            <div class="content">
                {visible && (<>{props.children}</>)}
            </div>
        </div>
    );
}