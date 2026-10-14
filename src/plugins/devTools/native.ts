import { app, webContents, type Input, type WebContents } from "electron";
import { defineNative } from "@main/native";
import devTools from ".";

const isToggleChord = (input: Input): boolean =>
    input.type === "keyDown" && (input.key === "F12" || (input.control && input.shift && input.key.toLowerCase() === "i"));

export default defineNative(devTools, {
    start({ options }) {
        const attach = (contents: WebContents): void => {
            contents.on("before-input-event", (event, input) => {
                if (!isToggleChord(input)) return;
                event.preventDefault();
                if (contents.isDevToolsOpened()) contents.closeDevTools();
                else contents.openDevTools({ mode: options.detached ? "detach" : "right" });
            });
        };
        webContents.getAllWebContents().forEach(attach);
        app.on("web-contents-created", (_event, contents) => attach(contents));
    }
});
