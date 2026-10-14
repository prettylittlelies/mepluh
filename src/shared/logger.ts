type Level = "debug" | "info" | "warn" | "error";

const palette: Readonly<Record<Level, string>> = {
    debug: "#9ca3af",
    info: "#cfff53",
    warn: "#facc15",
    error: "#f87171"
};

export class Logger {
    private static readonly isBrowser = typeof document !== "undefined";

    public constructor(private readonly scope: string) {}

    public child(scope: string): Logger {
        return new Logger(`${this.scope}:${scope}`);
    }

    public debug(...args: readonly unknown[]): void {
        this.emit("debug", args);
    }

    public info(...args: readonly unknown[]): void {
        this.emit("info", args);
    }

    public warn(...args: readonly unknown[]): void {
        this.emit("warn", args);
    }

    public error(...args: readonly unknown[]): void {
        this.emit("error", args);
    }

    private emit(level: Level, args: readonly unknown[]): void {
        if (Logger.isBrowser) {
            console[level](
                `%c Mepluh %c ${this.scope}`,
                `background:${palette[level]};color:#000;border-radius:3px;font-weight:600`,
                "color:inherit",
                ...args
            );
            return;
        }
        console[level](`[Mepluh:${this.scope}]`, ...args);
    }
}
