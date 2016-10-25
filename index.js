function getType(x) {
	return Object.prototype.toString.call(x).slice(8, -1).toLowerCase();
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
					const errorMessage =
						'Failed type check in ' + (label || 'unknown object') + '\n' +
						'Expected prop \'' + key + '\' of type ' + typeStringFromArray(rules) + '\n' +
						'You provided \'' + key + '\' of type ' + getType(props[key]);
					console.error(errorMessage);
					return errorMessage;
				}
			
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
	return getType(x) === 'Date';
};

T.date.type = 'date';

T['null'] = function(x) {
	return getType(x) === 'Null';
};

T['null'].type = 'null';

T.nil = function(x) {
	return typeof x === 'undefined' || getType(x) === 'Null';
};

T.nil.type = 'nil';

T.obj = T.object = function(x) {
	return getType(x) === 'Object';
};

T.arr = T.array = function(x) {
	return Array.isArray(x);
};

T.arrayOf = function(propType) {

	return function(x) {

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

};

T['int'] = T.integer = function(x) {
	return typeof x === 'number' && isFinite(x) && Math.floor(x) === x;
};

T.optional = T.undefined = function(x) {
	return typeof x === 'undefined';
};

T.bool = T['boolean'] = function(x) {
	return typeof x === 'boolean';
};

// recursive
T.schema = function(schema) {
	return function(prop) {
		T(schema)(prop);
	};
};

module.exports = T;