import { MOD_NAME } from "@shared/constants";
import { Injector, type InjectionState } from "./injector";
import { resolveLocations } from "./locations";

type Command = "install" | "uninstall" | "status";

const describe: Readonly<Record<InjectionState, string>> = {
    "missing-medal": "Medal is not installed",
    clean: `Medal is installed without ${MOD_NAME}`,
    injected: `${MOD_NAME} is injected`,
    foreign: "Medal's app.asar was modified by another tool"
};

const isCommand = (value: string | undefined): value is Command => value === "install" || value === "uninstall" || value === "status";

const pathFlag = (args: readonly string[]): string | undefined => {
    const index = args.indexOf("--medal");
    return index >= 0 ? args[index + 1] : undefined;
};

const main = async ([command, ...rest]: readonly string[]): Promise<void> => {
    if (!isCommand(command)) throw new Error("Usage: cli.ts <install|uninstall|status> [--medal <Medal root>]");
    const injector = new Injector(resolveLocations(pathFlag(rest)));

    switch (command) {
        case "install":
            await injector.install();
            console.log(`${MOD_NAME} injected. Open Medal settings and look for the Mepluh section.`);
            return;
        case "uninstall":
            console.log((await injector.uninstall()) ? `${MOD_NAME} removed.` : "Nothing to remove.");
            return;
        case "status":
            console.log(describe[await injector.state()]);
            return;
    }
};

await main(process.argv.slice(2)).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
