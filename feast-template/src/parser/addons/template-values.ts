import {Parser} from "../parser";

import {
	TOKEN_DOUBLE_QUOTED_STRING_END,
	TOKEN_DOUBLE_QUOTED_STRING_MIDDLE,
	TOKEN_DOUBLE_QUOTED_STRING_START,
	TOKEN_EXPRESSION,
	TOKEN_SINGLE_QUOTED_STRING_END,
	TOKEN_SINGLE_QUOTED_STRING_MIDDLE,
	TOKEN_SINGLE_QUOTED_STRING_START, TOKEN_STRING
} from "../../tokenizer/types";

import {
	NODE_ATTRIBUTE,
	NODE_ATTRIBUTE_TEMPLATE_VALUE,
	NODE_ATTRIBUTE_VALUE, NODE_EXPRESSION,
	NODE_TAG, STATE_TAG_ATTRIBUTE_NAME,
	STATE_TAG_ATTRIBUTE_TEMPLATE_VALUE,
	STATE_TAG_ATTRIBUTE_VALUE
} from "../types";


// ==== [ Constant parts ] ====

Parser.switch(TOKEN_SINGLE_QUOTED_STRING_START, STATE_TAG_ATTRIBUTE_VALUE, (parser, token) => {
	parser.setState(STATE_TAG_ATTRIBUTE_TEMPLATE_VALUE);

	parser.push({
		type: NODE_ATTRIBUTE_TEMPLATE_VALUE,
		start: token.start,
		end: token.end,
	});

	parser.push({
		type: NODE_ATTRIBUTE_VALUE,
		start: token.start,
		end: token.end,
		value: {
			...token,
			type: TOKEN_STRING,
		},
	});

	// Restoring attribute template value node
	parser.bake(NODE_ATTRIBUTE_TEMPLATE_VALUE);
});

Parser.switch(TOKEN_DOUBLE_QUOTED_STRING_START, STATE_TAG_ATTRIBUTE_VALUE,
	Parser.case(TOKEN_SINGLE_QUOTED_STRING_START, STATE_TAG_ATTRIBUTE_VALUE),
);

Parser.switch(TOKEN_SINGLE_QUOTED_STRING_MIDDLE, STATE_TAG_ATTRIBUTE_TEMPLATE_VALUE, (parser, token) => {
	parser.push({
		type: NODE_ATTRIBUTE_VALUE,
		start: token.start,
		end: token.end,
		value: {
			...token,
			type: TOKEN_STRING,
		},
	});

	// Restoring attribute template value node
	parser.bake(NODE_ATTRIBUTE_TEMPLATE_VALUE);
});

Parser.switch(TOKEN_DOUBLE_QUOTED_STRING_MIDDLE, STATE_TAG_ATTRIBUTE_TEMPLATE_VALUE,
	Parser.case(TOKEN_SINGLE_QUOTED_STRING_MIDDLE, STATE_TAG_ATTRIBUTE_TEMPLATE_VALUE),
);

Parser.switch(TOKEN_SINGLE_QUOTED_STRING_END, STATE_TAG_ATTRIBUTE_TEMPLATE_VALUE, (parser, token) => {
	parser.setState(STATE_TAG_ATTRIBUTE_NAME);

	parser.push({
		type: NODE_ATTRIBUTE_VALUE,
		start: token.start,
		end: token.end,
		value: {
			...token,
			type: TOKEN_STRING,
		},
	});

	// Restoring attribute template value node
	parser.bake(NODE_ATTRIBUTE_TEMPLATE_VALUE);

	parser.currentNode.end = token.end;
	// Restoring attribute node
	parser.bake(NODE_ATTRIBUTE);
	// Restoring tag node
	parser.bake(NODE_TAG);
});

Parser.switch(TOKEN_DOUBLE_QUOTED_STRING_END, STATE_TAG_ATTRIBUTE_TEMPLATE_VALUE,
	Parser.case(TOKEN_SINGLE_QUOTED_STRING_END, STATE_TAG_ATTRIBUTE_TEMPLATE_VALUE),
);


// ==== [ Dynamic parts ] ====

Parser.switch(TOKEN_EXPRESSION, STATE_TAG_ATTRIBUTE_TEMPLATE_VALUE, (parser, token) => {
	parser.push({
		type: NODE_EXPRESSION,
		start: token.start,
		end: token.end,
		value: token,
	});

	// Restoring attribute template value node
	parser.bake(NODE_ATTRIBUTE_TEMPLATE_VALUE);
});
