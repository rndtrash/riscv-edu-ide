self.onmessage = (e: MessageEvent<number>) => {
    setTimeout(() => postMessage(e.data * e.data), 5000);
};

export {};