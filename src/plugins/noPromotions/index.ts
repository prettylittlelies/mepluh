import { chunkMarker } from "@shared/chunkPatches";
import { definePlugin } from "@shared/plugin";

export default definePlugin({
    name: "NoPromotions",
    description: "Drops Medal's promotional campaigns: sponsored library cards, promo announcements, notifications and banners.",
    category: "Privacy",
    enabledByDefault: true,
    patches: [
        {
            find: "return t.promotionalCtas}",
            replacement: { match: /(\[\i\]\(\i,(\i)\)\{return )\2\.promotionalCtas\}/, replace: "$1{}}" }
        },
        {
            find: chunkMarker("renderer-LibraryAd"),
            replacement: { match: /sponsorCard:\i(?=[,}])/g, replace: "sponsorCard:null" }
        }
    ]
});
