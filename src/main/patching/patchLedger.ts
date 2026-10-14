import { normalize, sep } from "node:path";
import type { Logger } from "@shared/logger";
import type { SourcePatcher } from "@shared/patcher";
import type { PatchReport, PatchReportEntry } from "@shared/patchReport";

export class PatchLedger {
    private readonly root: string;
    private readonly entries: PatchReportEntry[] = [];

    public constructor(
        asarPath: string,
        private readonly log: Logger
    ) {
        this.root = normalize(asarPath + sep).toLowerCase();
    }

    public get report(): PatchReport {
        return { entries: [...this.entries] };
    }

    public owns(path: string): boolean {
        return normalize(path).toLowerCase().startsWith(this.root);
    }

    public transform(patcher: SourcePatcher, path: string, original: string): string {
        const relative = normalize(path).slice(this.root.length);
        const { source, applied, failures } = patcher.apply(original);
        if (applied.length > 0) this.log.info(`Patched ${relative} via`, applied.join(", "));
        failures.forEach(({ plugin, match }) => this.log.warn(`${plugin}: no match for ${match} in ${relative}`));
        this.entries.push(
            ...applied.map(plugin => ({ plugin, file: relative, status: "applied" as const })),
            ...failures.map(({ plugin, match }) => ({ plugin, file: relative, status: "failed" as const, match }))
        );
        return source;
    }
}
