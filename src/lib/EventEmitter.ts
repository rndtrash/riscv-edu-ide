export interface Listener<T> {
    (event: T): any;
}

export interface IDisposable {
    dispose(): void;
}

export class TypedEvent<T> {
    private listeners: Listener<T>[] = [];
    private listenersOnce: Listener<T>[] = [];

    on(listener: Listener<T>): IDisposable {
        this.listeners.push(listener);
        return {
            dispose: () => this.off(listener)
        };
    }

    once(listener: Listener<T>): void {
        this.listenersOnce.push(listener);
    }

    off(listener: Listener<T>) {
        const callbackIndex = this.listeners.indexOf(listener);
        if (callbackIndex > -1) this.listeners.splice(callbackIndex, 1);
    }

    emit(event: T) {
        this.listeners.forEach((listener) => listener(event));

        if (this.listenersOnce.length > 0) {
            const toCall = this.listenersOnce;
            this.listenersOnce = [];
            toCall.forEach((listener) => listener(event));
        }
    }

    pipe(te: TypedEvent<T>): IDisposable {
        return this.on((e) => te.emit(e));
    }
}