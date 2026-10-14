import { chunkMarker } from "@shared/chunkPatches";
import { MOD_NAME } from "@shared/constants";
import { definePlugin } from "@shared/plugin";
import { SETTINGS_TABS } from "@shared/settingsTabs";

const routes = SETTINGS_TABS.map(({ id, route }) => `{path:"${route}",lazy:()=>globalThis.Mepluh.loadSettingsRoute("${id}")},`).join("");

const sidebarLinks = (jsx: string, link: string): string =>
    SETTINGS_TABS.map(({ label, route }) => `(0,${jsx}.jsx)(${link},{to:"/settings/${route}",children:"${label}"})`).join(",");

export default definePlugin({
    name: "Settings",
    description: `Adds the ${MOD_NAME} section to Medal's settings, rendered with Medal's own components.`,
    category: "Core",
    enabledByDefault: true,
    required: true,
    patches: [
        {
            find: '{path:"pc-storage",',
            replacement: { match: '{path:"pc-storage",', replace: `${routes}{path:"pc-storage",` }
        },
        {
            find: chunkMarker("renderer-SettingsLayout"),
            replacement: {
                match: /\(0,(\i)\.jsxs\)\((\i),\{children:\[\(0,\i\.jsx\)\((\i),\{children:\(0,\i\.jsx\)\(\i,\{id:"recording",[^]*?\(0,\i\.jsx\)\((\i),\{to:"\/settings\/capture-hotkeys"/,
                replace: `(0,$1.jsxs)($2,{children:[(0,$1.jsx)($3,{children:"${MOD_NAME}"}),${sidebarLinks("$1", "$4")}]}),$&`
            }
        }
    ]
});
