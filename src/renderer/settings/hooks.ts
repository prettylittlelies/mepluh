import { medalUi } from "../medal/components";
import type { RendererPluginManager } from "../pluginManager";
import type { ThemeManager } from "../themeManager";

export type AsyncState<T> = { readonly status: "loading" } | { readonly status: "ready"; readonly value: T } | { readonly status: "error"; readonly error: string };

export const usePluginManager = (manager: RendererPluginManager): number =>
    medalUi().React.useSyncExternalStore(manager.subscribe, () => manager.version);

export const useThemeManager = (themes: ThemeManager): number => medalUi().React.useSyncExternalStore(themes.subscribe, () => themes.version);

export const useAsync = <T>(load: () => Promise<T>, dependencies: readonly unknown[]): readonly [AsyncState<T>, () => void] => {
    const { React } = medalUi();
    const [state, setState] = React.useState<AsyncState<T>>({ status: "loading" });
    const [generation, setGeneration] = React.useState(0);

    React.useEffect(() => {
        let active = true;
        setState({ status: "loading" });
        load().then(
            value => active && setState({ status: "ready", value }),
            (error: unknown) => active && setState({ status: "error", error: error instanceof Error ? error.message : String(error) })
        );
        return () => {
            active = false;
        };
    }, [generation, ...dependencies]);

    return [state, () => setGeneration(previous => previous + 1)];
};

export const runAction = async (action: () => Promise<unknown>, success: string): Promise<void> => {
    const { toast } = medalUi();
    try {
        await action();
        toast({ variant: "success", title: success });
    } catch (error) {
        toast({ variant: "error", title: "Something went wrong", description: error instanceof Error ? error.message : String(error) });
    }
};
