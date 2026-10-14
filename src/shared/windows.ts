export const MAIN_WINDOW_PAGE = "renderer.min.html";
export const OVERLAY_PREFIX = "overlay";

const fileName = (path: string): string => path.split(/[\\/]/).pop()?.toLowerCase() ?? "";

export const isMainWindowUrl = (url: string): boolean => fileName(url.split(/[?#]/)[0] ?? url) === MAIN_WINDOW_PAGE;

export const isOverlayFile = (path: string): boolean => fileName(path).startsWith(OVERLAY_PREFIX);
