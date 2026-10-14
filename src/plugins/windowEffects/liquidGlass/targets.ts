export const GLASS_TARGETS = [
    '[data-testid="app-title-bar"]',
    ".bg-netural-1000 > .min-h-0.flex-1 > :first-child",
    '[data-testid="settings-page-container"] > .max-w-xs.shrink-0',
    '[data-slot="select-content"]',
    '[data-slot="dropdown-menu-content"]',
    '[data-slot="popover-content"]',
    '[data-slot="tooltip-content"]',
    '[role="menu"]',
    '[role="listbox"]',
    '[role="dialog"]'
] as const;

export const GLASS_SELECTOR = GLASS_TARGETS.join(",");

export const TRANSPARENT_BACKDROPS = [".bg-netural-1000", "html", "body", "#root"] as const;
