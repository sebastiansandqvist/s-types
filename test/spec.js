const expect = require('chai').expect;
const stderr = require('test-console').stderr;
const T = require('../');

function errorMessage(label, key, expectedType, providedType) {
	return 'Failed type check in ' + (label || 'unknown object') + '\n' +
		'Expected prop \'' + key + '\' of type ' + expectedType + '\n' +
		'You provided \'' + key + '\' of type ' + providedType;
}

describe('s-type', function() {

	it('checks strings', function() {

		const props1 = { a: 'hello' };
		const type1 = { a: T.string };
		const typeFail1 = { a: T.number };

		expect(T(type1)(props1)).to.equal(null);

		expect(T(typeFail1)(props1, 'string test'))
			.to.equal(errorMessage('string test', 'a', 'number', 'string'));

	});

	it('checks booleans', function() {

		const props1 = { a: true };
		const type1 = { a: T.bool };
		const typeFail1 = { a: T.number };

		expect(T(type1)(props1)).to.equal(null);

		expect(T(typeFail1)(props1, 'boolean test'))
			.to.equal(errorMessage('boolean test', 'a', 'number', 'boolean'));

	});

	it('checks dates', function() {

		const props1 = { a: new Date() };
		const type1 = { a: T.date };
		const typeFail1 = { a: T.number };

		expect(T(type1)(props1)).to.equal(null);

		expect(T(typeFail1)(props1, 'date test'))
			.to.equal(errorMessage('date test', 'a', 'number', 'date'));

	});

	it('checks numbers', function() {

		const props1 = { a: 5 };
		const props2 = { a: 5.5 };
		const props3 = { a: NaN };
		const props4 = { a: Infinity };
		const type1 = { a: T.number };
		const typeFail1 = { a: T.string };

		expect(T(type1)(props1)).to.equal(null);
		expect(T(type1)(props2)).to.equal(null);
		expect(T(type1)(props3)).to.equal(null);
		expect(T(type1)(props4)).to.equal(null);
		expect(T(typeFail1)(props1, 'number test'))
			.to.equal(errorMessage('number test', 'a', 'string', 'number'));

	});

	it('checks integers', function() {

		const props1 = { a: 5 };
		const props2 = { a: 5.5 };
		const props3 = { a: NaN };
		const props4 = { a: Infinity };
		const type1 = { a: T.integer };

		expect(T(type1)(props1)).to.equal(null);

		expect(T(type1)(props2, 'integer test'))
			.to.equal(errorMessage('integer test', 'a', 'integer', 'number'));

		expect(T(type1)(props3, 'integer test'))
			.to.equal(errorMessage('integer test', 'a', 'integer', 'number'));

		expect(T(type1)(props4, 'integer test'))
			.to.equal(errorMessage('integer test', 'a', 'integer', 'number'));

	});

	it('checks arrays', function() {

		const props1 = { a: [] };
		const props2 = { a: [1, 2, 3] };
		const type1 = { a: T.array };
		const typeFail1 = { a: T.string };

		expect(T(type1)(props1)).to.equal(null);
		expect(T(type1)(props2)).to.equal(null);
		expect(T(typeFail1)(props1, 'array test'))
			.to.equal(errorMessage('array test', 'a', 'string', 'array'));
		
	});

	it('checks typed arrays', function() {

		const props1 = { a: [] };
		const props2 = { a: [1, 2, 3] };
		const props3 = { a: [[1, 2], [3, 4]] };
		const type1 = { a: T.arrayOf(T.number) };
		const type2 = { a: T.arrayOf(T.arrayOf(T.number)) };
		const typeFail1 = { a: T.arrayOf(T.string) };
		const typeFail2 = { a: T.arrayOf(T.number) };

		expect(T(type1)(props1)).to.equal(null);
		expect(T(type1)(props2)).to.equal(null);
		expect(T(type2)(props3)).to.equal(null);
		expect(T(typeFail1)(props2, 'typed array test'))
			.to.equal(errorMessage('typed array test', 'a', '[array of strings]', '[array of numbers]'));
		expect(T(typeFail2)(props3, 'typed array test'))
			.to.equal(errorMessage('typed array test', 'a', '[array of numbers]', '[array of [array of numbers]s]'));

	});

	it('checks interfaces (schema)', function() {

		const props1 = { a: { b: 'foo ', c: 5 } };
		const type1 = { a: T.schema({ b: T.string, c: T.number })};
		const typeFail1 = { a: T.schema({ b: T.string, c: T.string })};

		expect(T(type1)(props1)).to.equal(null);

		// NOTE: schema still returns null (todo)
		// but console output is correct
		// TODO: also preserve name instead of changing to 'nested interface'
		const output = stderr.inspectSync(function() {
			T(typeFail1)(props1, 'interface test');
		});

		expect(output.length).to.equal(1);
		expect(output[0])
			.to.equal(errorMessage('nested interface', 'c', 'string', 'number\n')); // NOTE: \n needed because of nesting

	});

	it('throws if passed undefined', function() {

		const props1 = { a: 5 };
		const typeThrow = { a: undefined };

		expect(function() {
			T(typeThrow)(props1);
		}).to['throw']();

	});


});
