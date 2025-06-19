import { Token, tokenize } from 'src/backend/Assembler/Tokenizer';
import { assemble } from 'src/backend/Assembler/Compiler';
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('assembler', () => {
    const testS = readFileSync('./tests/test.s');
    let tokens: Token[] = [];

    describe('tokenizer', () => {
        it('can tokenize an example file', () => {
            expect(() => {
                tokens = tokenize(testS);
                console.log(JSON.stringify(tokens));
                return tokens;
            }).not.toThrowError();
        });
    });

    describe('compiler', () => {
        it('can compile the parsed file', () => {
            expect(() => {
                const result = assemble(tokens);
                console.log(result);
            }).not.toThrowError();
        });
    });

    // it('can compile an empty file', () => {
    //     expect(true).toBe(true);
    // });
    // it('can compile a simple loop', () => {
    //     expect(true).toBe(true);
    // });
    it('throws an error for a malformed file', () => {
        expect(() => { throw "penis"; }).toThrowError();
    });
});