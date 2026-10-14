import type { OptionsSchema, OptionValue, ResolvedOptions } from "./options";
import type { PluginDefinition } from "./plugin";
import type { PluginSettings, SettingsSnapshot } from "./settings";
import { DEFAULT_THEME_SETTINGS, type ThemeSettings } from "./themes";

const resolveOptions = <TSchema extends OptionsSchema>(
    schema: TSchema | undefined,
    stored: Readonly<Record<string, OptionValue>> | undefined
): ResolvedOptions<TSchema> => {
    const entries = Object.entries(schema ?? {}).map(([key, option]) => {
        const value = stored?.[key];
        const valid = typeof value === typeof option.default && (option.type !== "select" || option.choices.some(choice => choice.value === value));
        return [key, valid ? value : option.default] as const;
    });
    return Object.fromEntries(entries) as ResolvedOptions<TSchema>;
};

export const resolvePluginSettings = (plugin: PluginDefinition, stored: Partial<PluginSettings> | undefined): PluginSettings => ({
    enabled: plugin.required === true || (stored?.enabled ?? plugin.enabledByDefault),
    options: resolveOptions(plugin.options, stored?.options)
});

const strings = (value: unknown): readonly string[] => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);

export const resolveThemeSettings = (stored: Partial<ThemeSettings> | undefined): ThemeSettings => ({
    enabled: [...new Set(strings(stored?.enabled ?? DEFAULT_THEME_SETTINGS.enabled))],
    links: [...new Set(strings(stored?.links ?? DEFAULT_THEME_SETTINGS.links).map(link => link.trim()).filter(Boolean))]
});

export const resolveSnapshot = (plugins: readonly PluginDefinition[], stored: Partial<SettingsSnapshot> | undefined): SettingsSnapshot => ({
    plugins: Object.fromEntries(plugins.map(plugin => [plugin.name, resolvePluginSettings(plugin, stored?.plugins?.[plugin.name])])),
    themes: resolveThemeSettings(stored?.themes)
});

export const optionsOf = <TSchema extends OptionsSchema>(plugin: PluginDefinition<TSchema>, snapshot: SettingsSnapshot): ResolvedOptions<TSchema> =>
    (snapshot.plugins[plugin.name]?.options ?? resolvePluginSettings(plugin, undefined).options) as ResolvedOptions<TSchema>;

export const isEnabled = (plugin: PluginDefinition, snapshot: SettingsSnapshot): boolean =>
    plugin.required === true || (snapshot.plugins[plugin.name]?.enabled ?? plugin.enabledByDefault);
