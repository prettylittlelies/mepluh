import { existsSync } from "node:fs";
import { cp, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import { readAsarFile, writeFlatAsar } from "./asar";
import type { AsarPair, InstallLocations } from "./locations";
import { stopMedal } from "./medalProcess";
import { STUB_MARKER, stubFiles, type AppManifest } from "./stub";

export type InjectionState = "missing-medal" | "clean" | "injected" | "foreign";

const BUILD_ARTIFACTS = ["main.js", "preload.js", "renderer.js", "monaco/monaco.js", "monaco/monaco.css", "monaco/editor.worker.js", "monaco/css.worker.js"] as const;

const readManifest = async (archive: string): Promise<AppManifest & Readonly<Record<string, unknown>>> =>
    JSON.parse((await readAsarFile(archive, "package.json")).toString("utf8")) as AppManifest & Readonly<Record<string, unknown>>;

const movePair = async (from: AsarPair, to: AsarPair): Promise<void> => {
    await rename(from.archive, to.archive);
    if (existsSync(from.unpacked)) await rename(from.unpacked, to.unpacked);
};

export class Injector {
    public constructor(private readonly locations: InstallLocations) {}

    public async state(): Promise<InjectionState> {
        const { entry, relocated } = this.locations;
        if (!existsSync(entry.archive)) return "missing-medal";
        const isStub = await readManifest(entry.archive).then(manifest => manifest[STUB_MARKER] === true, () => false);
        if (isStub) return existsSync(relocated.archive) ? "injected" : "foreign";
        return existsSync(relocated.archive) ? "foreign" : "clean";
    }

    public async install(): Promise<void> {
        const state = await this.state();
        if (state === "missing-medal") throw new Error(`Medal not found at ${this.locations.entry.archive}`);
        if (state === "foreign") throw new Error(`${this.locations.relocated.archive} exists but was not created by this installer`);
        this.assertBuilt();

        await stopMedal();
        await this.deployPayload();
        if (state === "clean") await movePair(this.locations.entry, this.locations.relocated);
        await writeFlatAsar(this.locations.entry.archive, stubFiles(await readManifest(this.locations.relocated.archive), this.locations.payload));
    }

    public async uninstall(): Promise<boolean> {
        const state = await this.state();
        if (state === "foreign") throw new Error("Medal's resources were modified by something else, refusing to touch them");
        if (state !== "injected") return false;
        await stopMedal();
        await rm(this.locations.entry.archive, { force: true });
        await movePair(this.locations.relocated, this.locations.entry);
        return true;
    }

    private async deployPayload(): Promise<void> {
        await rm(this.locations.payload, { recursive: true, force: true });
        await cp(this.locations.build, this.locations.payload, { recursive: true });
    }

    private assertBuilt(): void {
        const missing = BUILD_ARTIFACTS.filter(file => !existsSync(join(this.locations.build, file)));
        if (missing.length > 0) throw new Error(`Missing build output (${missing.join(", ")}), run "bun run build" first`);
    }
}
