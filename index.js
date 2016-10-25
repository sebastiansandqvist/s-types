'use strict';

function getType(x) {
	const currentType = Object.prototype.toString.call(x).slice(8, -1).toLowerCase();
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

		for (const key in schema) {

			if (schema.hasOwnProperty(key)) {

				const rules = Array.isArray(schema[key]) ? schema[key] : [schema[key]];
				const success = rules.reduce(function(prev, rule) {
					return prev || rule(props[key]);
				}, false);

				if (!success) {

					// recursive call will report errors in next round of checks
					if (typeStringFromArray(rules).indexOf('interface') > -1) {
						continue;
					}

					const errorMessage =
						'Failed type check in ' + (label || 'unknown object') + '\n' +
						'Expected prop \'' + key + '\' of type ' + typeStringFromArray(rules) + '\n' +
						'You provided \'' + key + '\' of type ' + getType(props[key]);

					console.error(errorMessage);
					return errorMessage;
				}
			
			}

		}

		for (const key in props) {
			if (props.hasOwnProperty(key) && !schema.hasOwnProperty(key)) {
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

T.any = function() {
	return true;
};

T.any.type = 'any';

// recursive
T.schema = T['interface'] = function(schema) {
	const schemaType = function(prop) {
		return !T(schema)(prop, 'nested interface'); // returns null if success, so invert as boolean
	};
	schemaType.type = 'interface';
	return schemaType;
};

module.exports = T;