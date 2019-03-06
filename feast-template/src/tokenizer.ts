
export const TOKEN_TAG_OPEN = 'token::tag-open';
export const TOKEN_STRING = 'token::string';
export const TOKEN_FORWARD_SLASH = 'token::forward-slash';
export const TOKEN_TAG_CLOSE = 'token::tag-close';

export type TokenType = typeof TOKEN_TAG_OPEN |
	typeof TOKEN_TAG_CLOSE |
	typeof TOKEN_STRING |
	typeof TOKEN_FORWARD_SLASH;

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

export interface ITokenizerOptions {
	lineDelimiter?: string;
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

function endToken(source: string, token: IToken, tokenList: IToken[]): IToken {
	const firstCharCode = source.charCodeAt(token.start.index);

	if (
		// Correction for multi-char tokens
		token.end.index - token.start.index > 1 ||
		// THe next symbol is a surrogate half
		firstCharCode >= 0xD800 && firstCharCode <= 0xDBFF
	) {
		token.end.index++;
		token.end.offset++;
	}

	token.value = source.substring(
		token.start.index,
		token.end.index,
	);

	tokenList.push(token);

	return undefined;
}

export function tokenize(source: string, options: ITokenizerOptions = {}): IToken[] {
	const tokenList: IToken[] = [];
	let currentToken: IToken;

	const lineDelimiterMatcher = new LineDelimiterMatcher(options.lineDelimiter);

	let i = 0;
	let line = 1;
	let offset = 1;

	let charCode;

	do {
		charCode = source.charCodeAt(i);

		switch (charCode)
		{
			case 0x20: // Space
			case 0x9: // Tab
			case 0xA: // LF
			case 0xD: // CR
			{
				// Ending current token
				if (currentToken && currentToken.type === TOKEN_STRING) {
					currentToken = endToken(source, currentToken, tokenList);
				}

				if (charCode === 0xA || charCode === 0xD) {
					lineDelimiterMatcher.push(source.substring(i, i + 1));

					if (lineDelimiterMatcher.matches()) {
						lineDelimiterMatcher.clear();
						offset = 1;
						line++;
					}
				}

				break;
			}

			case 0x3C: // <
			{
				// Ending current token
				if (currentToken && currentToken.type === TOKEN_STRING) {
					currentToken = endToken(source, currentToken, tokenList);
				}

				currentToken = createSingleCharToken(TOKEN_TAG_OPEN, i, line, offset);

				tokenList.push(currentToken);
				currentToken = undefined;

				break;
			}

			case 0x2F: // /
			{
				// Ending current token
				if (currentToken && currentToken.type === TOKEN_STRING) {
					currentToken = endToken(source, currentToken, tokenList);
				}

				currentToken = createSingleCharToken(TOKEN_FORWARD_SLASH, i, line, offset);

				tokenList.push(currentToken);
				currentToken = undefined;

				break;
			}

			case 0x3E: // >
			{
				// Ending current token
				if (currentToken && currentToken.type === TOKEN_STRING) {
					currentToken = endToken(source, currentToken, tokenList);
				}

				currentToken = createSingleCharToken(TOKEN_TAG_CLOSE, i, line, offset);

				tokenList.push(currentToken);
				currentToken = undefined;

				break;
			}

			default:
			{
				if (currentToken === undefined) {
					currentToken = createSingleCharToken(TOKEN_STRING, i, line, offset);

					break;
				}

				currentToken.end.index = i;
				currentToken.end.line = line;
				currentToken.end.offset = offset;

				break;
			}
		}

		i++;

		if (charCode !== 0xA && charCode !== 0xD) {
			offset++;
		}
	} while (i < source.length);

	// Ending the last token
	if (currentToken && currentToken.type === TOKEN_STRING) {
		endToken(source, currentToken, tokenList);
	}

	return tokenList;
}
