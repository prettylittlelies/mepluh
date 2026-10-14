import type { OptionValue } from "./options";
import type { ThemeSettings } from "./themes";

export interface PluginSettings {
    readonly enabled: boolean;
    readonly options: Readonly<Record<string, OptionValue>>;
}

export interface SettingsSnapshot {
    readonly plugins: Readonly<Record<string, PluginSettings>>;
    readonly themes: ThemeSettings;
}
