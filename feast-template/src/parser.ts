import {
	tokenize,
	IToken,
	ICodePosition,
	TokenType,
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

type ParserState = typeof STATE_INITIAL
	| typeof STATE_TAG_OPEN
	| typeof STATE_TAG_ATTRIBUTE_NAME
	| typeof STATE_TAG_ATTRIBUTE_ASSIGN
	| typeof STATE_TAG_ATTRIBUTE_VALUE
	| typeof STATE_TAG_CLOSING;

type ASTNodeType = typeof NODE_TEMPLATE
	| typeof NODE_TAG
	| typeof NODE_ERROR
	| typeof NODE_ATTRIBUTE
	| typeof NODE_ATTRIBUTE_NAME
	| typeof NODE_ATTRIBUTE_VALUE;

type ParserSwitchHandler = (parser: Parser, token: IToken) => any;

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

class Parser {
	private static cases: {[key: string]: {[key: number]: ParserSwitchHandler}} = {};

	static switch(token: TokenType, state: ParserState, handler: ParserSwitchHandler) {
		Parser.cases[token] = Parser.cases[token] || {};
		Parser.cases[token][state] = handler;
	}

	public currentNode: IASTNode;
	public state: ParserState = STATE_INITIAL;
	public died: boolean = false;

	constructor(root: IASTNode) {
		this.currentNode = root;
	}

	push(node: IASTNode) {
		node.parent = this.currentNode;
		this.currentNode = node;
	}

	bake(node: IASTNode = this.currentNode) {
		node.parent.children = node.parent.children || [];
		node.parent.children.push(node);
		this.currentNode = node.parent;
	}

	setState(state: ParserState) {
		this.state = state;
	}

	consume(token: IToken) {
		const transitions = Parser.cases[token.type];

		if (!transitions) {
			this.raiseError(token, 'Tag attribute value assignment expected');
			return;
		}

		const handler = transitions[this.state];

		if (!handler) {
			this.raiseError(token, 'Tag attribute value assignment expected');
			return;
		}

		handler(this, token);
	}

	raiseError(token: IToken, message: string) {
		this.died = true;

		this.push({
			type: NODE_ERROR,
			value: {
				type: token.type,
				start: token.start,
				end: token.end,
				value: message,
			},
		});

		this.bake();
	}
}


Parser.switch(TOKEN_TAG_OPEN, STATE_INITIAL, (parser, token) => {
	parser.setState(STATE_TAG_OPEN);

	parser.push({
		type: NODE_TAG,
		start: token.start,
	});
});

Parser.switch(TOKEN_STRING, STATE_TAG_OPEN, (parser, token) => {
	parser.setState(STATE_TAG_ATTRIBUTE_NAME);
	parser.currentNode.value = token;
});

Parser.switch(TOKEN_STRING, STATE_TAG_ATTRIBUTE_NAME, (parser, token) => {
	parser.setState(STATE_TAG_ATTRIBUTE_ASSIGN);

	parser.push({
		type: NODE_ATTRIBUTE,
		start: token.start,
	});

	parser.push({
		type: NODE_ATTRIBUTE_NAME,
		start: token.start,
		end: token.end,
		value: token,
	});

	// Restoring attribute node
	parser.bake();
});

Parser.switch(TOKEN_STRING, STATE_TAG_ATTRIBUTE_VALUE, (parser, token) => {
	parser.setState(STATE_TAG_ATTRIBUTE_NAME);

	parser.push({
		type: NODE_ATTRIBUTE_VALUE,
		start: token.start,
		end: token.end,
		value: token,
	});

	// Restoring attribute node
	parser.bake();
	// Restoring tag node
	parser.bake();
});

Parser.switch(TOKEN_STRING, STATE_TAG_ATTRIBUTE_ASSIGN, (parser, token) => {
	// Restoring tag node
	parser.bake();

	// Creating new attribute node
	parser.push({
		type: NODE_ATTRIBUTE,
		start: token.start,
	});

	// Creating new attribute name node
	parser.push({
		type: NODE_ATTRIBUTE_NAME,
		start: token.start,
		end: token.end,
		value: token,
	});

	// Restoring attribute node
	parser.bake();
});

Parser.switch(TOKEN_ASSIGN, STATE_TAG_ATTRIBUTE_ASSIGN, (parser) => {
	parser.setState(STATE_TAG_ATTRIBUTE_VALUE);
});

Parser.switch(TOKEN_FORWARD_SLASH, STATE_TAG_ATTRIBUTE_NAME, (parser) => {
	parser.setState(STATE_TAG_CLOSING);
});

Parser.switch(TOKEN_FORWARD_SLASH, STATE_TAG_ATTRIBUTE_ASSIGN, (parser) => {
	parser.setState(STATE_TAG_CLOSING);

	// Restoring tag node
	parser.bake();
});

Parser.switch(TOKEN_TAG_CLOSE, STATE_TAG_CLOSING, (parser, token) => {
	parser.currentNode.end = token.end;
	parser.setState(STATE_INITIAL);

	// Restoring tag node
	parser.bake();
});

export function parseFeastTemplate(source: string, options: IParserOptions = {}): IASTNode {
	const tokenList = tokenize(source, options);

	const parser = new Parser({
		type: NODE_TEMPLATE,
		children: [],
	});

	for (let i = 0; i < tokenList.length; i++) {
		parser.consume(tokenList[i]);

		// In strict mode
		// If parser died, return stack head, which is an error node
		if (parser.died) {
			return parser.currentNode;
		}
	}

	return parser.currentNode;
}
