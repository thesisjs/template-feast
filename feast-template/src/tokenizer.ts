
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

	updateTokenValue(source, token);

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
	let tokenType;
	let curlyBrackets = 0;

	do {
		charCode = source.charCodeAt(i);
		tokenType = currentToken && currentToken.type;

		switch (charCode)
		{
			case 0x20: // Space
			case 0x9: // Tab
			case 0xA: // LF
			case 0xD: // CR
			{
				switch (tokenType)
				{
					case TOKEN_SINGLE_QUOTED_STRING:
					case TOKEN_DOUBLE_QUOTED_STRING:
					case TOKEN_EXPRESSION:
					{
						currentToken.end.index = i;
						currentToken.end.line = line;
						currentToken.end.offset = offset;

						break;
					}

					case TOKEN_STRING:
					{
						currentToken = endToken(source, currentToken, tokenList);
						// No break
					}

					default:
					{
						if (charCode === 0xA || charCode === 0xD) {
							lineDelimiterMatcher.push(source.substring(i, i + 1));

							if (lineDelimiterMatcher.matches()) {
								lineDelimiterMatcher.clear();
								offset = 1;
								line++;
							}
						}
					}
				}

				break;
			}

			case 0x3C: // <
			{
				switch (tokenType)
				{
					case TOKEN_SINGLE_QUOTED_STRING:
					case TOKEN_DOUBLE_QUOTED_STRING:
					case TOKEN_EXPRESSION:
					{
						currentToken.end.index = i;
						currentToken.end.line = line;
						currentToken.end.offset = offset;

						break;
					}

					case TOKEN_STRING:
					{
						currentToken = endToken(source, currentToken, tokenList);
						// No break
					}

					default:
					{
						currentToken = createSingleCharToken(TOKEN_TAG_OPEN, i, line, offset);
						tokenList.push(currentToken);
						currentToken = undefined;

						break;
					}
				}

				break;
			}

			case 0x3D: // =
			{
				switch (tokenType)
				{
					case TOKEN_SINGLE_QUOTED_STRING:
					case TOKEN_DOUBLE_QUOTED_STRING:
					case TOKEN_EXPRESSION:
					{
						currentToken.end.index = i;
						currentToken.end.line = line;
						currentToken.end.offset = offset;

						break;
					}

					case TOKEN_STRING:
					{
						currentToken = endToken(source, currentToken, tokenList);
						// No break
					}

					default:
					{
						currentToken = createSingleCharToken(TOKEN_ASSIGN, i, line, offset);
						tokenList.push(currentToken);
						currentToken = undefined;

						break;
					}
				}

				break;
			}

			case 0x27: // '
			{
				switch (tokenType) {
					case TOKEN_SINGLE_QUOTED_STRING:
					{
						currentToken = endToken(source, currentToken, tokenList);
						break;
					}

					case TOKEN_SINGLE_QUOTED_STRING_END:
					{
						currentToken.end = {
							index: i - 1,
							line,
							offset: offset - 1,
						};

						currentToken = endToken(source, currentToken, tokenList);
						break;
					}

					case TOKEN_DOUBLE_QUOTED_STRING:
					case TOKEN_DOUBLE_QUOTED_STRING_END:
					case TOKEN_EXPRESSION:
					{
						currentToken.end.index = i;
						currentToken.end.line = line;
						currentToken.end.offset = offset;
						break;
					}

					default:
					{
						if (currentToken) {
							currentToken = endToken(source, currentToken, tokenList);
						}

						currentToken = createSingleCharToken(
							TOKEN_SINGLE_QUOTED_STRING,
							i + 1,
							line,
							offset + 1
						);

						break;
					}
				}

				break;
			}

			case 0x22: // "
			{
				switch (tokenType) {
					case TOKEN_SINGLE_QUOTED_STRING:
					case TOKEN_SINGLE_QUOTED_STRING_END:
					case TOKEN_EXPRESSION:
					{
						currentToken.end.index = i;
						currentToken.end.line = line;
						currentToken.end.offset = offset;
						break;
					}

					case TOKEN_DOUBLE_QUOTED_STRING:
					{
						currentToken = endToken(source, currentToken, tokenList);
						break;
					}

					case TOKEN_DOUBLE_QUOTED_STRING_END:
					{
						currentToken.end = {
							index: i - 1,
							line,
							offset: offset - 1,
						};

						currentToken = endToken(source, currentToken, tokenList);
						break;
					}

					default:
					{
						if (currentToken) {
							currentToken = endToken(source, currentToken, tokenList);
						}

						currentToken = createSingleCharToken(
							TOKEN_DOUBLE_QUOTED_STRING,
							i + 1,
							line,
							offset + 1
						);

						break;
					}
				}

				break;
			}

			case 0x7B: // {
			{
				switch (tokenType) {
					case TOKEN_EXPRESSION:
					{
						currentToken.end.index = i;
						currentToken.end.line = line;
						currentToken.end.offset = offset;

						curlyBrackets++;
						break;
					}

					case TOKEN_SINGLE_QUOTED_STRING:
					{
						//currentToken.end.index--;
						//currentToken.end.offset--;
						currentToken.type = TOKEN_SINGLE_QUOTED_STRING_START;
						currentToken.end = {
							index: i - 1,
							line,
							offset: offset - 1,
						};

						updateTokenValue(source, currentToken);
						currentToken = endToken(source, currentToken, tokenList);

						currentToken = createSingleCharToken(
							TOKEN_EXPRESSION,
							i + 1,
							line,
							offset + 1
						);

						curlyBrackets++;

						break;
					}

					case TOKEN_SINGLE_QUOTED_STRING_END:
					{
						//currentToken.start.index--;
						//currentToken.start.offset--;
						currentToken.type = TOKEN_SINGLE_QUOTED_STRING_MIDDLE;
						currentToken.end = {
							index: i - 1,
							line,
							offset: offset - 1,
						};

						updateTokenValue(source, currentToken);
						currentToken = endToken(source, currentToken, tokenList);

						currentToken = createSingleCharToken(
							TOKEN_EXPRESSION,
							i + 1,
							line,
							offset + 1
						);

						curlyBrackets++;

						break;
					}

					case TOKEN_DOUBLE_QUOTED_STRING:
					{
						//currentToken.end.index--;
						//currentToken.end.offset--;
						currentToken.type = TOKEN_DOUBLE_QUOTED_STRING_START;
						currentToken.end = {
							index: i - 1,
							line,
							offset: offset - 1,
						};

						updateTokenValue(source, currentToken);
						currentToken = endToken(source, currentToken, tokenList);

						currentToken = createSingleCharToken(
							TOKEN_EXPRESSION,
							i + 1,
							line,
							offset + 1
						);

						curlyBrackets++;

						break;
					}

					case TOKEN_DOUBLE_QUOTED_STRING_END:
					{
						//currentToken.end.index--;
						//currentToken.end.offset--;
						currentToken.type = TOKEN_DOUBLE_QUOTED_STRING_MIDDLE;
						currentToken.end = {
							index: i - 1,
							line,
							offset: offset - 1,
						};

						updateTokenValue(source, currentToken);
						currentToken = endToken(source, currentToken, tokenList);

						currentToken = createSingleCharToken(
							TOKEN_EXPRESSION,
							i + 1,
							line,
							offset + 1
						);

						curlyBrackets++;

						break;
					}

					default:
					{
						currentToken = createSingleCharToken(
							TOKEN_EXPRESSION,
							i + 1,
							line,
							offset + 1
						);

						curlyBrackets++;
						break;
					}
				}

				break;
			}

			case 0x7D: // }
			{
				switch (tokenType) {
					case TOKEN_EXPRESSION:
					{
						curlyBrackets--;

						if (curlyBrackets === 0) {
							const lastToken = tokenList[tokenList.length - 1];
							currentToken = endToken(source, currentToken, tokenList);

							if (!lastToken) {
								break;
							}

							switch (lastToken.type) {
								case TOKEN_SINGLE_QUOTED_STRING_MIDDLE:
								{
									lastToken.end.index++;
									lastToken.end.offset++;

									updateTokenValue(source, lastToken);
									// No break
								}

								case TOKEN_SINGLE_QUOTED_STRING_START:
								{
									currentToken = createSingleCharToken(
										TOKEN_SINGLE_QUOTED_STRING_END,
										i + 1,
										line,
										offset + 1,
									);

									break;
								}

								case TOKEN_DOUBLE_QUOTED_STRING_MIDDLE:
								{
									lastToken.end.index++;
									lastToken.end.offset++;

									updateTokenValue(source, lastToken);
									// No break
								}

								case TOKEN_DOUBLE_QUOTED_STRING_START:
								{
									currentToken = createSingleCharToken(
										TOKEN_DOUBLE_QUOTED_STRING_END,
										i + 1,
										line,
										offset + 1,
									);

									break;
								}
							}
						} else {
							currentToken.end.index = i;
							currentToken.end.line = line;
							currentToken.end.offset = offset;
						}

						break;
					}

					default:
					{
						currentToken.end.index = i;
						currentToken.end.line = line;
						currentToken.end.offset = offset;

						break;
					}
				}

				break;
			}

			case 0x2F: // /
			{
				switch (tokenType)
				{
					case TOKEN_SINGLE_QUOTED_STRING:
					case TOKEN_DOUBLE_QUOTED_STRING:
					case TOKEN_EXPRESSION:
					{
						currentToken.end.index = i;
						currentToken.end.line = line;
						currentToken.end.offset = offset;

						break;
					}

					case TOKEN_STRING:
					{
						currentToken = endToken(source, currentToken, tokenList);
						// No break
					}

					default:
					{
						currentToken = createSingleCharToken(TOKEN_FORWARD_SLASH, i, line, offset);
						tokenList.push(currentToken);
						currentToken = undefined;

						break;
					}
				}

				break;
			}

			case 0x3E: // >
			{
				switch (tokenType)
				{
					case TOKEN_SINGLE_QUOTED_STRING:
					case TOKEN_DOUBLE_QUOTED_STRING:
					case TOKEN_EXPRESSION:
					{
						currentToken.end.index = i;
						currentToken.end.line = line;
						currentToken.end.offset = offset;

						break;
					}

					case TOKEN_STRING:
					{
						currentToken = endToken(source, currentToken, tokenList);
						// No break
					}

					default:
					{
						currentToken = createSingleCharToken(TOKEN_TAG_CLOSE, i, line, offset);
						tokenList.push(currentToken);
						currentToken = undefined;

						break;
					}
				}

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
