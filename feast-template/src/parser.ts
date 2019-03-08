import {
	tokenize,
	IToken,
	ICodePosition,
	TOKEN_TAG_OPEN,
	TOKEN_FORWARD_SLASH,
	TOKEN_STRING,
	TOKEN_TAG_CLOSE,
	TOKEN_ASSIGN,
} from "./tokenizer";

const STATE_INITIAL = 0;
const STATE_TAG_OPEN = 1;
const STATE_TAG_ATTRIBUTE_NAME = 2;
const STATE_TAG_ATTRIBUTE_ASSIGN = 3;
const STATE_TAG_ATTRIBUTE_VALUE = 4;
const STATE_TAG_CLOSING = 4;

export const NODE_TEMPLATE = 'feast::template';
export const NODE_TAG = 'feast::tag';
export const NODE_ERROR = 'feast::error';
export const NODE_ATTRIBUTE = 'feast::attribute';
export const NODE_ATTRIBUTE_NAME = 'feast::attribute-name';
export const NODE_ATTRIBUTE_VALUE = 'feast::attribute-value';

type ASTNodeType = typeof NODE_TEMPLATE
	| typeof NODE_TAG
	| typeof NODE_ERROR
	| typeof NODE_ATTRIBUTE
	| typeof NODE_ATTRIBUTE_NAME
	| typeof NODE_ATTRIBUTE_VALUE;


interface IASTNode {
	type: ASTNodeType;
	start?: ICodePosition;
	end?: ICodePosition;
	value?: IToken;
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
		value: {
			type: token.type,
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
						state = STATE_TAG_ATTRIBUTE_NAME;
						currentNode.value = token;

						break;
					}

					case STATE_TAG_ATTRIBUTE_NAME:
					{
						state = STATE_TAG_ATTRIBUTE_ASSIGN;

						currentNode = {
							type: NODE_ATTRIBUTE,
							parent: currentNode,
							start: token.start,
						};

						currentNode = {
							type: NODE_ATTRIBUTE_NAME,
							parent: currentNode,
							start: token.start,
							end: token.end,
							value: token,
						};

						// Restoring attribute node
						currentNode = pushNode(currentNode);

						break;
					}

					case STATE_TAG_ATTRIBUTE_VALUE:
					{
						state = STATE_TAG_ATTRIBUTE_NAME;

						currentNode = {
							type: NODE_ATTRIBUTE_VALUE,
							parent: currentNode,
							start: token.start,
							end: token.end,
							value: token,
						};

						// Restoring attribute node
						currentNode = pushNode(currentNode);
						// Restoring tag node
						currentNode = pushNode(currentNode);

						break;
					}

					case STATE_TAG_ATTRIBUTE_ASSIGN:
					{
						// Restoring tag node
						currentNode = pushNode(currentNode);

						// Creating new attribute node
						currentNode = {
							type: NODE_ATTRIBUTE,
							parent: currentNode,
							start: token.start,
						};

						// Creating new attribute name node
						currentNode = {
							type: NODE_ATTRIBUTE_NAME,
							parent: currentNode,
							start: token.start,
							end: token.end,
							value: token,
						};

						// Restoring attribute node
						currentNode = pushNode(currentNode);

						break;
					}

					default:
					{
						return raiseError(token, 'Tag opening expected');
					}
				}

				break;
			}

			case TOKEN_ASSIGN:
			{
				switch (state)
				{
					case STATE_TAG_ATTRIBUTE_ASSIGN:
					{
						state = STATE_TAG_ATTRIBUTE_VALUE;

						break;
					}

					default:
					{
						return raiseError(token, 'Tag attribute value assignment expected');
					}
				}

				break;
			}

			case TOKEN_FORWARD_SLASH:
			{
				switch (state)
				{
					case STATE_TAG_ATTRIBUTE_NAME:
					{
						state = STATE_TAG_CLOSING;

						break;
					}

					case STATE_TAG_ATTRIBUTE_ASSIGN:
					{
						state = STATE_TAG_CLOSING;

						// Restoring tag node
						currentNode = pushNode(currentNode);

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
						state = STATE_INITIAL;

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
