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
	name: 'limit',
	desc: 'The number of items that will be shown. Can\'t be higher than 50',
	type: 'number',
	alias: 'l',
	default: 10
}
```

And the user runs:

```javascript
app.parseInput('/testapp foo -l 25');
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
app.parseInput('/testapp foo');
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
	if (argv.flags.limit < 50) {
		doTheThing();
		return 'Operation successful!';
	} else {
		return 'The limit can\'t be higher than 50, sorry!';
	}
}
```

#### Modifying the context

If you also need to pass your own data to your `onReply` function, you can modify the context, and `return` an `object` containing two properties: `message` and `context`. For instance:

```javascript
// Command function
function(argv, context) {
	if (argv.flags.limit < 50) {
		doTheThing();
		return {
			message: 'Operation successful!',
			context: {
				operation_complete: true
			}
		};
	} else {
		return {
			message: 'The limit can\'t be higher than 50, sorry!',
			context: {
				operation_complete: false
			}
		};
	}
}
```

You may omit the `message` param, though it is not recommended. If you do it, your `onReply`'s `msg` will be `undefined`, wich may cause unexpected behaviour. So you should probably prepare your function for that scenario.

To learn more about contexts, see [Working with contexts]{@tutorial Working-with-contexts}.

#### Not doing anything

If you don't want to send a message, just return something that is neither `string` nor `object` or don't return nothing at all.
