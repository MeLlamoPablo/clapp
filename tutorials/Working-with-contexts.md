# Working with contexts

When defining more advanced commands, there are scenarios where you may need to pass information to the command, or to the `onReply` output. For instance, if you're using Clapp to run a [Discord](http://discordapp.com) bot, multiple users will have access to each command. But some commands might be reserved for users with elevated privileges, and thus, you will want to validate whether the user has enough privileges to execute the command.

Clapp provides the `context` interface to pass data to both the command and the `onReply` function. Let's take the basic example from the documentation:

```javascript
var foo = new Clapp.Command(
	'foo',
	function(argv, context) {
		console.log(context);
	}
);

var myApp = new Clapp.App(
	{
		name: 'Test App',
		desc: 'An app created with Clapp!',
		prefix: '/testapp'
	},
	function(msg, context) {
		// Called when the App shows an output
		console.log(msg);
	},
	[foo]
);
```

You'll notice the `context` param in your provided functions. The context is *anything* you want it to be. A string, a boolean, an object containing every useful info you need... You name it. You can pass the context to `parseInput`:

```javascript
app.parseInput('/testapp foo', user.hasElevatedPrivileges());
```
When `foo` is executed, you get it back:
```javascript
// foo
function(argv, context) {
    console.log(context); // Logs result of user.hasElevatedPrivileges()
}
```
