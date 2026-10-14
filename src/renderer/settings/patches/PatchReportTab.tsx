import type { PatchReportEntry } from "@shared/patchReport";
import { medalUi } from "../../medal/components";
import type { SettingsContext } from "../context";
import { useAsync } from "../hooks";
import { StatTile } from "../ui/StatTile";
import { TabPage } from "../ui/TabPage";

const ALL = "all";

const EntryRow = ({ entry }: { readonly entry: PatchReportEntry }) => {
    const { Row, Label, Description, Badge } = medalUi().components;
    return (
        <Row
            title={
                <div className="flex items-center gap-2">
                    <Badge variant={entry.status === "applied" ? "success" : "danger"}>{entry.status === "applied" ? "Applied" : "Failed"}</Badge>
                    <Label>{entry.plugin}</Label>
                </div>
            }
            description={<Description>{entry.match ? `${entry.file}: no match for ${entry.match}` : entry.file}</Description>}
        />
    );
};

const ReportBody = ({ entries, onRefresh }: { readonly entries: readonly PatchReportEntry[]; readonly onRefresh: () => void }) => {
    const { React, components } = medalUi();
    const { Section, SectionTitle, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Button, Icon, EmptyState } = components;
    const [plugin, setPlugin] = React.useState(ALL);
    const plugins = [...new Set(entries.map(entry => entry.plugin))];
    const visible = entries.filter(entry => plugin === ALL || entry.plugin === plugin);

    const header = (
        <div className="flex items-center justify-between gap-3">
            <SectionTitle>Loaded chunks</SectionTitle>
            <div className="flex items-center gap-2">
                <Select value={plugin} onValueChange={setPlugin}>
                    <SelectTrigger className="w-48" aria-label="Filter by plugin">
                        <SelectValue>{plugin === ALL ? "All plugins" : plugin}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>All plugins</SelectItem>
                        {plugins.map(name => (
                            <SelectItem key={name} value={name}>
                                {name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="secondary" size="md" onClick={onRefresh}>
                    <Icon shape="refresh" size={16} />
                    Refresh
                </Button>
            </div>
        </div>
    );

    return (
        <>
            <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3">
                <StatTile icon="layout" label="Patched chunks" value={new Set(entries.map(entry => entry.file)).size} />
                <StatTile icon="check-circle-filled" label="Applied" value={entries.filter(entry => entry.status === "applied").length} />
                <StatTile icon="warning-filled" label="Failed" value={entries.filter(entry => entry.status === "failed").length} />
            </div>
            <Section header={header}>
                {visible.length === 0 ? (
                    <EmptyState compact icon={<Icon shape="info" />} header="Nothing patched yet" subtext="Chunks are patched as Medal loads them. Browse Medal and refresh." />
                ) : (
                    visible.map(entry => <EntryRow key={`${entry.plugin}:${entry.file}:${entry.match ?? ""}`} entry={entry} />)
                )}
            </Section>
        </>
    );
};

export const createPatchReportTab = (_context: SettingsContext) => () => {
    const { Skeleton, ErrorText } = medalUi().components;
    const [report, refresh] = useAsync(() => MepluhNative.patchReport(), []);

    return (
        <TabPage icon="stats" title="Patch Report" description="Every patch applied to Medal's code this session, and any that failed to match after an update.">
            {report.status === "loading" && <Skeleton className="h-64 w-full" />}
            {report.status === "error" && <ErrorText>{report.error}</ErrorText>}
            {report.status === "ready" && <ReportBody entries={report.value.entries} onRefresh={refresh} />}
        </TabPage>
    );
};
