import { defineNative } from "@main/native";
import richPresence from ".";
import { customizeActivity } from "./activity";

export default defineNative(richPresence, {
    hooks: {
        customize: ({ options }, activity) => customizeActivity(activity, options)
    }
});
