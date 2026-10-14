import { defineNative } from "@main/native";
import noAds from ".";

export default defineNative(noAds, {
    blocklist: {
        partitions: ["persist:ads"],
        urls: ["*://medal.tv/ads/*"]
    }
});
