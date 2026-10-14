import windowEffects from "@plugins/windowEffects";
import { settingsPath } from "@shared/settingsTabs";
import type { ThemeMeta, ThemeSource } from "@shared/themes";
import { medalUi } from "../../medal/components";
import type { SettingsContext } from "../context";
import { runAction } from "../hooks";
import { OptionRow } from "../plugins/OptionRow";
import { Card } from "../ui/Card";
import { QuickAction } from "../ui/QuickAction";
import { ThemeCard } from "./ThemeCard";

const WINDOW_OPTION_LABELS: Readonly<Record<keyof typeof windowEffects.options, string>> = {
    material: "Material",
    glassVariant: "Glass variant"
};

const GROUPS: readonly { readonly source: ThemeSource; readonly title: string }[] = [
    { source: "builtin", title: "Built-in Themes" },
    { source: "local", title: "Your Themes" }
];

const FindThemes = () => {
    const { Link, Description } = medalUi().components;
    return (
        <Card className="w-full">
            <span className="text-sm font-semibold text-foreground-0">Find Themes</span>
            <Description>
                Drop any <code>.css</code> file into your themes folder and it appears here instantly. Headers use the BetterDiscord format (<code>@name</code>, <code>@author</code>, <code>@description</code>).
            </Description>
            <div className="flex flex-wrap items-center gap-4">
                <Link href="https://github.com/catppuccin/discord" newWindow>
                    Catppuccin
                </Link>
                <Link href="https://github.com/search?q=medal+theme+css&type=repositories" newWindow>
                    GitHub
                </Link>
            </div>
        </Card>
    );
};

const WindowEffectsSection = ({ context }: { readonly context: SettingsContext }) => {
    const { Section, SectionTitle, Row, Label, Description, Handler, Switch } = medalUi().components;
    const { plugins } = context;
    const settings = plugins.settingsOf(windowEffects);
    return (
        <Section header={<SectionTitle>Window Transparency</SectionTitle>}>
            <Row
                title={<Label>Native backdrop</Label>}
                description={<Description>{windowEffects.description} Requires a restart.</Description>}
                handler={<Handler>{labelId => <Switch aria-labelledby={labelId} checked={settings.enabled} onCheckedChange={enabled => void plugins.setEnabled(windowEffects, enabled)} />}</Handler>}
            />
            {(Object.keys(WINDOW_OPTION_LABELS) as (keyof typeof WINDOW_OPTION_LABELS)[]).map(key => (
                <OptionRow
                    key={key}
                    id={`mepluh-window-effects-${key}`}
                    name={WINDOW_OPTION_LABELS[key]}
                    option={windowEffects.options[key]}
                    value={settings.options[key] ?? windowEffects.options[key].default}
                    onChange={value => void plugins.setOption(windowEffects, key, value)}
                />
            ))}
        </Section>
    );
};

const ThemeGroup = ({ context, title, themes }: { readonly context: SettingsContext; readonly title: string; readonly themes: readonly ThemeMeta[] }) => {
    const { Section, SectionTitle, EmptyState, Icon } = medalUi().components;
    return (
        <Section header={<SectionTitle>{title}</SectionTitle>}>
            {themes.length === 0 ? (
                <EmptyState compact icon={<Icon shape="color-picker" />} header="No themes yet" subtext="Open the themes folder and drop a .css file in." />
            ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {themes.map(theme => (
                        <ThemeCard key={theme.id} theme={theme} enabled={context.themes.isEnabled(theme)} onChange={enabled => void context.themes.setEnabled(theme, enabled)} />
                    ))}
                </div>
            )}
        </Section>
    );
};

export const LocalThemes = ({ context }: { readonly context: SettingsContext }) => {
    const { Section, SectionTitle } = medalUi().components;
    const { themes } = context;
    return (
        <>
            <FindThemes />
            <Section header={<SectionTitle>Quick Actions</SectionTitle>}>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <QuickAction icon="library-filled" label="Open Themes Folder" onClick={() => void runAction(() => MepluhNative.openPath("themes"), "Opened themes folder")} />
                    <QuickAction icon="refresh" label="Reload Themes" onClick={() => void runAction(() => themes.refresh(), "Themes reloaded")} />
                    <QuickAction icon="code" label="Edit Custom CSS" to={settingsPath("css")} />
                </div>
            </Section>
            {GROUPS.map(({ source, title }) => (
                <ThemeGroup key={source} context={context} title={title} themes={themes.themes.filter(theme => theme.source === source)} />
            ))}
            <WindowEffectsSection context={context} />
        </>
    );
};
