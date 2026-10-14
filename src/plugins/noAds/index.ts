import { chunkMarker, nullComponentExport } from "@shared/chunkPatches";
import { definePlugin } from "@shared/plugin";

const AD_COMPONENT_CHUNKS = [
    "renderer-AditudeAdLargeRect",
    "renderer-AditudeAdMediumLargeRect",
    "renderer-AditudeAdMediumRect",
    "renderer-AdLeaderboardBanner",
    "renderer-LibraryElementAd"
] as const;

export default definePlugin({
    name: "NoAds",
    description: "Removes every ad slot: sidebar, home, post-upload, leaderboard and library grid, plus the isolated ad session.",
    category: "Privacy",
    enabledByDefault: true,
    patches: [
        ...AD_COMPONENT_CHUNKS.map(nullComponentExport),
        {
            find: '["ads-enabled"]??!0',
            replacement: { match: '["ads-enabled"]??!0', replace: '["ads-enabled"]&&!1' }
        },
        {
            find: '"ads-enabled",!0',
            replacement: { match: /\i\("ads-enabled",!0\)/, replace: "!1" }
        },
        {
            find: chunkMarker("renderer-LibraryAd"),
            replacement: { match: /\?\.data\?\.skipAds===!1/, replace: "&&!1" }
        }
    ],
    styles: '.qortex-video-container-root,[id^="qortex-video-container"]{display:none!important}'
});
