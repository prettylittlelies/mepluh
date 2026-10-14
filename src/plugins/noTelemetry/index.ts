import { definePlugin } from "@shared/plugin";

export default definePlugin({
    name: "NoTelemetry",
    description: "Blocks Amplitude analytics, session replay, Sentry crash reporting and LaunchDarkly event uploads.",
    category: "Privacy",
    enabledByDefault: true
});
