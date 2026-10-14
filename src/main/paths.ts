import { app } from "electron";
import { join } from "node:path";
import { MOD_NAME, PAYLOAD_DIR, RELOCATED_ASAR } from "@shared/constants";

export interface ModPaths {
    readonly data: string;
    readonly settings: string;
    readonly customCss: string;
    readonly preload: string;
    readonly renderer: string;
    readonly monaco: string;
    readonly themes: string;
    readonly builtinThemes: string;
    readonly originalAsar: string;
}

export const resolvePaths = (): ModPaths => {
    const data = join(app.getPath("appData"), MOD_NAME);
    const payload = join(data, PAYLOAD_DIR);
    return {
        data,
        settings: join(data, "settings.json"),
        customCss: join(data, "custom.css"),
        preload: join(payload, "preload.js"),
        renderer: join(payload, "renderer.js"),
        monaco: join(payload, "monaco"),
        themes: join(data, "themes"),
        builtinThemes: join(payload, "themes"),
        originalAsar: join(process.resourcesPath, RELOCATED_ASAR)
    };
};
