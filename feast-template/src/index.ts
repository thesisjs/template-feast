
const STATE_INITIAL = 0;
const STATE_TAG_OPEN = 1;
const STATE_TAG_NAME = 2;
const STATE_TAG_ATTRIBUTES = 3;
const STATE_TAG_CLOSING = 4;

const NODE_TEMPLATE = 'feast::template';
const NODE_TAG = 'feast::tag';

interface ICodePosition {
	index: number;
	line: number;
	offset: number;
}

interface IToken {
	start?: ICodePosition;
	end?: ICodePosition;
	value?: string;
}

interface IASTNode {
	type: typeof NODE_TEMPLATE | typeof NODE_TAG;
	start?: ICodePosition;
	end?: ICodePosition;
	name?: IToken;
	parent?: IASTNode;
	children?: IASTNode[];
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

function raiseError(line: number, offset: number, message: string) {
	return {
		error: message,
		line,
		offset,
	}
}

interface IParserOptions {
	sourceMaps?: boolean;
	lineDelimiter?: string;
}

export function parseFeastTemplate(source: string, options: IParserOptions = {}) {
	let currentAstNode: IASTNode = {
		type: NODE_TEMPLATE,
		children: [],
	};

	const lineDelimiterMatcher = new LineDelimiterMatcher(options.lineDelimiter);

	let i = 0;
	let line = 1;
	let offset = 1;
	let state = STATE_INITIAL;

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
				switch (state) {
					case STATE_TAG_NAME:
					{
						state = STATE_TAG_ATTRIBUTES;

						currentAstNode.name.end = {
							index: i,
							line,
							offset,
						};

						currentAstNode.name.value = source.substring(
							currentAstNode.name.start.index,
							currentAstNode.name.end.index,
						);

						break;
					}
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
				switch (state)
				{
					case STATE_INITIAL:
					{
						state = STATE_TAG_OPEN;
						currentAstNode = {
							type: NODE_TAG,
							parent: currentAstNode,
							start: {
								index: i,
								line,
								offset,
							},
						};

						break;
					}

					default:
					{
						return raiseError(line, offset, 'Tag opening expected');
					}
				}

				break;
			}

			case 0x2F: // /
			{
				switch (state) {
					case STATE_TAG_NAME:
					{
						state = STATE_TAG_CLOSING;

						currentAstNode.name.end = {
							index: i,
							line,
							offset,
						};

						currentAstNode.name.value = source.substring(
							currentAstNode.name.start.index,
							currentAstNode.name.end.index,
						);

						break;
					}

					case STATE_TAG_ATTRIBUTES: {
						state = STATE_TAG_CLOSING;

						break;
					}

					default:
					{
						return raiseError(line, offset, 'Tag name or attributes expected');
					}
				}

				break;
			}

			case 0x3E: // >
			{
				switch (state) {
					case STATE_TAG_CLOSING: {
						state = STATE_INITIAL;

						currentAstNode.end = {
							index: i + 1,
							line,
							offset: offset + 1,
						};

						currentAstNode.parent.children = currentAstNode.parent.children || [];
						currentAstNode.parent.children.push(currentAstNode);
						currentAstNode = currentAstNode.parent;

						break;
					}

					default:
					{
						return raiseError(line, offset, 'Tag closing expected');
					}
				}

				break;
			}

			default:
			{
				switch (state)
				{
					case STATE_TAG_OPEN:
					{
						state = STATE_TAG_NAME;
						currentAstNode.name = {
							start: {
								index: i,
								line,
								offset,
							},
						};

						break;
					}
				}
			}
		}

		i++;

		if (charCode !== 0xA && charCode !== 0xD) {
			offset++;
		}
	} while (i < source.length);

	return currentAstNode;
}
