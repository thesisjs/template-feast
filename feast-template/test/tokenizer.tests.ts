import {
	tokenize,
	TOKEN_TAG_OPEN,
	TOKEN_STRING,
	TOKEN_FORWARD_SLASH,
	TOKEN_TAG_CLOSE,
} from "../src/tokenizer";


describe('tokenizer source maps', () => {

	test('no spaces, no line breaks', () => {
		expect(
			tokenize('<button/>')
		).toEqual([
			{
				type: TOKEN_TAG_OPEN,
				start: {
					index: 0,
					line: 1,
					offset: 1,
				},
				end: {
					index: 1,
					line: 1,
					offset: 2,
				},
			},
			{
				type: TOKEN_STRING,
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
			{
				type: TOKEN_FORWARD_SLASH,
				start: {
					index: 7,
					line: 1,
					offset: 8,
				},
				end: {
					index: 8,
					line: 1,
					offset: 9,
				},
			},
			{
				type: TOKEN_TAG_CLOSE,
				start: {
					index: 8,
					line: 1,
					offset: 9,
				},
				end: {
					index: 9,
					line: 1,
					offset: 10,
				},
			},
		]);
	});

	test('spaces, no line breaks', () => {
		expect(
			tokenize('  <  button / >   ')
		).toEqual([
			{
				type: TOKEN_TAG_OPEN,
				start: {
					index: 2,
					line: 1,
					offset: 3,
				},
				end: {
					index: 3,
					line: 1,
					offset: 4,
				},
			},
			{
				type: TOKEN_STRING,
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
			{
				type: TOKEN_FORWARD_SLASH,
				start: {
					index: 12,
					line: 1,
					offset: 13,
				},
				end: {
					index: 13,
					line: 1,
					offset: 14,
				},
			},
			{
				type: TOKEN_TAG_CLOSE,
				start: {
					index: 14,
					line: 1,
					offset: 15,
				},
				end: {
					index: 15,
					line: 1,
					offset: 16,
				},
			},
		]);
	});

	test('spaces, line breaks', () => {
		expect(
			tokenize('  \n\t\t<  button\n\n\t\t />   ', {lineDelimiter: '\n'})
		).toEqual([
			{
				type: TOKEN_TAG_OPEN,
				start: {
					index: 5,
					line: 2,
					offset: 3,
				},
				end: {
					index: 6,
					line: 2,
					offset: 4,
				},
			},
			{
				type: TOKEN_STRING,
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
			{
				type: TOKEN_FORWARD_SLASH,
				start: {
					index: 19,
					line: 4,
					offset: 4,
				},
				end: {
					index: 20,
					line: 4,
					offset: 5,
				},
			},
			{
				type: TOKEN_TAG_CLOSE,
				start: {
					index: 20,
					line: 4,
					offset: 5,
				},
				end: {
					index: 21,
					line: 4,
					offset: 6,
				},
			},
		]);
	});

});


describe('tokenizer tags', () => {

	test('self-closing no attributes', () => {
		expect(
			tokenize('<button/>')
		).toMatchObject([
			{type: TOKEN_TAG_OPEN},
			{type: TOKEN_STRING, value: 'button'},
			{type: TOKEN_FORWARD_SLASH},
			{type: TOKEN_TAG_CLOSE},
		]);
	});

});
