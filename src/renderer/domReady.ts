export const whenDomReady = (): Promise<void> =>
    document.readyState === "loading"
        ? new Promise(resolve => document.addEventListener("DOMContentLoaded", () => resolve(), { once: true }))
        : Promise.resolve();
