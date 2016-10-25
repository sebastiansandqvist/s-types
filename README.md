# s-type
## Library-independent type checking similar to React PropTypes

[![NPM version](https://img.shields.io/npm/v/s-type.svg)](https://www.npmjs.com/package/s-type) ![Dependencies](https://img.shields.io/david/sebastiansandqvist/s-type.svg) [![build status](http://img.shields.io/travis/sebastiansandqvist/s-type.svg)](https://travis-ci.org/sebastiansandqvist/s-type) [![NPM license](https://img.shields.io/npm/l/s-type.svg)](https://www.npmjs.com/package/s-type)

# Installation

```bash
npm install --save s-types
```

Note that the npm package name ends in an 's'.

# Usage

```js
import T from 's-types';

const schema = {
	foo: T.string,
	bar: [T.number, T.optional],
	baz: T.arrayOf(T.string)
};

const someObject = {
	foo: 'Hello',
	baz: ['world', '!']
};

T(schema)(someObject); // passes test, nothing logged to console

const fail = {
	foo: 'Hello',
	bar: 10,
	baz: [1, 2, 3] // !!!
};

// optional second argument to provide name for better error messages
T(schema)(fail, 'Bad Object');

/*
	Logs the following to stderr:

	Failed typecheck in Bad Object
	Expected prop 'baz' of type [array of strings]
	You provided 'baz' of type [array of numbers]

 */
```

Using an array of types in the schema allows for multiple types to be used. These are `OR`ed together.

```js
// Use an array to allow multiple types

const schema = {
	foo: [T.string, T.number],
	bar: T.any
};

const someObject = {
	foo: 'Hello',
	bar: 5
};

const anotherObject = {
	foo: 5,
	bar: null
};

const badObject = {
	foo: null,
	bar: null
};

T(schema)(someObject); // passes
T(schema)(anotherObject); // passes
T(schema)(badObject); // fails

```

The `T.schema` and `T.arrayOf` methods allow for nesting complex structures. For example:

```js
const nestedRules = {
	foo: T.string,
	bar: T.schema({
		baz: T.number,
		qux: T.arrayOf(T.arrayOf(T.number))
	})
};

const someObject = {
	foo: 'Hello',
	bar: {
		baz: 5,
		qux: [[1, 2], [3, 4]]
	}
};

T(nestedRules)(someObject); // passes
```

## Types provided

- __`T.any`__
- __`T.array`__ (alias `T.arr`)
- __`T.arrayOf(type)`__
	Example: `T.arrayOf(T.string)`
- __`T.boolean`__ (alias `T.bool`)
- __`T.date`__
- __`T.function`__ (alias `T.fn`)
- __`T.integer`__ (alias `T.int`)
- __`T.nil`__ (prop is `null` or `undefined`)
- __`T.number`__ (alias `T.num`)
- __`T.null`__ (alias `T.NULL`)
- __`T.object`__ (alias `T.obj`)
- __`T.optional`__ (alias `T.undefined`)
- __`T.schema`__ (alias `T.interface`)
	Example: `T.schema({ foo: T.string, bar: T.number })`
- __`T.string`__ (alias `T.str`)

## Custom types

If the provided types are not sufficient, you can provide a custom type checking function to s-type.

These functions take one argument (the value of the property to be type checked) and return a boolean to indicate whether it is valid or not.

The function must also be assigned a `type` attribute in order to allow for helpful error messages.

For example, `T.string` is defined as follows:

```js
T.string = function(x) {
	return typeof x === 'string';
};

T.str.type = 'string';
```

To create a `positiveNumber` type, you could do the following:

```js
function positiveNumber(x) {
	return typeof x === 'number' && x > 0;
}

const schema = {
	n: positiveNumber
};

const obj = {
	n: 12
};

T(schema)(obj); // passes
```

## Usage in production

This should only be used in development and test environments, so remember to wrap any calls to `T` in a `if (__dev__)` or `if (process.env.node_env !== 'production')` branch.


## Why two functions?

The `T(a)(b, c?);` syntax allows typecheckers to be reused.

For example:

```js
const UserType = T({
	age: T.number,
	email: T.string,
	emailVerified: T.boolean,
	name: T.string,
	friends: T.arrayOf(T.string)
});

const user1 = {
	age: 21,
	email: example@gmail.com,
	emailVerified: false,
	name: 'John Doe',
	friends: ['user2']
};

const user2 = {
	age: 24,
	email: example@yahoo.com,
	emailVerified: true,
	name: 'Jane Doe',
	friends: ['user1']
};

UserType(user1, 'John Doe user object'); // passes
UserType(user2, 'Jane Doe user object'); // passes

// The `UserType` typechecker can now be exported and used elsewhere
```