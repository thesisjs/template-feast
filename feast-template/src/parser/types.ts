
export const NODE_TEMPLATE = 'node::template';
export const NODE_TAG = 'node::tag';
export const NODE_ERROR = 'node::error';
export const NODE_ATTRIBUTE = 'node::attribute';
export const NODE_ATTRIBUTE_NAME = 'node::attribute-name';
export const NODE_ATTRIBUTE_VALUE = 'node::attribute-value';
export const NODE_ATTRIBUTE_TEMPLATE_VALUE = 'node::attribute-template-value';
export const NODE_EXPRESSION = 'node::expression';

export type ASTNodeType = typeof NODE_TEMPLATE
	| typeof NODE_TAG
	| typeof NODE_ERROR
	| typeof NODE_ATTRIBUTE
	| typeof NODE_ATTRIBUTE_NAME
	| typeof NODE_ATTRIBUTE_VALUE
	| typeof NODE_ATTRIBUTE_TEMPLATE_VALUE
	| typeof NODE_EXPRESSION;

export const STATE_INITIAL = 'state::initial';
export const STATE_TAG_OPEN = 'state::tag-open';
export const STATE_TAG_ATTRIBUTE_NAME = 'state::tag-attribute-name';
export const STATE_TAG_ATTRIBUTE_ASSIGN = 'state::tag-attribute-assign';
export const STATE_TAG_ATTRIBUTE_VALUE = 'state::tag-attribute-value';
export const STATE_TAG_ATTRIBUTE_TEMPLATE_VALUE = 'state::tag-attribute-template-value';
export const STATE_TAG_CLOSING = 'state::tag-closing';

export type ParserState = typeof STATE_INITIAL
	| typeof STATE_TAG_OPEN
	| typeof STATE_TAG_ATTRIBUTE_NAME
	| typeof STATE_TAG_ATTRIBUTE_ASSIGN
	| typeof STATE_TAG_ATTRIBUTE_VALUE
	| typeof STATE_TAG_ATTRIBUTE_TEMPLATE_VALUE
	| typeof STATE_TAG_CLOSING;
