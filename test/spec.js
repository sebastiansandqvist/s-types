const expect = require('chai').expect;
const T = require('../');

function errorMessage(label, key, expectedType, providedType) {
	return 'Failed type check in ' + (label || 'unknown object') + '\n' +
		'Expected prop \'' + key + '\' of type ' + expectedType + '\n' +
		'You provided \'' + key + '\' of type ' + providedType;
}

const props1 = {
	a: 'hello'
};

const type1 = {
	a: T.string
};

const typeFail1 = {
	a: T.number
};

const typeThrow = {
	a: T.foo
};

describe('s-type', function() {

	it('checks strings', function() {

		expect(T(type1)(props1)).to.equal(null);

		expect(T(typeFail1)(props1, 'string test'))
			.to.deep.equal(errorMessage('string test', 'a', 'number', 'string'));

	});

	it('throws if passed undefined', function() {
		expect(function() {
			T(typeThrow)(props1);
		}).to['throw']();
	});

});
