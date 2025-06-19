export enum SpecialSymbols {
    COMMENT = "#",
    LABEL = ":",
    COMMA = ",",
    DIRECTIVE = ".",
    NEW_LINE = "\n",
    NEW_LINE_WINDOWS = "\r"
}

export abstract class Token {
    start: number;
    length: number;

    constructor(start: number, length: number) {
        this.start = start;
        this.length = length;
    }
}

export class Comment extends Token {
    static TryParse(input: string, start: number): Comment | null {
        if (start < input.length && input[start] === SpecialSymbols.COMMENT) {
            let position = start + 1;
            while (position < input.length && NewLine.TryParse(input, position) == null) {
                position++;
            }

            return new Comment(start, position - start);
        }

        return null;
    }
}

export class Colon extends Token {
    static TryParse(input: string, start: number): Colon | null {
        if (start < input.length && input[start] === SpecialSymbols.LABEL) {
            return new Colon(start, 1);
        }

        return null;
    }
}

export class Comma extends Token {
    static TryParse(input: string, start: number): Comma | null {
        if (start < input.length && input[start] === SpecialSymbols.COMMA) {
            return new Comma(start, 1);
        }

        return null;
    }
}

export class NewLine extends Token {
    static TryParse(input: string, start: number): NewLine | null {
        if (start < input.length && (input[start] === SpecialSymbols.NEW_LINE || input[start] === SpecialSymbols.NEW_LINE_WINDOWS)) {
            return new NewLine(start, 1);
        }

        return null;
    }
}

export class Literal extends Token {
    static readonly ALPHA = "^[A-Za-zА-Яа-яЁё\\-_]";
    static readonly ALPHANUMERIC = "^[0-9A-Za-zА-Яа-яЁё\\-_]";

    value: string;

    constructor(value: string, start: number, length: number) {
        super(start, length);

        this.value = value;
    }

    static TryParse(input: string, start: number): Literal | null {
        if (start < input.length && new RegExp(Literal.ALPHA).test(input.substring(start))) {
            const alphaNumeric = new RegExp(Literal.ALPHANUMERIC);
            let endPosition = start + 1;

            while (endPosition < input.length && alphaNumeric.test(input.substring(endPosition))) {
                alphaNumeric.lastIndex = 0;
                endPosition++;
            }

            const length = endPosition - start;
            return new Literal(input.substring(start, endPosition), start, length);
        }

        return null;
    }
}

export class Number extends Token {
    static readonly NUMBER = "^[+\\-]?(0x)?[0-9]+";
    value: number;

    constructor(value: number, start: number, length: number) {
        super(start, length);

        this.value = value;
    }

    static TryParse(input: string, start: number): Number | null {
        if (start < input.length) {
            const numberRegexp = new RegExp(Number.NUMBER);
            const result = input.substring(start).match(numberRegexp);
            if (result !== null) {
                const length = result[0].length;
                const s = input.substring(start, start + length);
                let n: number = 0;
                if (s.startsWith("0x")) {
                    n = parseInt(s.substring(2), 16);
                } else {
                    n = parseInt(s, 10);
                }
                return new Number(n, start, length);
            }
        }
        return null;
    }
}

export function tokenize(input: string): Token[] {
    input = String(input);

    const tokens: Token[] = [];

    const parseOrder = [
        Comment.TryParse,
        Colon.TryParse,
        Comma.TryParse,
        NewLine.TryParse,
        Number.TryParse,
        Literal.TryParse
    ];

    let position = 0;
    const inputLength = input.length;

    restartParsing:
    while (position < inputLength) {
        let char = input[position];
        let newPosition = position;

        // Skip the space symbols
        while ((char === " " || char === "\t") && newPosition < inputLength) {
            newPosition++;
            char = input[newPosition];
        }

        if (newPosition !== position) {
            position = newPosition;
            continue;
        }

        for (const parser of parseOrder) {
            const result = parser(input, position);
            if (result !== null) {
                if (result.length <= 0) throw `Something weird happened, length ${result.length} at test ${result.constructor.name} ${JSON.stringify(result)} : ${input.substring(position, input.indexOf("\n", position) - 1)}`;
                tokens.push(result);
                position += result.length;

                continue restartParsing;
            }
        }

        throw `Unable to parse line: ${input.substring(position, input.indexOf("\n", position) - 1)} @ ${position}`;
    }

    // TODO: Failsafe
    tokens.push(new NewLine(position, 0));

    return tokens;
}