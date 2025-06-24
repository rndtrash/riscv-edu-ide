import { Tab } from "./Tab";
import style from "./Tabs.module.css";
import { useTabs } from "./TabsContext";

export function Tabs() {
    const tabManager = useTabs();

    return (
        <div class={style.tabs}>
            {tabManager.tabs.map((tab, index) => <Tab
                onClick={() => tabManager.setTabIndex(index)}
                title={tab.uri}
                active={index === tabManager.currentTabIndex} />)}
        </div>
    );
}