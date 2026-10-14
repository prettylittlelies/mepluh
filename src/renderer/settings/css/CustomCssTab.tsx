import customCss from "@plugins/customCss";
import { READ_CSS_HANDLER, WRITE_CSS_HANDLER } from "@plugins/customCss/protocol";
import { MonacoEditor } from "../../editor/MonacoEditor";
import { medalUi } from "../../medal/components";
import type { RendererPluginManager } from "../../pluginManager";
import type { SettingsContext } from "../context";
import { runAction, useAsync, usePluginManager } from "../hooks";
import { Card } from "../ui/Card";
import { RestartNotice } from "../ui/RestartNotice";
import { TabPage } from "../ui/TabPage";

const AUTOSAVE_DELAY_MS = 400;

type SaveState = "saved" | "pending" | "saving" | "failed";

const saveBadges = {
    saved: { variant: "success", label: "Saved" },
    pending: { variant: "warning", label: "Unsaved" },
    saving: { variant: "info", label: "Saving…" },
    failed: { variant: "danger", label: "Save failed" }
} as const satisfies Record<SaveState, { readonly variant: string; readonly label: string }>;

const invoke = <T,>(handler: string, ...args: readonly unknown[]): Promise<T> => MepluhNative.invoke(customCss.name, handler, args) as Promise<T>;

const useAutosave = (): readonly [SaveState, (css: string) => void, (css: string) => void] => {
    const { React } = medalUi();
    const [state, setState] = React.useState<SaveState>("saved");
    const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const save = React.useCallback((css: string) => {
        clearTimeout(timer.current);
        setState("saving");
        invoke(WRITE_CSS_HANDLER, css).then(
            () => setState("saved"),
            () => setState("failed")
        );
    }, []);

    const schedule = React.useCallback(
        (css: string) => {
            setState("pending");
            clearTimeout(timer.current);
            timer.current = setTimeout(() => save(css), AUTOSAVE_DELAY_MS);
        },
        [save]
    );

    React.useEffect(() => () => clearTimeout(timer.current), []);
    return [state, schedule, save];
};

const Editor = ({ initial, onReload }: { readonly initial: string; readonly onReload: () => void }) => {
    const { Section, SectionTitle, Button, Icon, Badge } = medalUi().components;
    const [saveState, schedule, save] = useAutosave();
    const badge = saveBadges[saveState];

    const header = (
        <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
                <SectionTitle>custom.css</SectionTitle>
                <Badge variant={badge.variant}>{badge.label}</Badge>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="secondary" size="md" onClick={() => void runAction(() => MepluhNative.openPath("customCss"), "Opened in your editor")}>
                    <Icon shape="external-link" size={16} />
                    Open externally
                </Button>
                <Button variant="secondary" size="md" onClick={onReload}>
                    <Icon shape="refresh" size={16} />
                    Reload from disk
                </Button>
            </div>
        </div>
    );

    return (
        <Section header={header}>
            <MonacoEditor value={initial} language="css" onChange={schedule} onSave={save} />
        </Section>
    );
};

const DisabledState = ({ manager }: { readonly manager: RendererPluginManager }) => {
    const { EmptyState, Icon, Button } = medalUi().components;
    return (
        <Card className="w-full">
            <EmptyState
                icon={<Icon shape="code" />}
                header="CustomCSS is turned off"
                subtext="Enable the CustomCSS plugin and restart Medal to edit styles here."
                button={
                    <Button variant="brand" size="md" onClick={() => void manager.setEnabled(customCss, true)}>
                        Enable CustomCSS
                    </Button>
                }
            />
        </Card>
    );
};

export const createCustomCssTab = ({ plugins: manager }: SettingsContext) => () => {
    usePluginManager(manager);
    const { Skeleton, ErrorText } = medalUi().components;
    const active = manager.settingsOf(customCss).enabled && !manager.needsRestart;
    const [css, reload] = useAsync(() => (active ? invoke<string>(READ_CSS_HANDLER) : Promise.resolve("")), [active]);

    const body = (() => {
        if (!active) return <DisabledState manager={manager} />;
        switch (css.status) {
            case "loading":
                return <Skeleton className="h-96 w-full" />;
            case "error":
                return <ErrorText>{css.error}</ErrorText>;
            case "ready":
                return <Editor key={css.value} initial={css.value} onReload={reload} />;
        }
    })();

    return (
        <TabPage icon="code" title="Custom CSS" description="A full Monaco editor with CSS IntelliSense. Changes autosave and apply live to every Medal window; Ctrl+S saves instantly.">
            <RestartNotice manager={manager} />
            {body}
        </TabPage>
    );
};
