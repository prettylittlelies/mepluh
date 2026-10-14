import { app, session, type OnBeforeRequestListenerDetails, type CallbackResponse, type Session, type WebRequest, type WebRequestFilter } from "electron";
import type { Logger } from "@shared/logger";
import type { Blocklist } from "../native";
import { MATCH_ALL, MatchPatternSet } from "./matchPattern";

type BeforeRequestListener = (details: OnBeforeRequestListenerDetails, callback: (response: CallbackResponse) => void) => void;

interface Delegate {
    readonly listener: BeforeRequestListener;
    readonly filter: MatchPatternSet;
}

type OnBeforeRequest = (this: WebRequest, filterOrListener?: WebRequestFilter | BeforeRequestListener | null, listener?: BeforeRequestListener | null) => void;

const splitArguments = (
    first: WebRequestFilter | BeforeRequestListener | null | undefined,
    second: BeforeRequestListener | null | undefined
): Delegate | undefined => {
    if (typeof first === "function") return { listener: first, filter: MATCH_ALL };
    if (!second) return undefined;
    return { listener: second, filter: first?.urls.length ? new MatchPatternSet(first.urls) : MATCH_ALL };
};

export class RequestBlocker {
    public readonly urls: MatchPatternSet;
    private readonly partitions: readonly string[];
    private readonly rules = new WeakMap<WebRequest, MatchPatternSet>();
    private readonly delegates = new WeakMap<WebRequest, Delegate>();
    private original: OnBeforeRequest | undefined;

    public constructor(blocklists: readonly Blocklist[], private readonly log: Logger) {
        this.urls = new MatchPatternSet([...new Set(blocklists.flatMap(list => list.urls))]);
        this.partitions = [...new Set(blocklists.flatMap(list => list.partitions))];
    }

    public install(): void {
        if (this.urls.isEmpty && this.partitions.length === 0) return;
        this.hookPrototype(session.defaultSession.webRequest);
        this.partitions.forEach(partition => this.attach(session.fromPartition(partition), MATCH_ALL));
        if (this.urls.isEmpty) return;
        this.attach(session.defaultSession, this.urls);
        app.on("session-created", created => {
            if (!this.rules.has(created.webRequest)) this.attach(created, this.urls);
        });
    }

    private hookPrototype(sample: WebRequest): void {
        const prototype = Object.getPrototypeOf(sample) as { onBeforeRequest: OnBeforeRequest };
        const original = prototype.onBeforeRequest;
        this.original = original;
        const blocker = this;
        prototype.onBeforeRequest = function (this: WebRequest, first, second) {
            if (!blocker.rules.has(this)) return original.call(this, first, second);
            const delegate = splitArguments(first, second);
            if (delegate) blocker.delegates.set(this, delegate);
            else blocker.delegates.delete(this);
        };
    }

    private attach(target: Session, rules: MatchPatternSet): void {
        const { webRequest } = target;
        this.rules.set(webRequest, rules);
        this.original?.call(webRequest, (details, respond) => this.dispatch(webRequest, details, respond));
    }

    private dispatch(webRequest: WebRequest, details: OnBeforeRequestListenerDetails, respond: (response: CallbackResponse) => void): void {
        if (this.rules.get(webRequest)?.test(details.url)) {
            this.log.debug("Blocked", details.url);
            respond({ cancel: true });
            return;
        }
        const delegate = this.delegates.get(webRequest);
        if (delegate?.filter.test(details.url)) delegate.listener(details, respond);
        else respond({});
    }
}
