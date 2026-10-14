import type { SettingsTabId } from "@shared/settingsTabs";
import { loadMedalUi } from "../medal/components";
import type { Component } from "../medal/types";
import type { SettingsContext } from "./context";
import { createTabs } from "./tabs";

export interface LazyRoute {
    readonly Component: Component<object>;
}

export type SettingsRouteLoader = (tab: SettingsTabId) => Promise<LazyRoute>;

export const createSettingsRouteLoader = (context: SettingsContext): SettingsRouteLoader => {
    const tabs = createTabs(context);
    return async tab => {
        await loadMedalUi();
        return { Component: tabs[tab] };
    };
};
