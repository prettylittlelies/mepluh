import { existsSync, mkdirSync, readFileSync, watch, writeFileSync } from "node:fs";
import { basename, dirname } from "node:path";
import { defineNative } from "@main/native";
import customCss from ".";
import { CSS_UPDATE_EVENT, READ_CSS_HANDLER, WRITE_CSS_HANDLER } from "./protocol";

const DEBOUNCE_MS = 100;

const ensureFile = (path: string): void => {
    if (existsSync(path)) return;
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, "");
};

export default defineNative(customCss, {
    handlers: {
        [READ_CSS_HANDLER]: ({ paths }) => readFileSync(paths.customCss, "utf8"),
        [WRITE_CSS_HANDLER]: ({ paths }, css) => writeFileSync(paths.customCss, String(css))
    },
    start({ paths, broadcast, log }) {
        ensureFile(paths.customCss);
        let timer: NodeJS.Timeout | undefined;
        watch(dirname(paths.customCss), (_event, file) => {
            if (file !== basename(paths.customCss)) return;
            clearTimeout(timer);
            timer = setTimeout(() => {
                try {
                    broadcast(CSS_UPDATE_EVENT, readFileSync(paths.customCss, "utf8"));
                } catch (error) {
                    log.warn("Could not reload custom CSS", error);
                }
            }, DEBOUNCE_MS);
        });
        log.info("Watching", paths.customCss);
    }
});
