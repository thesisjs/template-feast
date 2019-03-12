import {
	tokenize,
} from "../../../src/tokenizer";

import {
	TOKEN_TAG_OPEN,
	TOKEN_STRING,
	TOKEN_SINGLE_QUOTED_STRING,
	TOKEN_DOUBLE_QUOTED_STRING,
	TOKEN_EXPRESSION,
	TOKEN_SINGLE_QUOTED_STRING_START,
	TOKEN_SINGLE_QUOTED_STRING_MIDDLE,
	TOKEN_SINGLE_QUOTED_STRING_END,
	TOKEN_DOUBLE_QUOTED_STRING_START,
	TOKEN_DOUBLE_QUOTED_STRING_MIDDLE,
	TOKEN_DOUBLE_QUOTED_STRING_END,
	TOKEN_FORWARD_SLASH,
	TOKEN_TAG_CLOSE,
	TOKEN_ASSIGN,
} from "../../../src/tokenizer/types";


describe('tokenizer tags addon: attributes', () => {

	test('no value, no spaces', () => {
		expect(
			tokenize('attr/>', {debug: true})
		).toMatchObject([
			{
				type: TOKEN_STRING,
				start: {index: 0, offset: 1},
				end: {index: 4, offset: 5},
				value: 'attr',
			},
			{
				type: TOKEN_FORWARD_SLASH,
				start: {index: 4, offset: 5},
				end: {index: 5, offset: 6},
				value: '/',
			},
			{type: TOKEN_TAG_CLOSE}
		]);
	});

	test('no value, one space', () => {
		expect(
			tokenize('attr />', {debug: true})
		).toMatchObject([
			{
				type: TOKEN_STRING,
				start: {index: 0, offset: 1},
				end: {index: 4, offset: 5},
				value: 'attr',
			},
			{
				type: TOKEN_FORWARD_SLASH,
				start: {index: 5, offset: 6},
				end: {index: 6, offset: 7},
				value: '/',
			},
			{type: TOKEN_TAG_CLOSE}
		]);
	});

	test('value, no spaces', () => {
		expect(
			tokenize('attr=value/>', {debug: true})
		).toMatchObject([
			{
				type: TOKEN_STRING,
				start: {index: 0, offset: 1},
				end: {index: 4, offset: 5},
				value: 'attr',
			},
			{
				type: TOKEN_ASSIGN,
				start: {index: 4, offset: 5},
				end: {index: 5, offset: 6},
				value: '=',
			},
			{
				type: TOKEN_STRING,
				start: {index: 5, offset: 6},
				end: {index: 10, offset: 11},
				value: 'value',
			},
			{
				type: TOKEN_FORWARD_SLASH,
				start: {index: 10, offset: 11},
				end: {index: 11, offset: 12},
				value: '/',
			},
			{type: TOKEN_TAG_CLOSE}
		]);
	});
});

describe('tokenizer tags addon: spaces', () => {

	test('no spaces', () => {
		expect(
			tokenize('<tag/>', {debug: true})
		).toMatchObject([
			{
				type: TOKEN_TAG_OPEN,
				start: {index: 0, offset: 1},
				end: {index: 1, offset: 2},
				value: '<',
			},
			{
				type: TOKEN_STRING,
				start: {index: 1, offset: 2},
				end: {index: 4, offset: 5},
				value: 'tag',
			},
			{
				type: TOKEN_FORWARD_SLASH,
				start: {index: 4, offset: 5},
				end: {index: 5, offset: 6},
				value: '/',
			},
			{
				type: TOKEN_TAG_CLOSE,
				start: {index: 5, offset: 6},
				end: {index: 6, offset: 7},
				value: '>',
			},
		]);
	});

	test('one space', () => {
		expect(
			tokenize(' < tag / > ', {debug: true})
		).toMatchObject([
			{
				type: TOKEN_TAG_OPEN,
				start: {index: 1, offset: 2},
				end: {index: 2, offset: 3},
				value: '<',
			},
			{
				type: TOKEN_STRING,
				start: {index: 3, offset: 4},
				end: {index: 6, offset: 7},
				value: 'tag',
			},
			{
				type: TOKEN_FORWARD_SLASH,
				start: {index: 7, offset: 8},
				end: {index: 8, offset: 9},
				value: '/',
			},
			{
				type: TOKEN_TAG_CLOSE,
				start: {index: 9, offset: 10},
				end: {index: 10, offset: 11},
				value: '>',
			},
		]);
	});

	test('two spaces', () => {
		expect(
			tokenize('  <  tag  /  >  ', {debug: true})
		).toMatchObject([
			{
				type: TOKEN_TAG_OPEN,
				start: {index: 2, offset: 3},
				end: {index: 3, offset: 4},
				value: '<',
			},
			{
				type: TOKEN_STRING,
				start: {index: 5, offset: 6},
				end: {index: 8, offset: 9},
				value: 'tag',
			},
			{
				type: TOKEN_FORWARD_SLASH,
				start: {index: 10, offset: 11},
				end: {index: 11, offset: 12},
				value: '/',
			},
			{
				type: TOKEN_TAG_CLOSE,
				start: {index: 13, offset: 14},
				end: {index: 14, offset: 15},
				value: '>',
			},
		]);
	});

});

