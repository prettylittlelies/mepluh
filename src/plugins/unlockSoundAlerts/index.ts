import { chunkMarker } from "@shared/chunkPatches";
import { definePlugin } from "@shared/plugin";

export default definePlugin({
    name: "UnlockSoundAlerts",
    description: "Unlocks all premium sound alert options (Suspense, Quack, Sparkle, Pop, Retro, Clown Horn, Custom).",
    category: "Experimental",
    enabledByDefault: true,
    patches: [
        {
            find: chunkMarker("renderer-SoundAlerts"),
            replacement: {
                match: /\.user\),(\w+)=(\w+)\((\w+)\),(\w+)=(\w+)\(\),(\w+)=!\1/,
                replace: ".user),$1=$2($3),$4=$5(),$6=!1"
            }
        },
        {
            find: chunkMarker("renderer-SoundAlerts"),
            replacement: {
                match: /(\w+)\(\),"src","assets","sound-alerts"/,
                replace: '$1().replace(/\\.asar(?=$|[\\\\/])/,".asar.unpacked"),"src","assets","sound-alerts"'
            }
        }
    ]
});
