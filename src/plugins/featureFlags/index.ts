import { chunkMarker } from "@shared/chunkPatches";
import { definePlugin } from "@shared/plugin";
import { parseOverrides, type FlagMap } from "./overrides";

let overrides: FlagMap = {};

export default definePlugin({
    name: "FeatureFlags",
    description: "Overrides Medal's LaunchDarkly feature flags in both the Redux store and the runtime flag cache.",
    category: "Experimental",
    enabledByDefault: false,
    options: {
        overrides: {
            type: "text",
            label: "Flag overrides",
            description: 'JSON object merged over the remote flags, e.g. {"ads-enabled": false}',
            default: "{}"
        }
    },
    patches: [
        {
            find: "launchDarklyFlags:()=>",
            replacement: {
                match: /(\[\i\]\(\i,(\i)\)\{)(?=return\(0,\i\.default\)\(\i,\2\.flags\))/,
                replace: "$1$2={...$2,flags:$self.apply($2.flags)};"
            }
        },
        {
            find: chunkMarker("renderer-ldFlags"),
            replacement: {
                match: /=\((\i),(\i)\)=>(\i)\[\1\]\?\?\2/,
                replace: "=($1,$2)=>$self.apply($3)[$1]??$2"
            }
        }
    ],
    apply: (flags: FlagMap): FlagMap => ({ ...flags, ...overrides }),
    start({ options, log }) {
        try {
            overrides = parseOverrides(options.overrides);
            log.info("Active overrides", overrides);
        } catch (error) {
            log.error("Ignoring invalid overrides", error);
        }
    },
    stop() {
        overrides = {};
    }
});
