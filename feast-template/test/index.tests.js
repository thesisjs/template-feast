const {parseFeastTemplate} = require('../src/index');

describe('parseFeastTemplate', () => {

	test('one self-closing 1', () => {
		expect(
			parseFeastTemplate('<button/>'),
		).toMatchObject({
			type: 'feast::template',
			children: [
				{
					type: 'feast::tag',
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
					name: {
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
		})
	});

	test('one self-closing 2', () => {
		expect(
			parseFeastTemplate('  <  button / >   '),
		).toMatchObject({
			type: 'feast::template',
			children: [
				{
					type: 'feast::tag',
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
					name: {
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
		})
	});

	test('one self-closing 3', () => {
		expect(
			parseFeastTemplate('  \n\t\t<  button\n\n\t\t />   ', {lineDelimiter: '\n'}),
		).toMatchObject({
			type: 'feast::template',
			children: [
				{
					type: 'feast::tag',
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
					name: {
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
		})
	});

});
