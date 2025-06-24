import { ComponentChildren, createContext, FunctionComponent } from "preact";
import { Dispatch, StateUpdater, useContext, useState } from "preact/hooks";
import { ITab } from "./Tab";
import { EditorProjectSettings } from "./editors/EditorProjectSettings";
import { EditorMonaco } from "./editors/EditorMonaco";

interface TabsContextType {
    tabs: ITab[];
    setTabs: Dispatch<StateUpdater<ITab[]>>;
    currentTabIndex: number;
    setTabIndex: Dispatch<StateUpdater<number>>;
};

const TabsContext = createContext<TabsContextType>({
    tabs: [],
    setTabs: null,
    currentTabIndex: -1,
    setTabIndex: null
});

export function openTab(context: TabsContextType, uri: string) {
    for (const [index, tab] of context.tabs.entries()) {
        if (tab.uri === uri) {
            context.setTabIndex(index);
            return;
        }
    }

    const newTabs = [...context.tabs, { uri, editor: getEditor(uri), context: {} } as ITab];
    context.setTabs(newTabs);
    context.setTabIndex(newTabs.length - 1);
}

export function getEditor(uri: string): FunctionComponent<any> {
    if (uri.endsWith(".rvedu")) {
        return EditorProjectSettings;
    }

    return EditorMonaco;
}

export function getCurrentTab(context: TabsContextType): ITab | null {
    if (context.currentTabIndex >= 0 && context.currentTabIndex < context.tabs.length) {
        return context.tabs[context.currentTabIndex];
    }

    return null;
}

export function TabsProvider({ children }: { children: ComponentChildren }) {
    const [tabs, setTabs] = useState<ITab[]>([]);
    const [currentTabIndex, setTabIndex] = useState<number>(-1);

    return (
        <TabsContext.Provider value={{ tabs, setTabs, currentTabIndex, setTabIndex }}>
            {children}
        </TabsContext.Provider>
    );
}

export function useTabs() {
    return useContext(TabsContext);
}