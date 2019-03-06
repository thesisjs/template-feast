import {
	tokenize,
	IToken,
	ICodePosition,
	TOKEN_TAG_OPEN,
	TOKEN_FORWARD_SLASH,
	TOKEN_STRING,
	TOKEN_TAG_CLOSE,
} from "./tokenizer";

const STATE_INITIAL = 0;
const STATE_TAG_OPEN = 1;
const STATE_TAG_ATTRIBUTES = 2;
const STATE_TAG_CLOSING = 3;

export const NODE_TEMPLATE = 'feast::template';
export const NODE_TAG = 'feast::tag';
export const NODE_ERROR = 'feast::error';

type ASTNodeType = typeof NODE_TEMPLATE
	| typeof NODE_TAG
	| typeof NODE_ERROR;


interface IASTNode {
	type: ASTNodeType;
	start?: ICodePosition;
	end?: ICodePosition;
	name?: IToken;
	parent?: IASTNode;
	children?: IASTNode[];
}

interface IParserOptions {
	sourceMaps?: boolean;
	lineDelimiter?: string;
}

function raiseError(token: IToken, message: string): IASTNode {
	return {
		type: NODE_ERROR,
		name: {
			type: TOKEN_STRING,
			start: token.start,
			end: token.end,
			value: message,
		},
	}
}

function pushNode(currentNode: IASTNode): IASTNode {
	currentNode.parent.children = currentNode.parent.children || [];
	currentNode.parent.children.push(currentNode);
	return currentNode.parent;
}

export function parseFeastTemplate(source: string, options: IParserOptions = {}): IASTNode {
	const tokenList = tokenize(source, options);

	let currentNode: IASTNode = {
		type: NODE_TEMPLATE,
		children: [],
	};

	let state = STATE_INITIAL;
	let token;

	for (let i = 0; i < tokenList.length; i++) {
		token = tokenList[i];

		switch (token.type)
		{
			case TOKEN_TAG_OPEN:
			{
				switch (state)
				{
					case STATE_INITIAL:
					{
						state = STATE_TAG_OPEN;
						currentNode = {
							type: NODE_TAG,
							parent: currentNode,
							start: token.start,
						};

						break;
					}

					default:
					{
						return raiseError(token, 'Tag opening expected');
					}
				}

				break;
			}

			case TOKEN_STRING:
			{
				switch (state)
				{
					case STATE_TAG_OPEN:
					{
						state = STATE_TAG_ATTRIBUTES;
						currentNode.name = token;

						break;
					}

					default:
					{
						return raiseError(token, 'Tag opening expected');
					}
				}

				break;
			}

			case TOKEN_FORWARD_SLASH:
			{
				switch (state)
				{
					case STATE_TAG_ATTRIBUTES:
					{
						state = STATE_TAG_CLOSING;

						break;
					}

					default:
					{
						return raiseError(token, 'Tag attributes expected');
					}
				}

				break;
			}

			case TOKEN_TAG_CLOSE:
			{
				switch (state)
				{
					case STATE_TAG_CLOSING:
					{
						currentNode.end = token.end;
						currentNode = pushNode(currentNode);

						break;
					}

					default:
					{
						return raiseError(token, 'Tag closing expected');
					}
				}
			}
		}
	}

	return currentNode;
}
