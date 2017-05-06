'use strict';

const expect = require('chai').expect;
const stderr = require('test-console').stderr;
const T = require('../');

function errorMessage(label, key, expectedType, providedType) {
	return 'Failed type check in ' + (label || 'unknown object') + '\n' +
		'Expected prop \'' + key + '\' of type ' + expectedType + '\n' +
		'You provided \'' + key + '\' of type ' + providedType;
}

function unexpectedMessage(label, key) {
	return 'Did not expect to find prop \'' + key + '\' in ' + label;
}

describe('s-type', function() {

	it('checks functions', function() {

		const props1 = { a: function() {} };
		const props2 = { a: () => {} };
		const props3 = { a() {} };
		const type1 = { a: T.fn };
		const typeFail1 = { a: T.number };

		expect(T(type1)(props1)).to.equal(null);
		expect(T(type1)(props2)).to.equal(null);
		expect(T(type1)(props3)).to.equal(null);

		expect(T(typeFail1)(props1, 'function test'))
			.to.equal(errorMessage('function test', 'a', 'number', 'function'));

	});

	it('checks nulls', function() {

		const props1 = { a: null };
		const props2 = { a: undefined };
		const props3 = {};
		const type1 = { a: T.NULL };

		expect(T(type1)(props1)).to.equal(null);

		expect(T(type1)(props2, 'null test'))
			.to.equal(errorMessage('null test', 'a', 'null', 'undefined'));

		expect(T(type1)(props3, 'null test'))
			.to.equal(errorMessage('null test', 'a', 'null', 'undefined'));

	});

	it('checks nils', function() {

		const props1 = { a: null };
		const props2 = { a: undefined };
		const props3 = {};
		const type1 = { a: T.nil };

		expect(T(type1)(props1)).to.equal(null);
		expect(T(type1)(props2)).to.equal(null);
		expect(T(type1)(props3)).to.equal(null);

	});

	it('checks objects', function() {

		const props1 = { a: {} };
		const props2 = { a: { foo: 'bar' } };
		const props3 = { a: new Date() };
		const props4 = { a: null };
		const type1 = { a: T.object };

		expect(T(type1)(props1)).to.equal(null);
		expect(T(type1)(props2)).to.equal(null);

		expect(T(type1)(props3, 'object test'))
			.to.equal(errorMessage('object test', 'a', 'object', 'date'));

		expect(T(type1)(props4, 'object test'))
			.to.equal(errorMessage('object test', 'a', 'object', 'null'));

	});

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

	it('checks `exact`', function() {
		const props1 = { a: 'foo' };
		const props2 = { a: 'bar' };
		const type1 = T({ a: T.exact('foo') });
		expect(type1(props1)).to.equal(null);
		expect(type1(props2, 'exact test'))
			.to.equal(errorMessage('exact test', 'a', 'exact("foo")', 'string'));
	});

	it('checks `oneOf`', function() {
		const props1 = { a: 'foo' };
		const props2 = { a: 5 };
		const props3 = { a: 1 };
		const type1 = T({ a: T.oneOf(['foo', 5]) });
		expect(type1(props1)).to.equal(null);
		expect(type1(props2)).to.equal(null);
		expect(type1(props3, 'oneOf test'))
			.to.equal(errorMessage('oneOf test', 'a', 'oneOf(["foo", 5])', 'number'));
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
		const props4 = { a: 1 };
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
		expect(T(typeFail2)(props4, 'typed array test'))
			.to.equal(errorMessage('typed array test', 'a', '[array of numbers]', 'number'));

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

	it('allows `any` type', function() {

		const props1 = { a: 5 };
		const props2 = { a: [] };
		const props3 = { a: {} };
		const props4 = { a: 'foo' };
		const props5 = { a: undefined };
		const props6 = {};

		const type1 = { a: T.any };

		expect(T(type1)(props1)).to.equal(null);
		expect(T(type1)(props2)).to.equal(null);
		expect(T(type1)(props3)).to.equal(null);
		expect(T(type1)(props4)).to.equal(null);
		expect(T(type1)(props5)).to.equal(null);
		expect(T(type1)(props6)).to.equal(null);

	});

	it('allows `not` types', function() {

		const props1 = { a: 5 };
		const props2 = { a: NaN };
		const props3 = { a: 'foo' };

		const type1 = { a: T.not(T.string) };

		const nanCheck = function(x) {
			return isNaN(x);
		};

		nanCheck.type = 'NaN';

		const type2 = { a: T.not(nanCheck) };

		expect(T(type1)(props1)).to.equal(null);
		expect(T(type1)(props2)).to.equal(null);
		expect(T(type1)(props3, 'not string test'))
			.to.equal(errorMessage('not string test', 'a', 'not(string)', 'string'));

		// NOTE: type checker does not check for NaN since NaN is of number type
		expect(T(type2)(props1)).to.equal(null);
		expect(T(type2)(props2, 'not nan test'))
			.to.equal(errorMessage('not nan test', 'a', 'not(NaN)', 'number'));
			// .to.equal(errorMessage('not nan test', 'a', 'not(NaN)', 'NaN'));

	});

	it('allows optionals', function() {

		const props1 = { a: 5 };
		const props2 = {};
		const type1 = { a: [T.number, T.optional]};

		expect(T(type1)(props1)).to.equal(null);
		expect(T(type1)(props2)).to.equal(null);

	});

	it('allows multiple types', function() {

		const props1 = { a: 5 };
		const type1 = { a: [T.number, T.string]};
		const typeFail1 = { a: [T.string, T.fn]};

		expect(T(type1)(props1)).to.equal(null);

		expect(T(typeFail1)(props1, 'multiple type test'))
			.to.equal(errorMessage('multiple type test', 'a', 'string || function', 'number'));

	});

	it('reports only first error', function() {

		const props1 = { a: 5, b: 'hello' };
		const typeFail1 = { a: T.string, b: T.number };

		expect(T(typeFail1)(props1, 'multiple error test'))
			.to.equal(errorMessage('multiple error test', 'a', 'string', 'number'));

	});

	it('reports unexpected props', function() {

		const props1 = { a: 5, b: 6 };
		const typeFail1 = { a: T.number };

		expect(T(typeFail1)(props1, 'unexpected prop test'))
			.to.equal(unexpectedMessage('unexpected prop test', 'b'));

	});

	it('throws if passed undefined', function() {

		const props1 = { a: 5 };
		const typeThrow = { a: undefined };

		expect(function() {
			T(typeThrow)(props1);
		}).to['throw']();

	});

	it('assigns a name to anonymous objects', function() {

		const props1 = { a: 'hello' };
		const typeFail1 = { a: T.number };

		expect(T(typeFail1)(props1))
			.to.equal(errorMessage('unknown object', 'a', 'number', 'string'));

	});

	it('is noop if T.disabled === true', function() {

		T.disabled = true;

		// copy of schema test from here down,
		// except has no output
		const props1 = { a: { b: 'foo ', c: 5 } };
		const type1 = { a: T.schema({ b: T.string, c: T.number })};
		const typeFail1 = { a: T.schema({ b: T.string, c: T.string })};

		// returns undefined now, since noop
		expect(T(type1)(props1)).to.equal(undefined);

		const output = stderr.inspectSync(function() {
			T(typeFail1)(props1, 'interface test');
		});

		expect(output.length).to.equal(0);

	});

	it('throws if T.throws === true', function() {

		T.disabled = false;
		T.throws = true;

		// copy of schema test from here down,
		// except has no output
		const props1 = { a: { b: 'foo ', c: 5 } };
		const type1 = { a: T.schema({ b: T.string, c: T.number })};
		const typeFail1 = { a: T.schema({ b: T.string, c: T.string })};

		expect(function() {
			T(type1)(props1);
		}).to.not.throw();

		expect(function() {
			T(typeFail1)(props1);
		}).to.throw(errorMessage('nested interface', 'c', 'string', 'number'));

	});

});
