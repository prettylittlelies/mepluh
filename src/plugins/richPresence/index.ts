import { definePlugin } from "@shared/plugin";

const TEMPLATE_HINT = "Leave empty to keep Medal's text. Use {details}, {state} and {game} to include Medal's own values.";

export default definePlugin({
    name: "RichPresence",
    description: "Customizes Medal's Discord Rich Presence. Medal still decides when to show, update and clear it; this only edits what it says.",
    category: "Appearance",
    enabledByDefault: false,
    options: {
        details: { type: "string", label: "Top line", description: TEMPLATE_HINT, default: "" },
        state: { type: "string", label: "Bottom line", description: TEMPLATE_HINT, default: "" },
        showElapsed: { type: "boolean", label: "Elapsed time", description: "Show how long you have been playing", default: true },
        showMedalBadge: { type: "boolean", label: "Medal badge", description: "Show the small Medal icon on the game art", default: true },
        showFollowButton: { type: "boolean", label: "Follow button", description: 'Show the "Follow on Medal" button', default: true },
        showDownloadButton: { type: "boolean", label: "Download button", description: 'Show the "Download Medal" button', default: true }
    },
    mainPatches: [
        {
            find: "Pushing activity update through RPC",
            replacement: {
                match: /(await \i\.setActivity\()(\i)(?=\)\}catch\(\i\)\{\i\("setActivity")/,
                replace: "$1$self?.customize?.($2)??$2"
            }
        }
    ]
});
