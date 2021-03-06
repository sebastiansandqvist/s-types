'use strict';

const hasOwn = Object.prototype.hasOwnProperty;
const toStr = Object.prototype.toString;

function getType(x) {
	const currentType = toStr.call(x).slice(8, -1).toLowerCase();
	if (currentType === 'array' && x.length > 0) {
		return '[array of ' + getType(x[0]) + 's]';
	}
	return currentType;
}

function typeStringFromArray(arr) {
	if (arr.length === 1) {
		return arr[0].type;
	}
	return arr.map(function(typeCheckFn) {
		return typeCheckFn.type;
	}).join(' || ');
}

function T(schema) {

	return function(props, label) {

		if (T.disabled) { return; }

		for (const key in schema) {

			if (hasOwn.call(schema, key)) {

				const rules = Array.isArray(schema[key]) ? schema[key] : [schema[key]];
				const success = rules.reduce(function(prev, rule) {
					return prev || rule(props[key], label);
				}, false);

				if (!success) {

					const errorMessage =
						'Failed type check in ' + (label || 'unknown object') + '\n' +
						'Expected prop \'' + key + '\' of type ' + typeStringFromArray(rules) + '\n' +
						'You provided \'' + key + '\' of type ' + getType(props[key]);

					if (T.throws) {
						throw new TypeError(errorMessage);
					}

					// recursive call will report errors in next round of checks
					if (typeStringFromArray(rules).indexOf('interface') > -1) {
						continue;
					}

					console.error(errorMessage);
					return errorMessage;
				}
			
			}

		}

		for (const key in props) {
			if (hasOwn.call(props, key) && !hasOwn.call(schema, key)) {
				const errorMessage = 'Did not expect to find prop \'' + key + '\' in ' + label;
				console.error(errorMessage);
				return errorMessage;
			}
		}

		return null;

	};

}

T.fn = T['function'] = function(x) {
	return typeof x === 'function';
};

T.fn.type = 'function';

T.str = T.string = function(x) {
	return typeof x === 'string';
};

T.str.type = 'string';

T.num = T.number = function(x) {
	return typeof x === 'number';
};

T.num.type = 'number';

T.date = function(x) {
	return getType(x) === 'date';
};

T.date.type = 'date';

T.NULL = T['null'] = function(x) {
	return getType(x) === 'null';
};

T.NULL.type = 'null';

T.nil = function(x) {
	return typeof x === 'undefined' || getType(x) === 'null';
};

T.nil.type = 'nil';

T.obj = T.object = function(x) {
	return getType(x) === 'object';
};

T.obj.type = 'object';

T.arr = T.array = function(x) {
	return Array.isArray(x);
};

T.arr.type = 'array';

T.arrayOf = function(propType) {

	const arrayOfType = function(x) {

		if (!Array.isArray(x)) {
			return false;
		}

		for (let i = 0; i < x.length; i++) {
			if (!propType(x[i])) {
				return false;
			}
		}

		return true;

	};

	arrayOfType.type = '[array of ' + propType.type + 's]';

	return arrayOfType;

};

T.not = function(propType) {

	const notType = function(x) {
		return !propType(x);
	};

	notType.type = 'not(' + propType.type + ')';

	return notType;

};

T['int'] = T.integer = function(x) {
	return typeof x === 'number' && isFinite(x) && Math.floor(x) === x;
};


T.integer.type = 'integer';

T.optional = T.undefined = function(x) {
	return typeof x === 'undefined';
};

T.optional.type = 'undefined';

T.bool = T['boolean'] = function(x) {
	return typeof x === 'boolean';
};

T.bool.type = 'boolean';

function quoteIfString(x) {
	return typeof x === 'string' ? ('"' + x + '"') : x;
}

T.exact = function(exactValue) {
	const exactType = function(x) {
		return x === exactValue;
	};
	const formattedValue = quoteIfString(exactValue);
	exactType.type = 'exact(' + formattedValue + ')';
	return exactType;
};

T.oneOf = function(values) {
	const oneOfType = function(x) {
		return values.reduce((success, next) => success || (x === next), false);
	};
	const formattedValue = '[' + values.map(quoteIfString).join(', ') + ']';
	oneOfType.type = 'oneOf(' + formattedValue + ')';
	return oneOfType;
};

T.any = function() {
	return true;
};

T.any.type = 'any';

// recursive
T.schema = T['interface'] = function(schema) {
	const schemaType = function(prop, label) {
		return !T(schema)(prop, label || 'nested interface'); // returns null if success, so invert as boolean
	};
	schemaType.type = 'interface';
	return schemaType;
};

T.disabled = false;
T.throws = false;

module.exports = T;