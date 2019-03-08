
export const TOKEN_TAG_OPEN = 'token::tag-open';
export const TOKEN_STRING = 'token::string';
export const TOKEN_SINGLE_QUOTED_STRING = 'token::single-quoted-string';
export const TOKEN_DOUBLE_QUOTED_STRING = 'token::double-quoted-string';
export const TOKEN_EXPRESSION = 'token::expression';
export const TOKEN_SINGLE_QUOTED_STRING_START = 'token::single-quoted-string-start';
export const TOKEN_SINGLE_QUOTED_STRING_MIDDLE = 'token::single-quoted-string-middle';
export const TOKEN_SINGLE_QUOTED_STRING_END = 'token::single-quoted-string-end';
export const TOKEN_DOUBLE_QUOTED_STRING_START = 'token::double-quoted-string-start';
export const TOKEN_DOUBLE_QUOTED_STRING_MIDDLE = 'token::double-quoted-string-middle';
export const TOKEN_DOUBLE_QUOTED_STRING_END = 'token::double-quoted-string-end';
export const TOKEN_FORWARD_SLASH = 'token::forward-slash';
export const TOKEN_ASSIGN = 'token::assign';
export const TOKEN_TAG_CLOSE = 'token::tag-close';

export type TokenType = typeof TOKEN_TAG_OPEN |
	typeof TOKEN_TAG_CLOSE |
	typeof TOKEN_STRING |
	typeof TOKEN_SINGLE_QUOTED_STRING |
	typeof TOKEN_DOUBLE_QUOTED_STRING |
	typeof TOKEN_EXPRESSION |
	typeof TOKEN_SINGLE_QUOTED_STRING_START |
	typeof TOKEN_SINGLE_QUOTED_STRING_MIDDLE |
	typeof TOKEN_SINGLE_QUOTED_STRING_END |
	typeof TOKEN_DOUBLE_QUOTED_STRING_START |
	typeof TOKEN_DOUBLE_QUOTED_STRING_MIDDLE |
	typeof TOKEN_DOUBLE_QUOTED_STRING_END |
	typeof TOKEN_ASSIGN |
	typeof TOKEN_FORWARD_SLASH;

const DEFAULT: any = null;


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


class LineDelimiterMatcher {
	private head: string;
	private tail: string;
	private targetHead: string;
	private targetTail: string;
	private multiChar: boolean;

	constructor(targetDelimiter?: string) {
		if (targetDelimiter === undefined) {
			const os = require('os');
			targetDelimiter = os.EOL;
		}

		this.targetHead = targetDelimiter.substring(0, 1);
		this.multiChar = targetDelimiter.length === 2;

		if (this.multiChar) {
			this.targetTail = targetDelimiter.substring(1, 2);
		}
	}

	push(char: string) {
		if (this.head && this.multiChar) {
			this.tail = this.head;
		}

		this.head = char;
	}

	matches() {
		return this.head === this.targetHead && this.tail === this.targetTail;
	}

	clear() {
		this.head = undefined;
		this.tail = undefined;
	}
}

type TokenizerSwitchHandler = (tokenizer: Tokenizer, charCode: number) => any;

class Tokenizer {
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

function createSingleCharToken(type: TokenType, index: number, line: number, offset: number): IToken {
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

function updateTokenValue(source: string, token: IToken) {
	if (token.end.index < token.start.index) {
		token.end.index = token.start.index;
		token.end.offset = token.start.index;
	}

	token.value = source.substring(
		token.start.index,
		token.end.index,
	);
}

const CHAR_SPACE = 0x20;
const CHAR_TAB = 0x9;
const CHAR_LF = 0xA;
const CHAR_CR = 0xD;
const CHAR_TAG_START = 0x3C; // <
const CHAR_TAG_END = 0x3E; // >
const CHAR_EQUALITY_SYMBOL = 0x3D; // =
const CHAR_SINGLE_QUOTE = 0x27; // '
const CHAR_DOUBLE_QUOTE = 0x22; // "
const CHAR_OPEN_CURLY = 0x7B; // {
const CHAR_CLOSE_CURLY = 0x7D; // }
const CHAR_FORWARD_SLASH = 0x2F; // /


function ruleEndToken(t: Tokenizer) {
	if (t.currentToken) {
		t.endToken();
	}
}

function ruleBreakNewLine(t: Tokenizer, charCode: number) {
	if (charCode === 0xA || charCode === 0xD) {
		t.lineDelimiterMatcher.push(t.source.substring(t.index, t.index + 1));

		if (t.lineDelimiterMatcher.matches()) {
			t.lineDelimiterMatcher.clear();
			t.offset = 1;
			t.line++;
		}
	}
}

function ruleEndTokenAndBreakNewLine(t: Tokenizer, charCode: number) {
	ruleEndToken(t);
	ruleBreakNewLine(t, charCode);
}

function ruleIncToken(t: Tokenizer) {
	t.currentToken.end.index = t.index;
	t.currentToken.end.line = t.line;
	t.currentToken.end.offset = t.offset;
}

function ruleIncCurly(t: Tokenizer) {
	t.curlyBrackets++;
}

function ruleDecCurly(t: Tokenizer) {
	t.curlyBrackets--;
}

function ruleIncTokenAndCurly(t: Tokenizer) {
	ruleIncToken(t);
	ruleIncCurly(t);
}

function ruleIncAndTrimToken(t: Tokenizer) {
	t.currentToken.end.index = t.index - 1;
	t.currentToken.end.line = t.line;
	t.currentToken.end.offset = t.offset - 1;
}

function ruleIncTrimAndEndToken(t: Tokenizer) {
	ruleIncAndTrimToken(t);
	ruleEndToken(t);
}

function ruleFactoryCreateToken(tokenType: TokenType, offset = 0) {
	return function ruleCreateToken(t: Tokenizer) {
		t.currentToken = createSingleCharToken(
			tokenType,
			t.index + offset,
			t.line,
			t.offset + offset
		);

		t.tokenList.push(t.currentToken);
		t.currentToken = undefined;
	}
}

function ruleFactoryEndAndCreateToken(tokenType: TokenType, offset = 0) {
	const ruleCreateToken = ruleFactoryCreateToken(tokenType, offset);

	return function ruleEndAndCreateToken(t: Tokenizer) {
		ruleEndToken(t);
		ruleCreateToken(t);
	}
}

function ruleFactoryMutateToken(typeToChange: TokenType, typeToCreate: TokenType) {
	return function ruleMutateToken(t: Tokenizer) {
		t.currentToken.type = typeToChange;

		ruleIncAndTrimToken(t);

		updateTokenValue(t.source, t.currentToken);
		ruleEndToken(t);

		ruleFactoryEndAndReplaceToken(typeToCreate, 1)(t);
		ruleIncCurly(t);
	}
}

function ruleFactoryReplaceToken(tokenType: TokenType, offset = 0) {
	return function ruleReplaceToken(t: Tokenizer) {
		t.currentToken = createSingleCharToken(
			tokenType,
			t.index + offset,
			t.line,
			t.offset + offset
		);
	}
}

function ruleFactoryReplaceTokenAndIncCurly(tokenType: TokenType, offset = 0) {
	const ruleReplaceToken = ruleFactoryReplaceToken(tokenType, offset);

	return function ruleReplaceTokenAndIncCurly(t: Tokenizer) {
		ruleReplaceToken(t);
		ruleIncCurly(t);
	}
}

function ruleFactoryEndAndReplaceToken(tokenType: TokenType, offset = 0) {
	const ruleReplaceToken = ruleFactoryReplaceToken(tokenType, offset);

	return function ruleEndAndReplaceToken(t: Tokenizer) {
		ruleEndToken(t);
		ruleReplaceToken(t);
	}
}


[
	CHAR_SPACE,
	CHAR_TAB,
	CHAR_LF,
	CHAR_CR,
].forEach(charCode => {
	Tokenizer.switch(charCode, TOKEN_SINGLE_QUOTED_STRING, ruleIncToken);
	Tokenizer.switch(charCode, TOKEN_DOUBLE_QUOTED_STRING, ruleIncToken);
	Tokenizer.switch(charCode, TOKEN_EXPRESSION, ruleIncToken);
	Tokenizer.switch(charCode, TOKEN_STRING, ruleEndTokenAndBreakNewLine);
	Tokenizer.switch(charCode, DEFAULT, ruleBreakNewLine);
});

Tokenizer.switch(CHAR_TAG_START, TOKEN_SINGLE_QUOTED_STRING, ruleIncToken);
Tokenizer.switch(CHAR_TAG_START, TOKEN_DOUBLE_QUOTED_STRING, ruleIncToken);
Tokenizer.switch(CHAR_TAG_START, TOKEN_EXPRESSION, ruleIncToken);
Tokenizer.switch(CHAR_TAG_START, TOKEN_STRING, ruleFactoryEndAndCreateToken(TOKEN_TAG_OPEN));
Tokenizer.switch(CHAR_TAG_START, DEFAULT, ruleFactoryCreateToken(TOKEN_TAG_OPEN));

Tokenizer.switch(CHAR_EQUALITY_SYMBOL, TOKEN_SINGLE_QUOTED_STRING, ruleIncToken);
Tokenizer.switch(CHAR_EQUALITY_SYMBOL, TOKEN_DOUBLE_QUOTED_STRING, ruleIncToken);
Tokenizer.switch(CHAR_EQUALITY_SYMBOL, TOKEN_EXPRESSION, ruleIncToken);
Tokenizer.switch(CHAR_EQUALITY_SYMBOL, TOKEN_STRING, ruleFactoryEndAndCreateToken(TOKEN_ASSIGN));
Tokenizer.switch(CHAR_EQUALITY_SYMBOL, DEFAULT, ruleFactoryCreateToken(TOKEN_ASSIGN));

Tokenizer.switch(CHAR_SINGLE_QUOTE, TOKEN_SINGLE_QUOTED_STRING, ruleEndToken);
Tokenizer.switch(CHAR_SINGLE_QUOTE, TOKEN_SINGLE_QUOTED_STRING_END, ruleIncTrimAndEndToken);
Tokenizer.switch(CHAR_SINGLE_QUOTE, TOKEN_DOUBLE_QUOTED_STRING, ruleIncToken);
Tokenizer.switch(CHAR_SINGLE_QUOTE, TOKEN_DOUBLE_QUOTED_STRING_END, ruleIncToken);
Tokenizer.switch(CHAR_SINGLE_QUOTE, TOKEN_EXPRESSION, ruleIncToken);
Tokenizer.switch(CHAR_SINGLE_QUOTE, DEFAULT, ruleFactoryEndAndReplaceToken(TOKEN_SINGLE_QUOTED_STRING, 1));

Tokenizer.switch(CHAR_DOUBLE_QUOTE, TOKEN_SINGLE_QUOTED_STRING, ruleIncToken);
Tokenizer.switch(CHAR_DOUBLE_QUOTE, TOKEN_SINGLE_QUOTED_STRING_END, ruleIncToken);
Tokenizer.switch(CHAR_DOUBLE_QUOTE, TOKEN_DOUBLE_QUOTED_STRING, ruleEndToken);
Tokenizer.switch(CHAR_DOUBLE_QUOTE, TOKEN_DOUBLE_QUOTED_STRING_END, ruleIncTrimAndEndToken);
Tokenizer.switch(CHAR_DOUBLE_QUOTE, TOKEN_EXPRESSION, ruleIncToken);
Tokenizer.switch(CHAR_DOUBLE_QUOTE, DEFAULT, ruleFactoryEndAndReplaceToken(TOKEN_DOUBLE_QUOTED_STRING, 1));

Tokenizer.switch(CHAR_FORWARD_SLASH, TOKEN_SINGLE_QUOTED_STRING, ruleIncToken);
Tokenizer.switch(CHAR_FORWARD_SLASH, TOKEN_DOUBLE_QUOTED_STRING, ruleIncToken);
Tokenizer.switch(CHAR_FORWARD_SLASH, TOKEN_EXPRESSION, ruleIncToken);
Tokenizer.switch(CHAR_FORWARD_SLASH, TOKEN_STRING, ruleFactoryEndAndCreateToken(TOKEN_FORWARD_SLASH));
Tokenizer.switch(CHAR_FORWARD_SLASH, DEFAULT, ruleFactoryCreateToken(TOKEN_FORWARD_SLASH));

Tokenizer.switch(CHAR_TAG_END, TOKEN_SINGLE_QUOTED_STRING, ruleIncToken);
Tokenizer.switch(CHAR_TAG_END, TOKEN_DOUBLE_QUOTED_STRING, ruleIncToken);
Tokenizer.switch(CHAR_TAG_END, TOKEN_EXPRESSION, ruleIncToken);
Tokenizer.switch(CHAR_TAG_END, TOKEN_STRING, ruleFactoryEndAndCreateToken(TOKEN_TAG_CLOSE));
Tokenizer.switch(CHAR_TAG_END, DEFAULT, ruleFactoryCreateToken(TOKEN_TAG_CLOSE));

Tokenizer.switch(CHAR_OPEN_CURLY, TOKEN_EXPRESSION, ruleIncTokenAndCurly);
Tokenizer.switch(CHAR_OPEN_CURLY, DEFAULT, ruleFactoryReplaceTokenAndIncCurly(TOKEN_EXPRESSION, 1));

Tokenizer.switch(CHAR_OPEN_CURLY, TOKEN_SINGLE_QUOTED_STRING, ruleFactoryMutateToken(
	TOKEN_SINGLE_QUOTED_STRING_START, TOKEN_EXPRESSION));

Tokenizer.switch(CHAR_OPEN_CURLY, TOKEN_SINGLE_QUOTED_STRING_END, ruleFactoryMutateToken(
	TOKEN_SINGLE_QUOTED_STRING_MIDDLE, TOKEN_EXPRESSION));

Tokenizer.switch(CHAR_OPEN_CURLY, TOKEN_DOUBLE_QUOTED_STRING, ruleFactoryMutateToken(
	TOKEN_DOUBLE_QUOTED_STRING_START, TOKEN_EXPRESSION));

Tokenizer.switch(CHAR_OPEN_CURLY, TOKEN_DOUBLE_QUOTED_STRING_END, ruleFactoryMutateToken(
	TOKEN_DOUBLE_QUOTED_STRING_MIDDLE, TOKEN_EXPRESSION));

Tokenizer.switch(CHAR_CLOSE_CURLY, DEFAULT, ruleIncToken);

Tokenizer.switch(CHAR_CLOSE_CURLY, TOKEN_EXPRESSION, t => {
	ruleDecCurly(t);

	if (t.curlyBrackets) {
		ruleIncToken(t);
		return;
	}

	const lastToken = t.tokenList[t.tokenList.length - 1];
	ruleEndToken(t);

	if (!lastToken) {
		return
	}

	switch (lastToken.type) {
		case TOKEN_SINGLE_QUOTED_STRING_MIDDLE:
		{
			lastToken.end.index++;
			lastToken.end.offset++;

			updateTokenValue(t.source, lastToken);
			// No break
		}

		case TOKEN_SINGLE_QUOTED_STRING_START:
		{
			ruleFactoryReplaceToken(TOKEN_SINGLE_QUOTED_STRING_END, 1)(t);
			break;
		}

		case TOKEN_DOUBLE_QUOTED_STRING_MIDDLE:
		{
			lastToken.end.index++;
			lastToken.end.offset++;

			updateTokenValue(t.source, lastToken);
			// No break
		}

		case TOKEN_DOUBLE_QUOTED_STRING_START:
		{
			ruleFactoryReplaceToken(TOKEN_DOUBLE_QUOTED_STRING_END, 1)(t);
			break;
		}
	}
});

Tokenizer.switch(DEFAULT, DEFAULT, t => {
	if (t.currentToken === undefined) {
		ruleFactoryReplaceToken(TOKEN_STRING)(t);
		return;
	}

	ruleIncToken(t);
});


export function tokenize(source: string, options: ITokenizerOptions = {}): IToken[] {
	const tokenizer = new Tokenizer(
		source,
		new LineDelimiterMatcher(options.lineDelimiter),
	);

	let charCode;
	let tokenType;
	do {
		charCode = source.charCodeAt(tokenizer.index);
		tokenType = tokenizer.currentToken && tokenizer.currentToken.type;

		tokenizer.consume(charCode, <TokenType> tokenType);
		tokenizer.index++;

		if (charCode !== 0xA && charCode !== 0xD) {
			tokenizer.offset++;
		}
	} while (tokenizer.index < source.length);

	// Ending the last token
	if (tokenizer.currentToken && tokenizer.currentToken.type === TOKEN_STRING) {
		ruleEndToken(tokenizer);
	}

	return tokenizer.tokenList;
}
