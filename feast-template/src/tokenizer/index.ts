import {
	Tokenizer,
	ITokenizerOptions,
	IToken, DEFAULT,
} from "./tokenizer";

import {
	LineDelimiterMatcher,
} from "./line-delimiter-matcher";

import {
	TokenType,
	TOKEN_STRING,
	CHAR_EOF,
	CHAR_SPACE,
	CHAR_TAB,
	CHAR_LF,
	CHAR_CR,
} from "./types";

import {
	ruleBreakLine,
	ruleCombine,
	ruleEndToken,
	ruleIncToken,
	ruleStartToken,
} from "./rules";

// Addons
import "./addons/tags";
import "./addons/expressions";


[
	CHAR_SPACE,
	CHAR_TAB,
	CHAR_LF,
	CHAR_CR,
].forEach(charCode => {
	Tokenizer.switch(charCode, DEFAULT, ruleCombine(
		ruleIncToken(),
		ruleEndToken(),
		ruleBreakLine(),
	));
});

Tokenizer.switch(DEFAULT, DEFAULT, function defaultRule(t) {
	if (t.currentToken === undefined) {
		ruleStartToken(TOKEN_STRING)(t);
	}

	ruleIncToken()(t);
});

Tokenizer.switch(CHAR_EOF, DEFAULT, ruleCombine(
	ruleIncToken(),
	ruleEndToken(),
));


/**
 *
 * @param source
 * @param options
 */
export function tokenize(source: string, options: ITokenizerOptions = {}): IToken[] {
	const tokenizer = new Tokenizer(
		source,
		new LineDelimiterMatcher(options.lineDelimiter),
		options.debug,
	);

	let charCode;
	let tokenType;

	do {
		if (tokenizer.index === source.length) {
			charCode = CHAR_EOF;
		} else {
			charCode = source.charCodeAt(tokenizer.index);
		}

		tokenType = tokenizer.currentToken && tokenizer.currentToken.type;

		tokenizer.consume(charCode, <TokenType> tokenType);
		tokenizer.index++;

		if (charCode !== 0xA && charCode !== 0xD) {
			tokenizer.offset++;
		}
	} while (tokenizer.index <= source.length);

	// Ending the last tokens
	while (tokenizer.currentToken) {
		tokenizer.endToken();
	}

	return tokenizer.tokenList;
}
