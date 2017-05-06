# s-types
## Library-independent type checking similar to React PropTypes

[![NPM version](https://img.shields.io/npm/v/s-types.svg)](https://www.npmjs.com/package/s-types) ![Dependencies](https://img.shields.io/david/sebastiansandqvist/s-types.svg) [![build status](http://img.shields.io/travis/sebastiansandqvist/s-types.svg)](https://travis-ci.org/sebastiansandqvist/s-types) [![NPM license](https://img.shields.io/npm/l/s-types.svg)](https://www.npmjs.com/package/s-types) [![Test Coverage](https://codeclimate.com/github/sebastiansandqvist/s-types/badges/coverage.svg)](https://codeclimate.com/github/sebastiansandqvist/s-types/coverage)

# Installation

```bash
npm install --save s-types
```

# Usage

```js
import T from 's-types';

const fooType = T({
	foo: T.string,
	bar: [T.number, T.optional],
	baz: T.arrayOf(T.string)
});

const someObject = {
	foo: 'Hello',
	baz: ['world', '!']
};

fooType(someObject); // passes test, nothing logged to console

const fail = {
	foo: 'Hello',
	bar: 10,
	baz: [1, 2, 3] // !!!
};

// optional second argument to provide name for better error messages
fooType(fail, 'Bad Object');

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

const schema = T({
	foo: [T.string, T.number],
	bar: T.any
});

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

schema(someObject); // passes
schema(anotherObject); // passes
schema(badObject); // fails

```

The `T.schema` and `T.arrayOf` methods allow for nesting complex structures. For example:

```js
const nestedRules = T({
	foo: T.string,
	bar: T.schema({
		baz: T.number,
		qux: T.arrayOf(T.arrayOf(T.number))
	})
});

const someObject = {
	foo: 'Hello',
	bar: {
		baz: 5,
		qux: [[1, 2], [3, 4]]
	}
};

nestedRules(someObject); // passes
```

The `T.exact` and `T.oneOf` methods allow to restrict to an exact value. For instance, a property that must contain the value `"foo"` could be defined like this:

```js
const rules = T({
	x: T.exact('foo'),
	y: [T.exact('bar'), T.optional]
})

const obj1 = { x: 'foo' };
const obj2 = { x: 'foo', y: 'bar' };
const obj3 = { x: 'bar' };

rules(obj1); // passes
rules(obj2); // passes
rules(obj3); // fails
```

`T.oneOf([a, b, c])` is a shorthand for `[T.exact(a), T.exact(b), T.exact(c)]`. It allows you to specify an array of allowed values.

```js
const rules = T({
	x: T.oneOf(['foo', 'bar'])
})

const obj1 = { x: 'foo' };
const obj2 = { x: 'bar' };
const obj3 = { x: 'baz' };

rules(obj1); // passes
rules(obj2); // passes
rules(obj3); // fails
```

## Types provided

- __`T.any`__
- __`T.array`__ (alias `T.arr`)
- __`T.arrayOf(type)`__
	Example: `T.arrayOf(T.string)`
- __`T.boolean`__ (alias `T.bool`)
- __`T.date`__
- __`T.exact`__
	Example: `T.exact('foo')`
- __`T.function`__ (alias `T.fn`)
- __`T.integer`__ (alias `T.int`)
- __`T.nil`__ (prop is `null` or `undefined`)
- __`T.not(type)`__
	Example: `T.not(T.string)`
- __`T.number`__ (alias `T.num`)
- __`T.null`__ (alias `T.NULL`)
- __`T.object`__ (alias `T.obj`)
- __`T.oneOf`__
	Example: `T.oneOf(['foo', 'bar'])`
- __`T.optional`__ (alias `T.undefined`)
- __`T.schema`__ (alias `T.interface`)
	Example: `T.schema({ foo: T.string, bar: T.number })`
- __`T.string`__ (alias `T.str`)

## Custom types

If the provided types are not sufficient, you can provide a custom type checking function to s-types.

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

postiveNumber.type = 'positive number';

const schema = {
	n: positiveNumber
};

const obj = {
	n: 12
};

T(schema)(obj); // passes
```

## Usage in production

This should only be used in development and test environments, so when in production there is a mode that turns type checking into a noop.

Just set `T.disabled` to `true` before running any type checking.

One way to do this would be the following:

```js
import T from 's-types';

T.disabled = process.env.node_env === 'production';

const fooType = T({
	foo: T.string
});

const fail = {
	foo: 5
};

// in a development environment, this logs an error message
// when process.env.node_env === 'production', this logs nothing
fooType(fail, 'Bad Object');
```
## Usage in test environments

There is an option to change the typecheckers to `throw` rather than log to `console.error`. This can be enabled in test environments to make typechecking testable without having to check for messages in stdout.

```js
import T from 's-types';

T.throws = true;

const fooType = T({
	foo: T.string
});

const fail = {
	foo: 5
};

fooType(fail, 'Bad Object'); // throws a TypeError
```

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

## Things to note

In most cases, the return value happens to be `null` when there are no errors or a string if a type mismatch occurred. For some structures, like `T.schema`, this does not always hold true and **should not be relied upon**. The only reliable output is whatever is logged to stderr (or the TypeError that is thrown if `T.throws` is enabled). In addition, when `T.disabled` is set to `true`, the return value will always be `undefined`.
