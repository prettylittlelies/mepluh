import { join } from "node:path";
import { MOD_NAME, RELOCATED_ASAR } from "@shared/constants";

export interface AppManifest {
    readonly name: string;
    readonly productName?: string;
    readonly version: string;
}

export const STUB_MARKER = `${MOD_NAME.toLowerCase()}Stub`;

const manifest = (original: AppManifest): string =>
    JSON.stringify({ name: original.name, productName: original.productName ?? original.name, version: original.version, main: "index.js", [STUB_MARKER]: true });

const entry = (payload: string): string => `const { join } = require("node:path");
let loaded = false;
try {
    require.resolve(${JSON.stringify(join(payload, "main.js"))});
    loaded = true;
} catch (error) {
    console.error("[${MOD_NAME}] Payload missing, starting Medal unmodded", error);
}
if (loaded) require(${JSON.stringify(join(payload, "main.js"))});
else {
    const asar = join(process.resourcesPath, ${JSON.stringify(RELOCATED_ASAR)});
    require("electron").app.setAppPath(asar);
    require(asar);
}
`;

export const stubFiles = (original: AppManifest, payload: string): Readonly<Record<string, string>> => ({
    "package.json": manifest(original),
    "index.js": entry(payload)
});
