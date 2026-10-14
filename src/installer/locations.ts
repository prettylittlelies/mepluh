import { join } from "node:path";
import { ENTRY_ASAR, MOD_NAME, PAYLOAD_DIR, RELOCATED_ASAR, UNPACKED_SUFFIX } from "@shared/constants";

export interface AsarPair {
    readonly archive: string;
    readonly unpacked: string;
}

export interface InstallLocations {
    readonly entry: AsarPair;
    readonly relocated: AsarPair;
    readonly payload: string;
    readonly build: string;
}

const requireEnv = (name: string): string => {
    const value = process.env[name];
    if (!value) throw new Error(`Environment variable ${name} is not set`);
    return value;
};

const asarPair = (archive: string): AsarPair => ({ archive, unpacked: archive + UNPACKED_SUFFIX });

export const resolveLocations = (medalRoot = join(requireEnv("LOCALAPPDATA"), "Medal")): InstallLocations => {
    const resources = join(medalRoot, "current", "resources");
    return {
        entry: asarPair(join(resources, ENTRY_ASAR)),
        relocated: asarPair(join(resources, RELOCATED_ASAR)),
        payload: join(requireEnv("APPDATA"), MOD_NAME, PAYLOAD_DIR),
        build: join(import.meta.dir, "..", "..", "dist")
    };
};
