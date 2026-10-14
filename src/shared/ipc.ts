import type { PatchReport } from "./patchReport";
import type { PluginSettings, SettingsSnapshot } from "./settings";

export const IpcChannel = {
    RendererSource: "mepluh:renderer-source",
    NativePlugins: "mepluh:native-plugins",
    SettingsGet: "mepluh:settings:get",
    SettingsSet: "mepluh:settings:set",
    Relaunch: "mepluh:relaunch",
    OpenPath: "mepluh:open-path",
    PatchReport: "mepluh:patch-report",
    MonacoAssets: "mepluh:monaco-assets",
    PluginInvoke: "mepluh:plugin:invoke",
    PluginEvent: "mepluh:plugin:event"
} as const;

export interface MonacoAssets {
    readonly script: string;
    readonly css: string;
    readonly workers: Readonly<Record<"editor" | "css", string>>;
}

export interface MonacoStyles {
    readonly css: string;
    readonly workers: MonacoAssets["workers"];
}

export type ModLocation = "data" | "customCss";

export type PluginEventListener = (event: string, payload: unknown) => void;

export interface MepluhNative {
    readonly nativePlugins: readonly string[];
    readonly settings: {
        get(): SettingsSnapshot;
        set(plugin: string, settings: PluginSettings): Promise<void>;
    };
    relaunch(): Promise<void>;
    openPath(location: ModLocation): Promise<void>;
    patchReport(): Promise<PatchReport>;
    loadMonaco(): Promise<MonacoStyles>;
    invoke(plugin: string, handler: string, args: readonly unknown[]): Promise<unknown>;
    subscribe(plugin: string, listener: PluginEventListener): () => void;
}
