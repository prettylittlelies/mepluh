import { definePlugin } from "@shared/plugin";

export default definePlugin({
    name: "DevTools",
    description: "Toggles Chromium DevTools for any Medal window with F12 or Ctrl+Shift+I.",
    category: "Developer",
    enabledByDefault: true,
    options: {
        detached: {
            type: "boolean",
            description: "Open DevTools in a separate window",
            default: true
        }
    }
});
