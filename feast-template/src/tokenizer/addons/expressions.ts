import {
	DEFAULT,
	Tokenizer,
} from "../tokenizer";

import {
	CHAR_CLOSE_CURLY,
	CHAR_CR,
	CHAR_EQUALITY_SYMBOL,
	CHAR_FORWARD_SLASH,
	CHAR_LF,
	CHAR_OPEN_CURLY,
	CHAR_SPACE,
	CHAR_TAB,
	CHAR_TAG_END,
	CHAR_TAG_START,
	TOKEN_EXPRESSION,
} from "../types";

import {
	ruleCombine,
	ruleEndToken,
	ruleStartToken,
	ruleIncToken,
	ruleIncCurly,
	ruleDecCurly, ruleBreakLine,
} from "../rules";


// ==== Expression start ====

Tokenizer.switch(CHAR_OPEN_CURLY, DEFAULT, ruleCombine(
	ruleIncToken(),
	ruleEndToken(),
	ruleStartToken(TOKEN_EXPRESSION),
	ruleIncCurly(),
	function customRuleOffsetExpression(t: Tokenizer) {
		t.currentToken.start.index++;
		t.currentToken.start.offset++;
	}
));

// ==== Expression content ====

[
	DEFAULT,
	CHAR_TAG_START,
	CHAR_EQUALITY_SYMBOL,
	CHAR_FORWARD_SLASH,
	CHAR_TAG_END,
].forEach(charCode => {
	Tokenizer.switch(charCode, TOKEN_EXPRESSION, ruleCombine(
		ruleIncToken(),
	));
});

[
	CHAR_SPACE,
	CHAR_TAB,
	CHAR_LF,
	CHAR_CR,
].forEach(charCode => {
	Tokenizer.switch(charCode, TOKEN_EXPRESSION, ruleCombine(
		ruleIncToken(),
		ruleBreakLine(),
	));
});

// ==== Expression curly escape ====

Tokenizer.switch(CHAR_OPEN_CURLY, TOKEN_EXPRESSION, ruleCombine(
	ruleIncToken(),
	ruleIncCurly(),
));

Tokenizer.switch(CHAR_CLOSE_CURLY, TOKEN_EXPRESSION, ruleCombine(
	// ruleIncToken(),
	ruleDecCurly(),
	function customRuleCloseExpression(t: Tokenizer) {
		if (t.curlyBrackets === 0) {
			ruleEndToken()(t);
		}
	}
));
