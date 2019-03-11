import {
	LineDelimiterMatcher,
} from "./line-delimiter-matcher";

import {
	TokenType,
} from "./types";


export const DEFAULT: any = null;


export interface ICodePosition {
	index: number;
	line: number;
	offset: number;
}

export interface IToken {
	type: TokenType;
	start?: ICodePosition;
	end?: ICodePosition;
	value?: string;
}

export interface ITokenizerOptions {
	lineDelimiter?: string;
}

type TokenizerSwitchHandler = (tokenizer: Tokenizer, charCode: number) => any;

export class Tokenizer {
	private static cases: {[key: string]: {[key: string]: TokenizerSwitchHandler}} = {};

	static switch(charCode: number | null, tokenType: TokenType | null, handler: TokenizerSwitchHandler) {
		Tokenizer.cases[charCode] = Tokenizer.cases[charCode] || {};
		Tokenizer.cases[charCode][<string> <unknown> tokenType] = handler;
	}

	constructor(public source: string, public lineDelimiterMatcher: LineDelimiterMatcher) {};

	public tokenList: IToken[] = [];
	public currentToken: IToken;
	public index = 0;
	public line = 1;
	public offset = 1;
	public curlyBrackets = 0;

	consume(charCode: number, tokenType: TokenType) {
		const transitions = Tokenizer.cases[charCode] || Tokenizer.cases[DEFAULT];
		let handler;

		if (transitions) {
			handler = transitions[tokenType] || transitions[DEFAULT];
		}

		if (handler) {
			handler(this, charCode);
		}
	}

	endToken() {
		const firstCharCode = this.source.charCodeAt(this.currentToken.start.index);

		if (
			// Correction for multi-char tokens
			this.currentToken.end.index - this.currentToken.start.index > 1 ||
			// The next symbol is a surrogate half
			firstCharCode >= 0xD800 && firstCharCode <= 0xDBFF
		) {
			this.currentToken.end.index++;
			this.currentToken.end.offset++;
		}

		updateTokenValue(this.source, this.currentToken);

		this.tokenList.push(this.currentToken);
		this.currentToken = undefined;
	}
}

export function createSingleCharToken(type: TokenType, index: number, line: number, offset: number): IToken {
	return {
		type,
		start: {
			index,
			line,
			offset,
		},
		end: {
			index: index + 1,
			line,
			offset: offset + 1,
		}
	};
}

export function updateTokenValue(source: string, token: IToken) {
	if (token.end.index < token.start.index) {
		token.end.index = token.start.index;
		token.end.offset = token.start.index;
	}

	// Literally fuck this
	if (token.end.index === token.start.index) {
		debugger;
		// token.start.index--;
	}

	token.value = source.substring(
		token.start.index,
		token.end.index,
	);
}
