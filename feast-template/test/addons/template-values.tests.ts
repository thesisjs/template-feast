import {
	parse,
} from "../../src/parser";

import {
	NODE_TAG,
	NODE_TEMPLATE,
	NODE_ATTRIBUTE,
	NODE_ATTRIBUTE_NAME,
	NODE_ATTRIBUTE_VALUE,
	NODE_ATTRIBUTE_TEMPLATE_VALUE,
	NODE_EXPRESSION,
} from "../../src/parser/types";

import {
	TOKEN_STRING,
	TOKEN_EXPRESSION,
} from "../../src/tokenizer/types";


describe('AST template values', () => {

	xtest('one self-closing, one attribute with a templated expression value', () => {
		expect(
			parse('<button title="Welcome, {input()}!"/>'),
		).toMatchObject({
			type: NODE_TEMPLATE,
			children: [
				{
					type: NODE_TAG,
					value: {
						type: TOKEN_STRING,
						value: 'button',
					},
					children: [
						{
							type: NODE_ATTRIBUTE,
							children: [
								{
									type: NODE_ATTRIBUTE_NAME,
									value: {
										type: TOKEN_STRING,
										value: 'title',
									},
								},
								{
									type: NODE_ATTRIBUTE_TEMPLATE_VALUE,
									children: [
										{
											type: NODE_ATTRIBUTE_VALUE,
											value: {
												type: TOKEN_STRING,
												value: 'Welcome, ',
											},
										},
										{
											type: NODE_EXPRESSION,
											value: {
												type: TOKEN_EXPRESSION,
												value: 'input()',
											},
										},
										{
											type: NODE_ATTRIBUTE_VALUE,
											value: {
												type: TOKEN_STRING,
												value: '!',
											},
										},
									],
								},
							],
						},
					],
				},
			],
		});
	});

});
