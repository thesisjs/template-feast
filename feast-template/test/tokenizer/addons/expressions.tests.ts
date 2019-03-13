import {
	tokenize,
} from "../../../src/tokenizer";

import {
	TOKEN_STRING,
	TOKEN_FORWARD_SLASH,
	TOKEN_TAG_CLOSE,
	TOKEN_ASSIGN,
	TOKEN_EXPRESSION,
} from "../../../src/tokenizer/types";


describe('tokenizer expressions addon: expressions', () => {

	test('no value', () => {
		expect(
			tokenize('{}', {debug: true})
		).toMatchObject([
			{
				type: TOKEN_EXPRESSION,
				start: {index: 1, offset: 2},
				end: {index: 1, offset: 2},
				value: '',
			},
		]);
	});

	test('attr, no value', () => {
		expect(
			tokenize('attr={}/>', {debug: true})
		).toMatchObject([
			{type: TOKEN_STRING},
			{
				type: TOKEN_ASSIGN,
				start: {index: 4, offset: 5},
				end: {index: 5, offset: 6},
				value: '=',
			},
			{
				type: TOKEN_EXPRESSION,
				start: {index: 6, offset: 7},
				end: {index: 6, offset: 7},
				value: '',
			},
			{
				type: TOKEN_FORWARD_SLASH,
				start: {index: 7, offset: 8},
				end: {index: 8, offset: 9},
				value: '/',
			},
			{type: TOKEN_TAG_CLOSE},
		]);
	});

	test('attr, value', () => {
		expect(
			tokenize('attr={alert()}/>', {debug: true})
		).toMatchObject([
			{type: TOKEN_STRING},
			{
				type: TOKEN_ASSIGN,
				start: {index: 4, offset: 5},
				end: {index: 5, offset: 6},
				value: '=',
			},
			{
				type: TOKEN_EXPRESSION,
				start: {index: 6, offset: 7},
				end: {index: 13, offset: 14},
				value: 'alert()',
			},
			{
				type: TOKEN_FORWARD_SLASH,
				start: {index: 14, offset: 15},
				end: {index: 15, offset: 16},
				value: '/',
			},
			{type: TOKEN_TAG_CLOSE},
		]);
	});

	test('attr, with tag', () => {
		expect(
			tokenize('attr={alert("<a/>")}/>', {debug: true})
		).toMatchObject([
			{type: TOKEN_STRING},
			{
				type: TOKEN_ASSIGN,
				start: {index: 4, offset: 5},
				end: {index: 5, offset: 6},
				value: '=',
			},
			{
				type: TOKEN_EXPRESSION,
				start: {index: 6, offset: 7},
				end: {index: 19, offset: 20},
				value: 'alert("<a/>")',
			},
			{
				type: TOKEN_FORWARD_SLASH,
				start: {index: 20, offset: 21},
				end: {index: 21, offset: 22},
				value: '/',
			},
			{type: TOKEN_TAG_CLOSE},
		]);
	});

	test('attr, with curly', () => {
		expect(
			tokenize('attr={alert({a: b})}/>', {debug: true})
		).toMatchObject([
			{type: TOKEN_STRING},
			{
				type: TOKEN_ASSIGN,
				start: {index: 4, offset: 5},
				end: {index: 5, offset: 6},
				value: '=',
			},
			{
				type: TOKEN_EXPRESSION,
				start: {index: 6, offset: 7},
				end: {index: 19, offset: 20},
				value: 'alert({a: b})',
			},
			{
				type: TOKEN_FORWARD_SLASH,
				start: {index: 20, offset: 21},
				end: {index: 21, offset: 22},
				value: '/',
			},
			{type: TOKEN_TAG_CLOSE},
		]);
	});

});
