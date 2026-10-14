import { app } from "electron";
import { readFileSync } from "node:fs";
import Module from "node:module";
import { join } from "node:path";

interface AppManifest {
    readonly name: string;
    readonly productName?: string;
    readonly main: string;
}

interface InternalApp {
    setAppPath(path: string): void;
}

interface InternalModule {
    _load(request: string, parent: NodeJS.Module | null, isMain: boolean): unknown;
}

export const launchOriginalApp = (asarPath: string): void => {
    const manifest = JSON.parse(readFileSync(join(asarPath, "package.json"), "utf8")) as AppManifest;
    (app as unknown as InternalApp).setAppPath(asarPath);
    app.setName(manifest.productName ?? manifest.name);
    (Module as unknown as InternalModule)._load(join(asarPath, manifest.main), null, true);
};
