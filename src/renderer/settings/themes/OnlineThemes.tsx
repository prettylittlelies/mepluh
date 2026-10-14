import { medalUi } from "../../medal/components";
import type { OnlineThemeStatus, ThemeManager } from "../../themeManager";
import { runAction } from "../hooks";

const parseLinks = (text: string): readonly string[] =>
    text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line !== "" && !line.startsWith("#"));

const statusBadge = (status: OnlineThemeStatus) => {
    const { Badge } = medalUi().components;
    switch (status.state) {
        case "loading":
            return <Badge variant="info">Loading</Badge>;
        case "loaded":
            return <Badge variant="success">Loaded</Badge>;
        case "failed":
            return <Badge variant="danger">Failed</Badge>;
    }
};

const LinkStatus = ({ themes, link }: { readonly themes: ThemeManager; readonly link: string }) => {
    const { Row, Label, Description } = medalUi().components;
    const status = themes.statusOf(link);
    return (
        <Row
            title={
                <div className="flex min-w-0 items-center gap-2">
                    {statusBadge(status)}
                    <Label className="truncate">{new URL(link).pathname.split("/").pop() || link}</Label>
                </div>
            }
            description={<Description className="truncate">{status.state === "failed" ? `${link} (${status.error})` : link}</Description>}
        />
    );
};

export const OnlineThemes = ({ themes }: { readonly themes: ThemeManager }) => {
    const { React, components } = medalUi();
    const { Section, SectionTitle, Description, Textarea, Button } = components;
    const [draft, setDraft] = React.useState(themes.links.join("\n"));
    const dirty = draft !== themes.links.join("\n");

    const header = (
        <div className="flex items-center justify-between gap-3">
            <SectionTitle>Theme Links</SectionTitle>
            <Button variant="brand" size="md" disabled={!dirty} onClick={() => void runAction(() => themes.setLinks(parseLinks(draft)), "Online themes updated")}>
                Save
            </Button>
        </div>
    );

    return (
        <>
            <Section header={header}>
                <Description>One https:// link to a raw .css file per line. Lines starting with # are ignored. Links are fetched by Mepluh, so Medal's content security policy does not block them.</Description>
                <Textarea
                    value={draft}
                    rows={8}
                    resize="manual"
                    spellCheck={false}
                    placeholder="https://catppuccin.github.io/discord/dist/catppuccin-mocha-mauve.theme.css"
                    onChange={event => setDraft(event.currentTarget.value)}
                />
            </Section>
            {themes.links.length > 0 && (
                <Section header={<SectionTitle>Status</SectionTitle>}>
                    {themes.links.map(link => (
                        <LinkStatus key={link} themes={themes} link={link} />
                    ))}
                </Section>
            )}
        </>
    );
};
