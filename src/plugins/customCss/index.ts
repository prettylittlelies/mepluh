import { definePlugin } from "@shared/plugin";
import { styles } from "@renderer/styleRegistry";
import { CSS_UPDATE_EVENT, READ_CSS_HANDLER } from "./protocol";

const STYLE_ID = "plugin:CustomCSS:user";
let unsubscribe: (() => void) | undefined;

export default definePlugin({
    name: "CustomCSS",
    description: "Live-loads %APPDATA%\\Mepluh\\custom.css into Medal, reapplying on every save.",
    category: "Appearance",
    enabledByDefault: true,
    async start({ channel }) {
        const apply = (css: unknown): void => styles.set(STYLE_ID, String(css));
        unsubscribe = channel.on(CSS_UPDATE_EVENT, apply);
        apply(await channel.invoke<string>(READ_CSS_HANDLER));
    },
    stop() {
        unsubscribe?.();
        unsubscribe = undefined;
        styles.delete(STYLE_ID);
    }
});
