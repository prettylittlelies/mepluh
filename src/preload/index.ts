import { contextBridge, ipcRenderer, webFrame, type IpcRendererEvent } from "electron";
import { IpcChannel, type MepluhNative, type MonacoAssets, type MonacoStyles, type PluginEventListener } from "@shared/ipc";
import type { PatchReport } from "@shared/patchReport";
import type { SettingsSnapshot } from "@shared/settings";
import type { ThemeMeta } from "@shared/themes";

const subscribe = (plugin: string, listener: PluginEventListener): (() => void) => {
    const forward = (_event: IpcRendererEvent, source: string, name: string, payload: unknown): void => {
        if (source === plugin) listener(name, payload);
    };
    ipcRenderer.on(IpcChannel.PluginEvent, forward);
    return () => ipcRenderer.off(IpcChannel.PluginEvent, forward);
};

let monaco: Promise<MonacoStyles> | undefined;

const loadMonaco = (): Promise<MonacoStyles> =>
    (monaco ??= (ipcRenderer.invoke(IpcChannel.MonacoAssets) as Promise<MonacoAssets>).then(async ({ script, css, workers }) => {
        await webFrame.executeJavaScript(script);
        return { css, workers };
    }));

const native: MepluhNative = {
    nativePlugins: ipcRenderer.sendSync(IpcChannel.NativePlugins) as readonly string[],
    settings: {
        get: () => ipcRenderer.sendSync(IpcChannel.SettingsGet) as SettingsSnapshot,
        set: (plugin, settings) => ipcRenderer.invoke(IpcChannel.SettingsSet, plugin, settings) as Promise<void>
    },
    relaunch: () => ipcRenderer.invoke(IpcChannel.Relaunch) as Promise<void>,
    openPath: location => ipcRenderer.invoke(IpcChannel.OpenPath, location) as Promise<void>,
    patchReport: () => ipcRenderer.invoke(IpcChannel.PatchReport) as Promise<PatchReport>,
    loadMonaco,
    themes: {
        list: () => ipcRenderer.invoke(IpcChannel.ThemesList) as Promise<readonly ThemeMeta[]>,
        read: id => ipcRenderer.invoke(IpcChannel.ThemesRead, id) as Promise<string>,
        fetchOnline: link => ipcRenderer.invoke(IpcChannel.ThemesFetch, link) as Promise<string>,
        setSettings: settings => ipcRenderer.invoke(IpcChannel.ThemesSet, settings) as Promise<void>,
        onChanged: listener => {
            const forward = (): void => listener();
            ipcRenderer.on(IpcChannel.ThemesChanged, forward);
            return () => ipcRenderer.off(IpcChannel.ThemesChanged, forward);
        }
    },
    invoke: (plugin, handler, args) => ipcRenderer.invoke(IpcChannel.PluginInvoke, plugin, handler, args),
    subscribe
};

if (location.protocol === "file:" && process.isMainFrame) {
    contextBridge.exposeInMainWorld("MepluhNative", native);
    void webFrame.executeJavaScript(ipcRenderer.sendSync(IpcChannel.RendererSource) as string);
}
