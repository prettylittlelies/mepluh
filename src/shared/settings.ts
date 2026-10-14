import type { OptionValue } from "./options";

export interface PluginSettings {
    readonly enabled: boolean;
    readonly options: Readonly<Record<string, OptionValue>>;
}

export interface SettingsSnapshot {
    readonly plugins: Readonly<Record<string, PluginSettings>>;
}
