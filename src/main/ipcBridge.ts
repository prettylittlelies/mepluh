import { app, ipcMain, shell } from "electron";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { IpcChannel, type ModLocation, type MonacoAssets } from "@shared/ipc";
import type { PatchReport } from "@shared/patchReport";
import type { PluginSettings } from "@shared/settings";
import type { ThemeSettings } from "@shared/themes";
import type { NativeRuntime } from "./nativeRuntime";
import type { ModPaths } from "./paths";
import type { SettingsStore } from "./settingsStore";
import type { ThemeService } from "./themes/themeService";

export interface PatchReportSource {
    readonly report: PatchReport;
}

export interface IpcServices {
    readonly paths: ModPaths;
    readonly store: SettingsStore;
    readonly runtime: NativeRuntime;
    readonly patches: PatchReportSource;
    readonly themes: ThemeService;
}

export const registerIpcBridge = ({ paths, store, runtime, patches, themes }: IpcServices): void => {
    const locations: Readonly<Record<ModLocation, string>> = { data: paths.data, customCss: paths.customCss, themes: paths.themes };
    const rendererSource = readFileSync(paths.renderer, "utf8");

    ipcMain.on(IpcChannel.RendererSource, event => {
        event.returnValue = rendererSource;
    });

    ipcMain.on(IpcChannel.NativePlugins, event => {
        event.returnValue = runtime.pluginNames;
    });

    ipcMain.on(IpcChannel.SettingsGet, event => {
        event.returnValue = store.current;
    });

    ipcMain.handle(IpcChannel.SettingsSet, (_event, plugin: string, settings: PluginSettings) => store.update(plugin, settings));

    ipcMain.handle(IpcChannel.Relaunch, () => {
        app.relaunch();
        app.exit(0);
    });

    ipcMain.handle(IpcChannel.OpenPath, async (_event, location: ModLocation) => {
        const failure = await shell.openPath(locations[location]);
        if (failure) throw new Error(failure);
    });

    ipcMain.handle(IpcChannel.PatchReport, () => patches.report);

    let monaco: Promise<MonacoAssets> | undefined;
    const readMonaco = (file: string): Promise<string> => readFile(join(paths.monaco, file), "utf8");
    ipcMain.handle(IpcChannel.MonacoAssets, () =>
        (monaco ??= Promise.all(["monaco.js", "monaco.css", "editor.worker.js", "css.worker.js"].map(readMonaco)).then(([script = "", css = "", editor = "", cssWorker = ""]) => ({
            script,
            css,
            workers: { editor, css: cssWorker }
        })))
    );

    ipcMain.handle(IpcChannel.ThemesList, () => themes.list());
    ipcMain.handle(IpcChannel.ThemesRead, (_event, id: string) => themes.read(id));
    ipcMain.handle(IpcChannel.ThemesFetch, (_event, link: string) => themes.fetchOnline(link));
    ipcMain.handle(IpcChannel.ThemesSet, (_event, settings: ThemeSettings) => store.updateThemes(settings));

    ipcMain.handle(IpcChannel.PluginInvoke, (_event, plugin: string, handler: string, args: readonly unknown[]) => runtime.invoke(plugin, handler, args));
};
