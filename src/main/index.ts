import { app, session } from "electron";
import { PRELOAD_ID } from "@shared/constants";
import { IpcChannel } from "@shared/ipc";
import { Logger } from "@shared/logger";
import { SourcePatcher } from "@shared/patcher";
import { isEnabled } from "@shared/settingsResolver";
import { plugins } from "@plugins";
import { natives } from "@plugins/natives";
import { registerIpcBridge } from "./ipcBridge";
import { NativeRuntime } from "./nativeRuntime";
import { NodeRequestGuard } from "./network/nodeRequestGuard";
import { RequestBlocker } from "./network/requestBlocker";
import { launchOriginalApp } from "./originalApp";
import { resolvePaths } from "./paths";
import { MainModulePatcher } from "./patching/mainModulePatcher";
import { PatchLedger } from "./patching/patchLedger";
import { PatchedFileProtocol } from "./patching/patchedFileProtocol";
import { SettingsStore } from "./settingsStore";
import { ThemeService } from "./themes/themeService";

const log = new Logger("main");
const paths = resolvePaths();
const debuggingPort = process.env["MEPLUH_REMOTE_DEBUGGING_PORT"];

if (debuggingPort) app.commandLine.appendSwitch("remote-debugging-port", debuggingPort);

try {
    const store = new SettingsStore(paths.settings, plugins, log.child("settings"));
    const enabled = plugins.filter(plugin => isEnabled(plugin, store.current));
    const runtime = new NativeRuntime(natives, store, paths, log.child("native"));
    const ledger = new PatchLedger(paths.originalAsar, log.child("patcher"));
    const fileProtocol = new PatchedFileProtocol(new SourcePatcher(enabled, "renderer"), ledger, log.child("patcher"));
    const blocker = new RequestBlocker(runtime.blocklists, log.child("network"));
    const themes = new ThemeService({ builtin: paths.builtinThemes, local: paths.themes }, log.child("themes"));

    globalThis.MepluhMain = { plugin: name => runtime.hooksOf(name) };
    registerIpcBridge({ paths, store, runtime, patches: ledger, themes });
    new MainModulePatcher(new SourcePatcher(enabled, "main"), ledger).hook();
    fileProtocol.hook();
    new NodeRequestGuard(blocker.urls, log.child("network:node")).install();

    app.once("ready", () => {
        blocker.install();
        session.defaultSession.registerPreloadScript({ id: PRELOAD_ID, type: "frame", filePath: paths.preload });
        fileProtocol.installFallback();
        runtime.start();
        themes.watch(() => runtime.broadcastCore(IpcChannel.ThemesChanged));
        log.info(`Loaded ${enabled.length}/${plugins.length} plugins:`, enabled.map(plugin => plugin.name).join(", "));
    });
} catch (error) {
    log.error("Initialisation failed, continuing unmodded", error);
}

launchOriginalApp(paths.originalAsar);
