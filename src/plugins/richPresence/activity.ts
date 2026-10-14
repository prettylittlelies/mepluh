export interface ActivityButton {
    readonly label: string;
    readonly url: string;
}

export interface MedalActivity {
    readonly details?: string;
    readonly state?: string;
    readonly largeImageText?: string;
    readonly smallImageKey?: string;
    readonly smallImageText?: string;
    readonly smallImageUrl?: string;
    readonly startTimestamp?: Date;
    readonly buttons?: readonly ActivityButton[];
    readonly [field: string]: unknown;
}

export interface PresenceCustomization {
    readonly details: string;
    readonly state: string;
    readonly showElapsed: boolean;
    readonly showMedalBadge: boolean;
    readonly showFollowButton: boolean;
    readonly showDownloadButton: boolean;
}

const FOLLOW_BUTTON = "Follow on Medal";
const DOWNLOAD_BUTTON = "Download Medal";

const isActivity = (value: unknown): value is MedalActivity => typeof value === "object" && value !== null;

const fill = (template: string, activity: MedalActivity): string | undefined =>
    template.trim()
        ? template
              .replaceAll("{details}", activity.details ?? "")
              .replaceAll("{state}", activity.state ?? "")
              .replaceAll("{game}", activity.largeImageText ?? "")
              .trim()
        : activity.details;

const keepsButton = (button: ActivityButton, settings: PresenceCustomization): boolean =>
    !(button.label === FOLLOW_BUTTON && !settings.showFollowButton) && !(button.label === DOWNLOAD_BUTTON && !settings.showDownloadButton);

const omit = (activity: MedalActivity, fields: readonly string[]): MedalActivity =>
    Object.fromEntries(Object.entries(activity).filter(([field]) => !fields.includes(field))) as MedalActivity;

export const customizeActivity = (value: unknown, settings: PresenceCustomization): unknown => {
    if (!isActivity(value)) return value;
    const buttons = value.buttons?.filter(button => keepsButton(button, settings));
    const removed = [
        ...(settings.showElapsed ? [] : ["startTimestamp"]),
        ...(settings.showMedalBadge ? [] : ["smallImageKey", "smallImageText", "smallImageUrl"]),
        ...(buttons?.length ? [] : ["buttons"])
    ];
    const details = fill(settings.details, value);
    const state = settings.state.trim() ? fill(settings.state, value) : value.state;
    return {
        ...omit(value, removed),
        ...(details ? { details } : {}),
        ...(state ? { state } : {}),
        ...(buttons?.length ? { buttons } : {})
    };
};
