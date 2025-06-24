import { Tab } from "./Tab";
import style from "./Tabs.module.css";
import { closeTab, useTabs } from "./TabsContext";

export function Tabs() {
    const tabManager = useTabs();

    return (
        <div class={style.tabs}>
            {tabManager.tabs.map((tab, index) => <Tab
                key={tab.uri}
                onClick={() => tabManager.setTabIndex(index)}
                onClose={() => closeTab(tabManager, tab.uri)}
                title={tab.uri}
                active={index === tabManager.currentTabIndex} />)}
        </div>
    );
}