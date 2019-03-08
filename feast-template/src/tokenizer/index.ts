import {
	Tokenizer,
	ITokenizerOptions,
	IToken,
	createSingleCharToken,
	updateTokenValue,
	DEFAULT,
} from "./tokenizer";

import {
	LineDelimiterMatcher,
} from "./line-delimiter-matcher";

import {
	TokenType,
	TOKEN_TAG_OPEN,
	TOKEN_TAG_CLOSE,
	TOKEN_STRING,
	TOKEN_SINGLE_QUOTED_STRING,
	TOKEN_DOUBLE_QUOTED_STRING,
	TOKEN_EXPRESSION,
	TOKEN_SINGLE_QUOTED_STRING_START,
	TOKEN_SINGLE_QUOTED_STRING_MIDDLE,
	TOKEN_SINGLE_QUOTED_STRING_END,
	TOKEN_DOUBLE_QUOTED_STRING_START,
	TOKEN_DOUBLE_QUOTED_STRING_MIDDLE,
	TOKEN_DOUBLE_QUOTED_STRING_END,
	TOKEN_ASSIGN,
	TOKEN_FORWARD_SLASH,
} from "./types";


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
