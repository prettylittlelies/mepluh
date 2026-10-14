import { app, BrowserWindow } from "electron";
import { defineNative } from "@main/native";
import windowEffects, { NATIVE_BACKDROP, WINDOW_MATERIALS, type WindowMaterial } from ".";

const MAIN_RENDERER = "renderer.min.html";
const TRANSPARENT = "#00000000";

const isMaterial = (value: string): value is WindowMaterial => WINDOW_MATERIALS.some(material => material.value === value);

const isMainWindow = (window: BrowserWindow): boolean => !window.isDestroyed() && window.webContents.getURL().endsWith(MAIN_RENDERER);

export default defineNative(windowEffects, {
    start({ options, log }) {
        const material = NATIVE_BACKDROP[isMaterial(options.material) ? options.material : "liquid-glass"];
        const apply = (window: BrowserWindow): void => {
            if (!isMainWindow(window)) return;
            window.setBackgroundColor(TRANSPARENT);
            window.setBackgroundMaterial(material);
            log.info(`Applied ${material} backdrop`);
        };
        const track = (window: BrowserWindow): void => {
            window.webContents.on("did-finish-load", () => apply(window));
            apply(window);
        };
        BrowserWindow.getAllWindows().forEach(track);
        app.on("browser-window-created", (_event, window) => track(window));
    }
});
