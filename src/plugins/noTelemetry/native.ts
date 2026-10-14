import { defineNative } from "@main/native";
import noTelemetry from ".";

export default defineNative(noTelemetry, {
    blocklist: {
        urls: ["*://*.amplitude.com/*", "*://*.sentry.io/*", "*://browser.sentry-cdn.com/*", "*://events.launchdarkly.com/*"]
    }
});
