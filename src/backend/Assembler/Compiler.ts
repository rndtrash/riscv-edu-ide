import { NewLine, Comment, Token } from "./Tokenizer";

function skipStuff(tokens: Token[]) {
    while (tokens.length > 0) {
        const currentToken = tokens[0];
        if (currentToken! instanceof Comment || currentToken! instanceof NewLine)
            break;
        tokens.shift();
    }
}

function readLabel(tokens: Token[]) {
    // if (tokens.shi)
}

export function assemble(tokens: Token[]): Uint8Array {
    const result = new ArrayBuffer(0);
    const dv = new DataView(result);

    let currentOffset = 0;
    let labelPositions = new Map<string, number>();
    while (tokens.length > 0) {
        const l = tokens.length;
        skipStuff(tokens);

        if (l == tokens.length) {
            throw `No tokens were consumed on this round: ${JSON.stringify(tokens)}`;
        }
    }

    return new Uint8Array(result);
}