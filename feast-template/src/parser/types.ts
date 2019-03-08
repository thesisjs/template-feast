
export const NODE_TEMPLATE = 'feast::template';
export const NODE_TAG = 'feast::tag';
export const NODE_ERROR = 'feast::error';
export const NODE_ATTRIBUTE = 'feast::attribute';
export const NODE_ATTRIBUTE_NAME = 'feast::attribute-name';
export const NODE_ATTRIBUTE_VALUE = 'feast::attribute-value';
export const NODE_ATTRIBUTE_TEMPLATE_VALUE = 'feast::attribute-template-value';
export const NODE_EXPRESSION = 'feast::expression';

export type ASTNodeType = typeof NODE_TEMPLATE
	| typeof NODE_TAG
	| typeof NODE_ERROR
	| typeof NODE_ATTRIBUTE
	| typeof NODE_ATTRIBUTE_NAME
	| typeof NODE_ATTRIBUTE_VALUE
	| typeof NODE_ATTRIBUTE_TEMPLATE_VALUE
	| typeof NODE_EXPRESSION;

export const STATE_INITIAL = 0;
export const STATE_TAG_OPEN = 1;
export const STATE_TAG_ATTRIBUTE_NAME = 2;
export const STATE_TAG_ATTRIBUTE_ASSIGN = 3;
export const STATE_TAG_ATTRIBUTE_VALUE = 4;
export const STATE_TAG_CLOSING = 4;

export type ParserState = typeof STATE_INITIAL
	| typeof STATE_TAG_OPEN
	| typeof STATE_TAG_ATTRIBUTE_NAME
	| typeof STATE_TAG_ATTRIBUTE_ASSIGN
	| typeof STATE_TAG_ATTRIBUTE_VALUE
	| typeof STATE_TAG_CLOSING;
