import {
	DEFAULT,
	Tokenizer,
} from "../tokenizer";

import {
	CHAR_CR,
	CHAR_EOF,
	CHAR_EQUALITY_SYMBOL,
	CHAR_FORWARD_SLASH, CHAR_LF, CHAR_SPACE, CHAR_TAB,
	CHAR_TAG_END,
	CHAR_TAG_START,
	TOKEN_ASSIGN,
	TOKEN_FORWARD_SLASH,
	TOKEN_STRING,
	TOKEN_TAG_CLOSE,
	TOKEN_TAG_OPEN,
} from "../types";

import {
	ruleCombine,
	ruleEndToken,
	ruleStartToken,
	ruleIncToken,
} from "../rules";

import {
	createSingleCharParser,
} from "../utils/single-char-parser";


// ==== Tag start ====

createSingleCharParser(CHAR_TAG_START, TOKEN_TAG_OPEN);

// ==== Equality symbol ====

createSingleCharParser(CHAR_EQUALITY_SYMBOL, TOKEN_ASSIGN);

// ==== Forward slash ====

createSingleCharParser(CHAR_FORWARD_SLASH, TOKEN_FORWARD_SLASH);

// ==== Tag close ====

createSingleCharParser(CHAR_TAG_END, TOKEN_TAG_CLOSE);

// ==== Forward slash and tag close without spaces ====

Tokenizer.switch(CHAR_TAG_END, TOKEN_FORWARD_SLASH, ruleCombine(
	ruleIncToken(),
	ruleEndToken(),
	ruleStartToken(TOKEN_TAG_CLOSE),
));

// ==== Tag open after forward slash ====

Tokenizer.switch(CHAR_TAG_START, TOKEN_TAG_CLOSE, ruleCombine(
	ruleIncToken(),
	ruleEndToken(),
	ruleStartToken(TOKEN_TAG_OPEN),
));

// ==== Close tag before EOF ====

Tokenizer.switch(CHAR_EOF, TOKEN_TAG_CLOSE, ruleCombine(
	ruleIncToken(),
	ruleEndToken(),
));
