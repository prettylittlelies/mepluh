import { medalUi } from "../../medal/components";
import type { SettingsContext } from "../context";
import { usePluginManager, useThemeManager } from "../hooks";
import { RestartNotice } from "../ui/RestartNotice";
import { TabPage } from "../ui/TabPage";
import { LocalThemes } from "./LocalThemes";
import { OnlineThemes } from "./OnlineThemes";

const VIEWS = { local: "Local Themes", online: "Online Themes" } as const;

type View = keyof typeof VIEWS;

const isView = (value: string): value is View => value in VIEWS;

export const createThemesTab = (context: SettingsContext) => () => {
    usePluginManager(context.plugins);
    useThemeManager(context.themes);
    const { React, components } = medalUi();
    const { Tabs, TabsList, TabsTrigger } = components;
    const [view, setView] = React.useState<View>("local");
    const enabled = context.themes.themes.filter(theme => context.themes.isEnabled(theme)).length + context.themes.links.length;

    return (
        <TabPage icon="color-picker" title="Themes" description={`${enabled} active. Themes apply instantly to every Medal window; enable several and they stack in order.`}>
            <RestartNotice manager={context.plugins} />
            <Tabs value={view} onValueChange={value => isView(value) && setView(value)} className="w-full">
                <TabsList>
                    {Object.entries(VIEWS).map(([value, label]) => (
                        <TabsTrigger key={value} value={value}>
                            {label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
            {view === "local" ? <LocalThemes context={context} /> : <OnlineThemes themes={context.themes} />}
        </TabPage>
    );
};
