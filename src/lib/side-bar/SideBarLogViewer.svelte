<script lang="ts">
    import {onMount} from "svelte";
    import {ButtonStatusIcon} from "$lib/side-bar/SideBarTool";
    import {get, writable, type Writable} from "svelte/store";
    import {LoggerManager, LogLevel, NewLoggerEvent, NewLogEntryEvent} from "$lib/backend/Logger";

    type LoggerTab = { lastChecked: number };
    type StateType = {
        active: boolean,
        tabId: string | null,
        tabsStore: Writable<{ tabs: { [id: string]: LoggerTab } }>
    }
    export let state: StateType | null;
    export let iconStatus: Writable<ButtonStatusIcon>;

    const logToButtonStatus: { [logStatus in LogLevel]: ButtonStatusIcon } = {
        [LogLevel.Info]: ButtonStatusIcon.Info,
        [LogLevel.Warning]: ButtonStatusIcon.Warning,
        [LogLevel.Error]: ButtonStatusIcon.Error
    };

    function loggersToTabIds(): { [id: string]: LoggerTab } {
        const tabs: { [id: string]: LoggerTab } = {};
        for (const loggerId in get(LoggerManager.The.loggers).loggers) {
            tabs[loggerId] = {lastChecked: 0};
        }
        return tabs;
    }

    let tabs: Writable<any> | undefined;
    $: tabs = state?.tabsStore;

    onMount(() => {
        // Because of the two-way bind, the `state` becomes null on unmount, so we need to keep another reference to it.
        // Urgh.
        let stateRef: StateType;
        if (state == null) {
            state = {
                active: true,
                tabId: null,
                tabsStore: writable<{ tabs: { [id: string]: LoggerTab } }>({tabs: loggersToTabIds()})
            };
            stateRef = state;
            LoggerManager.The.addEventListener('logger-new', (e) => {
                if (!(e instanceof NewLoggerEvent))
                    return;

                stateRef.tabsStore.update((o) => {
                    o.tabs[e.id] = {lastChecked: 0};
                    return o;
                });

                LoggerManager.The.getLogger(e.id).addEventListener('log-event', (ev) => {
                    if (!(ev instanceof NewLogEntryEvent))
                        return;

                    if (!stateRef.active || stateRef.tabId != e.id)
                        iconStatus.set(logToButtonStatus[ev.entry.severity]);
                });
            });
        } else {
            stateRef = state;
        }
        state.active = true;

        return () => stateRef.active = false;
    });
</script>

{#if (state != null && tabs !== undefined)}
    <div>
        {#each Object.entries($tabs.tabs) as [tabId, logger] (tabId)}
            <div>{LoggerManager.The.getLogger(tabId).name}</div>
        {/each}
    </div>
{/if}