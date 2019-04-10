import {
	CHAR_CR,
	CHAR_LF,
	CHAR_SPACE,
	CHAR_TAB,
	CHAR_TAG_START,
	TOKEN_STRING,
	TOKEN_TAG_OPEN,
	TokenType
} from "../types";

import {
	DEFAULT,
	Tokenizer,
} from "../tokenizer";

import {
	ruleBreakLine,
	ruleCombine,
	ruleEndToken,
	ruleIncToken,
	ruleStartToken,
} from "../rules";


export function createSingleCharParser(charCode: number, tokenType: TokenType) {
	Tokenizer.switch(charCode, DEFAULT, ruleCombine(
		ruleIncToken(),
		ruleEndToken(),
		ruleStartToken(tokenType),
	));

	Tokenizer.switch(charCode, TOKEN_STRING, ruleCombine(
		ruleIncToken(),
		ruleEndToken(),
		ruleStartToken(tokenType),
	));

	Tokenizer.switch(DEFAULT, tokenType, ruleCombine(
		ruleIncToken(),
		ruleEndToken(),
		ruleStartToken(TOKEN_STRING),
	));

	[
		CHAR_SPACE,
		CHAR_TAB,
		CHAR_LF,
		CHAR_CR,
	].forEach(charCode => {
		Tokenizer.switch(charCode, tokenType, ruleCombine(
			ruleIncToken(),
			ruleEndToken(),
			ruleBreakLine(),
		));
	});
}
