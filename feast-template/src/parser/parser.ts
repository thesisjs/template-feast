import {
	IToken,
	ICodePosition,
} from "../tokenizer/tokenizer";

import {
	TokenType,
} from "../tokenizer/types";


import {
	ASTNodeType,
	ParserState,
	NODE_ERROR,
	STATE_INITIAL,
} from "./types";


type ParserSwitchHandler = (parser: Parser, token: IToken) => any;

export interface IASTNode {
	type: ASTNodeType;
	start?: ICodePosition;
	end?: ICodePosition;
	value?: IToken;
	parent?: IASTNode;
	children?: IASTNode[];
}

export interface IParserOptions {
	sourceMaps?: boolean;
	lineDelimiter?: string;
}

export class Parser {
	private static cases: {[key: string]: {[key: number]: ParserSwitchHandler}} = {};

	static switch(token: TokenType, state: ParserState, handler: ParserSwitchHandler) {
		Parser.cases[token] = Parser.cases[token] || {};
		Parser.cases[token][state] = handler;
	}

	static case(token: TokenType, state: ParserState): ParserSwitchHandler {
		return Parser.cases[token] && Parser.cases[token][state];
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

	bake(expect?: ASTNodeType) {
		this.currentNode.parent.children = this.currentNode.parent.children || [];
		this.currentNode.parent.children.push(this.currentNode);
		this.currentNode = this.currentNode.parent;

		if (expect === undefined) {
			return;
		}

		if (this.currentNode.type !== expect) {
			throw new Error(
				`Corrupted stack: expected ${expect}, but ${this.currentNode.type} was found instead`
			);
		}
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
