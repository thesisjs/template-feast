import {
	TokenType
} from "./types";

import {
	createSingleCharToken,
	Tokenizer
} from "./tokenizer";


/**
 * Starts token from the current tokenizer position
 * @param {TokenType} tokenType
 */
export function ruleStartToken(tokenType: TokenType) {
	return function ruleStartTokenImpl(t: Tokenizer) {
		t.currentToken = {
			type: tokenType,
			start: {
				index: t.index,
				line: t.line,
				offset: t.offset,
			},
			end: {
				index: t.index,
				line: t.line,
				offset: t.offset,
			}
		};
	}
}

/**
 * Ends current token
 */
export function ruleEndToken() {
	return function ruleEndTokenImpl(t: Tokenizer) {
		t.endToken();
	}
}

/**
 * Increases token to contain current symbol
 */
export function ruleIncToken() {
	return function ruleIncTokenImpl(t: Tokenizer) {
		if (!t.currentToken) {
			return;
		}

		t.currentToken.end.index = t.index;
		t.currentToken.end.line = t.line;
		t.currentToken.end.offset = t.offset;
	}
}

/**
 * Breaks new line if line delimiter is found
 */
export function ruleBreakLine() {
	return function ruleBreakLineImpl(t: Tokenizer, charCode: number) {
		if (charCode === 0xA || charCode === 0xD) {
			t.lineDelimiterMatcher.push(t.source.substring(t.index, t.index + 1));

			if (t.lineDelimiterMatcher.matches()) {
				t.lineDelimiterMatcher.clear();
				t.offset = 1;
				t.line++;
			}
		}
	}
}

/**
 * Increments curly brackets counter
 */
export function ruleIncCurly() {
	return function ruleIncCurlyImpl(t: Tokenizer) {
		t.curlyBrackets++;
	}
}

/**
 * Increments curly brackets counter
 */
export function ruleDecCurly() {
	return function ruleDecCurlyImpl(t: Tokenizer) {
		t.curlyBrackets--;
	}
}

/**
 * Applies rules in order
 * @param rules
 */
export function ruleCombine(...rules: ((t: Tokenizer, charCode: number) => void)[]) {
	return function ruleCombineImpl(t: Tokenizer, charCode: number) {
		for (const rule of rules) {
			if (t.debug) {
				t.debugLog.push(rule.name);
			}

			rule(t, charCode);
		}
	}
}
