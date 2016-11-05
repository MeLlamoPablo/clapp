# Defining the command function

The documentation shows a very basic example of what a command is: when the user executes `foo`, `console.log('foo was executed');`. However, there's two parameters that Clapp passes back to your command:

* `argv` contains the arguments and flags, and
* `context` contains your own information. See "[Working with contexts]{@tutorial working-with-contexts}" for further info about contexts.

## The `argv` object

The `argv` object contains two children:

* `argv.args`, and
* `argv.flags`.

Both objects contain children objects with your data. So if you define the following flag:

```javascript
var flag = {
	name: "limit",
	desc: "The number of items that will be shown.",
	type: "number",
	alias: "l",
	default: 10
}
```

And the user runs:

```javascript
app.parseInput("/testapp foo -l 25");
```

Then you get:

```javascript
// Command function
function(argv, context) {
	console.log(argv.flags.limit); // 25
}
```

If the user ran:
```javascript
app.parseInput("/testapp foo");
```
Then you'd get:

```javascript
// Command function
function(argv, context) {
	console.log(argv.flags.limit); // 10, because it's the default value.
}
```

## Returning data

Generally, you want to return a message to the user with the feedback about the operation they just did.

#### Returning a message

In your command function, you can `return` a `string` that will be redirected to your `onReply` function (in the `msg` parameter), using the same context that was passed into your command function. For instance:

```javascript
// Command function
function(argv, context) {
	if (argv.flags.iAmHappy) {
		return "Awesome! :)";
	} else {
		return "Then smile! :)";
	}
}
```

#### Modifying the context

If you also need to pass your own data to your `onReply` function, you can modify the context, and `return` an `object` containing two properties: `message` and `context`. For instance:

```javascript
// Command function
function(argv, context) {
	if (argv.flags.iAmHappy) {
		return {
			message: "Awesome",
			context: {
				userIsHappy: true
			}
		};
	} else {
		return {
			message: "Then smile! :)",
			context: {
				userIsHappy: false
			}
		};
	}
}
```

To learn more about contexts, see [Working with contexts]{@tutorial Working-with-contexts}.

#### Not doing anything

If you don't want to send a message, return something that is neither `string`, `object` nor
 `Promise`, or just don't return nothing at all.

## Asynchronous functions

In some cases, you might need your command's `fn` to behave asynchronously. In order to do so, 
you can return a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise),
and instead of returning your data through the `return` statement, you can return it inside the 
promise using the `fulfill` function:

```javascript
// Command function
function(argv, context) {
	return new Promise((fulfill, reject) => {
		doTheThing().then(() => {
			fulfill("I'm done!");
		});
	});
}
```

Of course, the examples above still apply: you can modify the context from within the `Promise`:

```javascript
// Command function
function(argv, context) {
	return new Promise((fulfill, reject) => {
		doTheThing().then((bar) => {
			context.bar = bar;
			fulfill("I'm done!", context);
		});
	});
}
```

#### Rejecting the promise

Typically, when you're dealing with Promises, you're also dealing with error handling; the async 
functions that you invoke inside your command's function may return errors. If you encounter any 
of them, you might be inclined to log them to the console:

```javascript
// Command function
function(argv, context) {
	return new Promise((fulfill, reject) => {
		doTheThing().then(() => {
			fulfill("I'm done!");
		}).catch(err => {
			console.error(err);
		});
	});
}
```

However, this doesn't let the user know about what happened. To solve this, you can use the 
`reject` function to pass the error back to Clapp:

```javascript
// Command function
function(argv, context) {
	return new Promise((fulfill, reject) => {
		doTheThing().then(() => {
			fulfill("I'm done!");
		}).catch(err => {
			reject(err);
		});
	});
}
```

Which can be simplified to:

```javascript
// Command function
function(argv, context) {
	return new Promise((fulfill, reject) => {
		doTheThing().then(() => {
			fulfill("I'm done!");
		}).catch(reject);
	});
}
```

This will log the error to the console, and send the following message to the output: `An internal
error occurred while trying to execute the command <command>.`. You should only use the `reject` 
function for errors that don't concern the user. For example, "the connection to the database 
can't be established", or "there is a syntax error on your code". The end user probably doesn't 
care, so the standard message is good enough. It's best to avoid using this function for errors 
that concern them, such as "this element can't be found in the database". To alert the user about
 that, just use `fulfill`.