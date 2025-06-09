import {get, type Writable, writable} from "svelte/store";

export enum LogLevel {
    Info = 0,
    Warning,
    Error
}

export interface LogEntry {
    message: string;
    severity: LogLevel;
    when: number;
}

export class NewLogEntryEvent extends Event {
    public entry: LogEntry;

    public constructor(entry: LogEntry) {
        super('log-event');
        this.entry = entry;
    }
}

export class Logger extends EventTarget {
    public name: string;
    private _entries: LogEntry[] = [];

    public constructor(name: string) {
        super();

        this.name = name;
    }

    public log(message: string, severity: LogLevel): void {
        const entry: LogEntry = {
            message: message,
            severity: severity,
            when: Date.now()
        };
        this._entries.push(entry);
        this.dispatchEvent(new NewLogEntryEvent(entry));
    }

    public get entries(): LogEntry[] {
        return this._entries;
    }

    public clear() {
        this._entries = [];
    }
}

export class LoggerManagerEvent extends Event {
    public id: string;
    public entry: LogEntry;

    public constructor(id: string, entry: LogEntry) {
        super('logger-event');
        this.id = id;
        this.entry = entry;
    }
}

export class NewLoggerEvent extends Event {
    public id: string;

    public constructor(id: string) {
        super('logger-new');
        this.id = id;
    }
}

export class LoggerManager extends EventTarget {
    private static _the: LoggerManager;
    public loggers = writable<{ loggers: { [id: string]: Logger } }>({loggers: {}});

    private constructor() {
        super();

        LoggerManager._the = this;
    }

    public static get The() {
        return LoggerManager._the ?? new LoggerManager();
    }

    public reset() {
        this.loggers.set({loggers: {}});
    }

    public getLogger(id: string): Logger {
        return get(this.loggers).loggers[id] ?? this.createLogger(id);
    }

    public createLogger(id: string = `${Math.random()}`, name: string = "New log"): Logger {
        console.log(get(this.loggers));
        let logger: Logger | undefined = get(this.loggers).loggers[id];
        if (logger !== undefined) {
            logger.clear();
            return logger;
        }

        console.log(`Making a new logger "${name}"`);
        logger = new Logger(name);
        this.loggers.update((o) => {
            o.loggers[id] = logger!;
            return o;
        });
        logger.addEventListener('log-event', e => {
            if (e instanceof NewLogEntryEvent)
                dispatchEvent(new LoggerManagerEvent(id, e.entry))
        });
        dispatchEvent(new NewLoggerEvent(id));
        return logger;
    }
}