export type PatchStatus = "applied" | "failed";

export interface PatchReportEntry {
    readonly plugin: string;
    readonly file: string;
    readonly status: PatchStatus;
    readonly match?: string;
}

export interface PatchReport {
    readonly entries: readonly PatchReportEntry[];
}
