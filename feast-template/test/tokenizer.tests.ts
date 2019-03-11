import {
	tokenize,
} from "../src/tokenizer";

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
} from "../src/tokenizer/types";


describe('tokenizer tokens', () => {

	test('unicode', () => {
		expect(
			tokenize('🤔')
		).toMatchObject([
			{type: TOKEN_STRING, value: '🤔'},
		]);
	});

});


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

	test('one self-closing, no attributes', () => {
		expect(
			tokenize('<button/>')
		).toMatchObject([
			{type: TOKEN_TAG_OPEN},
			{type: TOKEN_STRING, value: 'button'},
			{type: TOKEN_FORWARD_SLASH},
			{type: TOKEN_TAG_CLOSE},
		]);
	});

	test('two self-closing, no attributes', () => {
		expect(
			tokenize('<button/><i/>')
		).toMatchObject([
			{type: TOKEN_TAG_OPEN},
			{type: TOKEN_STRING, value: 'button'},
			{type: TOKEN_FORWARD_SLASH},
			{type: TOKEN_TAG_CLOSE},
			{type: TOKEN_TAG_OPEN},
			{type: TOKEN_STRING, value: 'i'},
			{type: TOKEN_FORWARD_SLASH},
			{type: TOKEN_TAG_CLOSE},
		]);
	});

	test('one self-closing, one attribute without value', () => {
		expect(
			tokenize('<button disabled/>')
		).toMatchObject([
			{type: TOKEN_TAG_OPEN},
			{type: TOKEN_STRING, value: 'button'},
			{type: TOKEN_STRING, value: 'disabled'},
			{type: TOKEN_FORWARD_SLASH},
			{type: TOKEN_TAG_CLOSE},
		]);
	});

	test('one self-closing, one attribute with value', () => {
		expect(
			tokenize('<button onclick=alert()/>')
		).toMatchObject([
			{type: TOKEN_TAG_OPEN},
			{type: TOKEN_STRING, value: 'button'},
			{type: TOKEN_STRING, value: 'onclick'},
			{type: TOKEN_ASSIGN},
			{type: TOKEN_STRING, value: 'alert()'},
			{type: TOKEN_FORWARD_SLASH},
			{type: TOKEN_TAG_CLOSE},
		]);
	});

	test('one self-closing, one attribute with single-quoted value', () => {
		expect(
			tokenize(`<button title=\'<🦊> "click" me! </🦊>\'/>`)
		).toMatchObject([
			{type: TOKEN_TAG_OPEN},
			{type: TOKEN_STRING, value: 'button'},
			{type: TOKEN_STRING, value: 'title'},
			{type: TOKEN_ASSIGN},
			{type: TOKEN_SINGLE_QUOTED_STRING, value: `<🦊> "click" me! </🦊>`},
			{type: TOKEN_FORWARD_SLASH},
			{type: TOKEN_TAG_CLOSE},
		]);
	});

	test('one self-closing, one attribute with double-quoted value', () => {
		expect(
			tokenize(`<button title="<🦊> 'click' me! </🦊>"/>`)
		).toMatchObject([
			{type: TOKEN_TAG_OPEN},
			{type: TOKEN_STRING, value: 'button'},
			{type: TOKEN_STRING, value: 'title'},
			{type: TOKEN_ASSIGN},
			{type: TOKEN_DOUBLE_QUOTED_STRING, value: `<🦊> 'click' me! </🦊>`},
			{type: TOKEN_FORWARD_SLASH},
			{type: TOKEN_TAG_CLOSE},
		]);
	});

	test('one self-closing, one attribute with expressions', () => {
		expect(
			tokenize(`<button onclick={console.log('debug', {t: '<🦊>Hello!</🦊>'})}/>`)
		).toMatchObject([
			{type: TOKEN_TAG_OPEN},
			{type: TOKEN_STRING, value: 'button'},
			{type: TOKEN_STRING, value: 'onclick'},
			{type: TOKEN_ASSIGN},
			{type: TOKEN_EXPRESSION, value: `console.log('debug', {t: '<🦊>Hello!</🦊>'})`},
			{type: TOKEN_FORWARD_SLASH},
			{type: TOKEN_TAG_CLOSE},
		]);
	});

});


describe('tokenizer expressions', () => {

	test('single-quoted expression', () => {
		expect(
			tokenize(`<button onclick='{console.log('debug', {t: '<🦊>Hello!</🦊>'})}'/>`)
		).toMatchObject([
			{type: TOKEN_TAG_OPEN},
			{type: TOKEN_STRING, value: 'button'},
			{type: TOKEN_STRING, value: 'onclick'},
			{type: TOKEN_ASSIGN},
			{type: TOKEN_SINGLE_QUOTED_STRING_START, value: ''},
			{type: TOKEN_EXPRESSION, value: `console.log('debug', {t: '<🦊>Hello!</🦊>'})`},
			{type: TOKEN_SINGLE_QUOTED_STRING_END, value: ''},
			{type: TOKEN_FORWARD_SLASH},
			{type: TOKEN_TAG_CLOSE},
		]);
	});

	test('double-quoted expression', () => {
		expect(
			tokenize(`<button onclick="{console.log('debug', {t: '<🦊>Hello!</🦊>'})}"/>`)
		).toMatchObject([
			{type: TOKEN_TAG_OPEN},
			{type: TOKEN_STRING, value: 'button'},
			{type: TOKEN_STRING, value: 'onclick'},
			{type: TOKEN_ASSIGN},
			{type: TOKEN_DOUBLE_QUOTED_STRING_START, value: ''},
			{type: TOKEN_EXPRESSION, value: `console.log('debug', {t: '<🦊>Hello!</🦊>'})`},
			{type: TOKEN_DOUBLE_QUOTED_STRING_END, value: ''},
			{type: TOKEN_FORWARD_SLASH},
			{type: TOKEN_TAG_CLOSE},
		]);
	});

	test('single-quoted template expression', () => {
		const t = tokenize(`<button title='Hello, {l("debug", {t: '</🦊>'})}! {name} are my friend'/>`);

		expect(
			tokenize(`<button title='Hello, {l("debug", {t: '</🦊>'})}! {name} are my friend'/>`)
		).toMatchObject([
			{type: TOKEN_TAG_OPEN},
			{type: TOKEN_STRING, value: 'button'},
			{type: TOKEN_STRING, value: 'title'},
			{type: TOKEN_ASSIGN},
			{type: TOKEN_SINGLE_QUOTED_STRING_START, value: 'Hello, '},
			{type: TOKEN_EXPRESSION, value: `l("debug", {t: '</🦊>'})`},
			{type: TOKEN_SINGLE_QUOTED_STRING_MIDDLE, value: '! '},
			{type: TOKEN_EXPRESSION, value: `name`},
			{type: TOKEN_SINGLE_QUOTED_STRING_END, value: ' are my friend'},
			{type: TOKEN_FORWARD_SLASH},
			{type: TOKEN_TAG_CLOSE},
		]);
	});

	test('double-quoted template expression', () => {
		expect(
			tokenize(`<button title="Hello, {l("debug", {t: '</🦊>'})}! {name} are my friend"/>`)
		).toMatchObject([
			{type: TOKEN_TAG_OPEN},
			{type: TOKEN_STRING, value: 'button'},
			{type: TOKEN_STRING, value: 'title'},
			{type: TOKEN_ASSIGN},
			{type: TOKEN_DOUBLE_QUOTED_STRING_START, value: 'Hello, '},
			{type: TOKEN_EXPRESSION, value: `l("debug", {t: '</🦊>'})`},
			{type: TOKEN_DOUBLE_QUOTED_STRING_MIDDLE, value: '! '},
			{type: TOKEN_EXPRESSION, value: `name`},
			{type: TOKEN_DOUBLE_QUOTED_STRING_END, value: ' are my friend'},
			{type: TOKEN_FORWARD_SLASH},
			{type: TOKEN_TAG_CLOSE},
		]);
	});

	test('single-quoted template expression min', () => {
		expect(
			tokenize(`<button title='!{a()}:{b()}.'/>`)
		).toMatchObject([
			{type: TOKEN_TAG_OPEN},
			{type: TOKEN_STRING, value: 'button'},
			{type: TOKEN_STRING, value: 'title'},
			{type: TOKEN_ASSIGN},
			{type: TOKEN_SINGLE_QUOTED_STRING_START, value: '!'},
			{type: TOKEN_EXPRESSION, value: `a()`},
			{type: TOKEN_SINGLE_QUOTED_STRING_MIDDLE, value: ':'},
			{type: TOKEN_EXPRESSION, value: `b()`},
			{type: TOKEN_SINGLE_QUOTED_STRING_END, value: '.'},
			{type: TOKEN_FORWARD_SLASH},
			{type: TOKEN_TAG_CLOSE},
		]);
	});

	test('double-quoted template expression min', () => {
		expect(
			tokenize(`<button title="!{a()}:{b()}."/>`)
		).toMatchObject([
			{type: TOKEN_TAG_OPEN},
			{type: TOKEN_STRING, value: 'button'},
			{type: TOKEN_STRING, value: 'title'},
			{type: TOKEN_ASSIGN},
			{type: TOKEN_DOUBLE_QUOTED_STRING_START, value: '!'},
			{type: TOKEN_EXPRESSION, value: `a()`},
			{type: TOKEN_DOUBLE_QUOTED_STRING_MIDDLE, value: ':'},
			{type: TOKEN_EXPRESSION, value: `b()`},
			{type: TOKEN_DOUBLE_QUOTED_STRING_END, value: '.'},
			{type: TOKEN_FORWARD_SLASH},
			{type: TOKEN_TAG_CLOSE},
		]);
	});

});
