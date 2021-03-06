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


describe('AST source maps', () => {

	test('no spaces, no line breaks', () => {
		expect(
			parse('<button/>'),
		).toMatchObject({
			type: NODE_TEMPLATE,
			children: [
				{
					type: NODE_TAG,
					start: {
						index: 0,
						line: 1,
						offset: 1,
					},
					end: {
						index: 9,
						line: 1,
						offset: 10,
					},
					value: {
						start: {
							index: 1,
							line: 1,
							offset: 2,
						},
						end: {
							index: 7,
							line: 1,
							offset: 8,
						},
						value: 'button',
					},
				},
			],
		});
	});

	test('spaces, no line breaks', () => {
		expect(
			parse('  <  button / >   '),
		).toMatchObject({
			type: NODE_TEMPLATE,
			children: [
				{
					type: NODE_TAG,
					start: {
						index: 2,
						line: 1,
						offset: 3,
					},
					end: {
						index: 15,
						line: 1,
						offset: 16,
					},
					value: {
						start: {
							index: 5,
							line: 1,
							offset: 6,
						},
						end: {
							index: 11,
							line: 1,
							offset: 12,
						},
						value: 'button',
					},
				},
			],
		});
	});

	test('sapces, line breaks', () => {
		expect(
			parse('  \n\t\t<  button\n\n\t\t />   ', {lineDelimiter: '\n'}),
		).toMatchObject({
			type: NODE_TEMPLATE,
			children: [
				{
					type: NODE_TAG,
					start: {
						index: 5,
						line: 2,
						offset: 3,
					},
					end: {
						index: 21,
						line: 4,
						offset: 6,
					},
					value: {
						start: {
							index: 8,
							line: 2,
							offset: 6,
						},
						end: {
							index: 14,
							line: 2,
							offset: 12,
						},
						value: 'button',
					},
				},
			],
		});
	});

});


describe('AST tags', () => {

	test('one self-closing, no attributes', () => {
		expect(
			parse('<button/>'),
		).toMatchObject({
			type: NODE_TEMPLATE,
			children: [
				{
					type: NODE_TAG,
					value: {
						type: TOKEN_STRING,
						value: 'button',
					},
				},
			],
		});
	});

	test('two self-closing, no attributes', () => {
		expect(
			parse('<button/><i/>'),
		).toMatchObject({
			type: NODE_TEMPLATE,
			children: [
				{
					type: NODE_TAG,
					value: {
						type: TOKEN_STRING,
						value: 'button',
					},
				},
				{
					type: NODE_TAG,
					value: {
						type: TOKEN_STRING,
						value: 'i',
					},
				},
			],
		});
	});

	test('one self-closing, one attribute without a value', () => {
		expect(
			parse('<button disabled/>'),
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
										value: 'disabled',
									},
								},
							],
						},
					],
				},
			],
		});
	});

	test('one self-closing, two attributes without a value', () => {
		expect(
			parse('<button 1 data-id/>'),
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
										value: '1',
									},
								},
							],
						},
						{
							type: NODE_ATTRIBUTE,
							children: [
								{
									type: NODE_ATTRIBUTE_NAME,
									value: {
										type: TOKEN_STRING,
										value: 'data-id',
									},
								},
							],
						},
					],
				},
			],
		});
	});

	test('one self-closing, one attribute with a value', () => {
		expect(
			parse('<button onclick=alert()/>'),
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
										value: 'onclick',
									},
								},
								{
									type: NODE_ATTRIBUTE_VALUE,
									value: {
										type: TOKEN_STRING,
										value: 'alert()',
									},
								},
							],
						},
					],
				},
			],
		});
	});

	test('one self-closing, one attribute with an expression value', () => {
		expect(
			parse('<button onclick={alert()}/>'),
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
										value: 'onclick',
									},
								},
								{
									type: NODE_ATTRIBUTE_TEMPLATE_VALUE,
									children: [
										{
											type: NODE_EXPRESSION,
											value: {
												type: TOKEN_EXPRESSION,
												value: 'alert()',
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
