import {
	Parser,
	IParserOptions,
	IASTNode,
} from "./parser";

import {
	TOKEN_ASSIGN,
	TOKEN_FORWARD_SLASH,
	TOKEN_STRING,
	TOKEN_TAG_CLOSE,
	TOKEN_TAG_OPEN,
	TOKEN_EXPRESSION,
} from "../tokenizer/types";

import {
	NODE_ATTRIBUTE,
	NODE_ATTRIBUTE_NAME,
	NODE_ATTRIBUTE_VALUE,
	NODE_TAG,
	NODE_TEMPLATE,
	STATE_INITIAL,
	STATE_TAG_OPEN,
	STATE_TAG_ATTRIBUTE_NAME,
	STATE_TAG_ATTRIBUTE_ASSIGN,
	STATE_TAG_ATTRIBUTE_VALUE,
	STATE_TAG_CLOSING, NODE_ATTRIBUTE_TEMPLATE_VALUE, NODE_EXPRESSION,
} from "./types";

import {
	tokenize,
} from "../tokenizer";


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
	parser.bake(NODE_ATTRIBUTE);
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
	parser.bake(NODE_ATTRIBUTE);
	// Restoring tag node
	parser.bake(NODE_TAG);
});

Parser.switch(TOKEN_EXPRESSION, STATE_TAG_ATTRIBUTE_VALUE, (parser, token) => {
	parser.setState(STATE_TAG_ATTRIBUTE_NAME);

	parser.push({
		type: NODE_ATTRIBUTE_TEMPLATE_VALUE,
		start: token.start,
		end: token.end,
	});

	parser.push({
		type: NODE_EXPRESSION,
		start: token.start,
		end: token.end,
		value: token,
	});

	// Restoring attribute value node
	parser.bake(NODE_ATTRIBUTE_TEMPLATE_VALUE);
	// Restoring attribute node
	parser.bake(NODE_ATTRIBUTE);
	// Restoring tag node
	parser.bake(NODE_TAG);
});

Parser.switch(TOKEN_STRING, STATE_TAG_ATTRIBUTE_ASSIGN, (parser, token) => {
	// Restoring tag node
	parser.bake(NODE_TAG);

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
	parser.bake(NODE_ATTRIBUTE);
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
	parser.bake(NODE_TAG);
});

Parser.switch(TOKEN_TAG_CLOSE, STATE_TAG_CLOSING, (parser, token) => {
	parser.currentNode.end = token.end;
	parser.setState(STATE_INITIAL);

	// Restoring tag node
	parser.bake(NODE_TEMPLATE);
});


export function parse(source: string, options: IParserOptions = {}): IASTNode {
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
