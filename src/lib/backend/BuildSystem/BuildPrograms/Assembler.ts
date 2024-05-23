import {BuildPrograms, ProgramStatus} from "$lib/backend/BuildSystem/Program";
import {LoggerManager} from "$lib/backend/Logger";


enum RvAssemblerTokens {
    INVALID = -1,
    LITERAL = 0,
    NUMBER = 1,
    COMMA = 2,
    COLON = 3,
    NEW_LINE = 4,
}

const RvAssemblerRegularExpressions = {
    label: /[a-zA-Zа-яёА-ЯЁ_\d]+:/,
    register: /%[a-zA-Z0-9]+/,
    literal: /[a-zA-Z_][a-zA-Z_\d]*/,
    number: /\$-?((0[xX])?[0-9A-Fa-f]+)/,
    comment: /(^#.*$)/,
    whitespace: /[ \t]*/
};

export class RvAssembler {
    public constructor() {
    }

    public compile(source: string) {
        LoggerManager.The.createLogger("assembler-compiler", "Build Log");
        return this.#assemble(this.#parse(this.tokenize(source)));
    }

    private tokenize(source: string) {
        class Token {
            static get type() {
                return RvAssemblerTokens.INVALID;
            }

            constructor() {
            }

            static parse(string: string) {
                return {token: undefined, length: 0};
            }
        }

        class Whitespace {
            static parse(string: string) {
                return {token: undefined, length: RvAssemblerRegularExpressions.whitespace.exec(string)![0].length}; // implying that this regexp would always match even when there are no whitespaces at all
            }
        }

        class Comment extends Token {
            static parse(string: string) {
                if (string[0] == ';') {
                    let pos = 1;
                    while (pos < string.length) {
                        if (string[pos] == '\n') {
                            return {token: undefined, length: pos};
                        }
                        pos++;
                    }

                    return {token: undefined, length: pos};
                }

                return super.parse(string);
            }
        }

        class SingleCharacterToken extends Token {
            static get character() {
                return undefined;
            }

            static parse(string: string) {
                if (string[0] == this.character)
                    return {token: new this(), length: 1};

                return super.parse(string);
            }
        }

        class NewLine extends SingleCharacterToken {
            static get type() {
                return RvAssemblerTokens.NEW_LINE;
            }

            static get character() {
                return '\n';
            }
        }

        class Comma extends SingleCharacterToken {
            static get type() {
                return RvAssemblerTokens.COMMA;
            }

            static get character() {
                return ',';
            }
        }

        class Colon extends SingleCharacterToken {
            static get type() {
                return RvAssemblerTokens.COLON;
            }

            static get character() {
                return ':';
            }
        }

        class TokenWithValue extends Token {
            value;

            constructor(value: any) {
                super();

                this.value = value;
            }
        }

        class Literal extends TokenWithValue {
            static get type() {
                return RvAssemblerTokens.LITERAL;
            }

            static regexp = new RegExp(`^${RvAssemblerRegularExpressions.literal.source}`);

            static parse(s: string) {
                let exec = this.regexp.exec(s);
                if (exec) {
                    return {token: new this(exec[0]), length: exec[0].length};
                }

                return super.parse(s);
            }
        }

        const PARSE_ORDER: ((s: string) => { length: number, token: any })[] = [
            (s) => Whitespace.parse(s),
            (s) => NewLine.parse(s),
            (s) => Comma.parse(s),
            (s) => Colon.parse(s),
            (s) => Comment.parse(s),
            (s) => Literal.parse(s),
            // TODO: (s) => Number.parse(s),
        ];

        let tokens = [];
        let position = 0;
        let parser = 0;
        while (parser < PARSE_ORDER.length && position < source.length) {
            let result = PARSE_ORDER[parser](source.slice(position));
            if (result && result.length != 0) {
                if (result.token)
                    tokens.push(result.token);
                position += result.length;
                parser = 0;
            } else
                parser++;
        }
        if (position != source.length)
            throw 'asm.error.tokenizer.failed-to-parse';

        return tokens;
    }

    #parse(tokens: any[]): any[] {
        console.log(tokens);

        throw 'Not implemented yet!';
    }

    #assemble(ast: any[]) {
        throw 'Not implemented yet!';
    }
}

BuildPrograms["asm"] = {
    program: (logger, ...args) => {
        const as = new RvAssembler();
        return ProgramStatus.Success;
    }
};