import { definePlugin } from "@shared/plugin";

export default definePlugin({
    name: "NoAutoUpdate",
    description: "Stops Medal from checking for and installing updates, so Mepluh stays injected until you choose to update.",
    category: "Core",
    enabledByDefault: false,
    mainPatches: [
        {
            find: "Started background update checker",
            replacement: { match: "async check(){", replace: "async check(){return null;" }
        }
    ]
});
