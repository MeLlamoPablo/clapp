# Overriding the default help generators

When the user passes the `--help` flag, Clapp automatically generates a command help and outputs it. This is good enough in some scenarios, but in others you might need to override the default `_getHelp()` methods to print the help in your custom style. For example, if we were to design a Discord bot using Clapp, we'd want to take advantage of the Discord markdown; so we'd need to override the default help generator.

That can be done by extending the default Classes: [App]{@link App} and [Command]{@link Command}.

## Extending Command

In order to extend command, declare your own class, and call `super` indide the constrcutor:

```js
class MyCommand extends Clapp.Command {
	constructor(name, fn, desc = '', args = [], flags = [], async = false) {
		super(name, fn, desc, args, flags, async);
	}
}
```

After that, you may implement your own `_getHelp()` method:

```js
class MyCommand extends Clapp.Command {
	constructor(name, fn, desc = '', args = [], flags = []) {
		super(name, fn, desc, args, flags);
	}


	_getHelp(app) {
		/**
		 * You may use "app" and "this" to document your help.
		 * App is the Clapp.App instance of the app containing this
		 * command, and "this" is the command itself.
		 */
		return 'The help for command "' +
		       this.name + '" is overridden! D:'
	}
}
```

You could start from copying the original `_getHelp()` from the source code, and then change it:

```js
/**
 * Returns the command specific help
 *
 * @param {App} app We need it to access the parent app info.
 * @private
 */
_getHelp(app) {
	const LINE_WIDTH = 100;

	var r = str.help_usage + ' ' + app.prefix + ' ' + this.name;

	// Add every argument to the usage (Only if there are arguments)
	if (Object.keys(this.args).length > 0) {
		var args_table = new Table({
			chars: {
				'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': '', 'bottom': '' ,
				'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': '', 'left': '' ,
				'left-mid': '' , 'mid': '' , 'mid-mid': '', 'right': '' , 'right-mid': '' ,
				'middle': ''
			},
			head: ['Argument', 'Description', 'Default'],
			colWidths: [0.20*LINE_WIDTH, 0.35*LINE_WIDTH, 0.25*LINE_WIDTH],
			wordWrap: true
		});
		for (var i in this.args) {
			r += this.args[i].required ? ' (' + i + ')' : ' [' + i + ']';
			args_table.push([
				i,
				typeof this.args[i].desc !== 'undefined' ?
					   this.args[i].desc : '',
				typeof this.args[i].default !== 'undefined' ?
					   this.args[i].default : ''
			]);
		}
	}

	r += '\n' + this.desc;

	if (Object.keys(this.args).length > 0)
		r += '\n\n' + str.help_av_args + ':\n\n' + args_table.toString();

	// Add every flag, only if there are flags to add
	if (Object.keys(this.flags).length > 0) {
		var flags_table = new Table({
			chars: {
				'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': '', 'bottom': '' ,
				'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': '', 'left': '' ,
				'left-mid': '' , 'mid': '' , 'mid-mid': '', 'right': '' , 'right-mid': '' ,
				'middle': ''
			},
			head: ['Option', 'Description', 'Default'],
			colWidths: [0.20*LINE_WIDTH, 0.35*LINE_WIDTH, 0.25*LINE_WIDTH],
			wordWrap: true
		});
		for (i in this.flags) {
			flags_table.push([
				(typeof this.flags[i].alias !== 'undefined' ?
						'-' + this.flags[i].alias + ', ' : '') + '--' + i,
				typeof this.flags[i].desc !== 'undefined' ?
					this.flags[i].desc : '',
				typeof this.flags[i].default !== 'undefined' ?
					this.flags[i].default : ''
			]);
		}

		r += '\n\n' + str.help_av_options + ':\n\n' + flags_table.toString();
	}

	if (Object.keys(this.args).length > 0)
		r += '\n\n' + str.help_args_required_optional;

	return r;
}
```

Note that the `str` object won't be available to you since Clapp doesn't export it. You may copy it from the source, or replace it with your own strings. Note also that the [cli-table2](https://www.npmjs
.com/package/cli-table2) function comes already as a dependency with Clapp, so fel free to use it
 with:

```js
const Table = require('cli-table2');
```

## Extending App

The procedure for extending App is the same:

```js
class MyApp extends Clapp.App {
	constructor(options, onReply, commands = []) {
		super(options, onReply, commands);
	}

	_getHelp() {
		return 'The help for the app "' + this.name + '" is overridden! D:';
	}
}
```

Here's the source from `_getHelp()`, in case you want to start from there:

```js
/**
 * Returns the global app help
 *
 * @private
 */
_getHelp() {
	const LINE_WIDTH = 100;

	var r =
		this.name + (typeof this.version !== 'undefined' ? ' v' + this.version : '') + '\n' +
		this.desc + '\n\n' +

		str.help_usage + this.prefix + ' ' + str.help_command + '\n\n' +

		str.help_cmd_list + '\n\n'
	;

	// Command list
	var table = new Table({
		chars: {
			'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': '', 'bottom': '' ,
			'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': '', 'left': '' ,
			'left-mid': '' , 'mid': '' , 'mid-mid': '', 'right': '' , 'right-mid': '' ,
			'middle': ''
		},
		colWidths: [0.1*LINE_WIDTH, 0.9*LINE_WIDTH],
		wordWrap: true
	});

	for (var i in this.commands) {
		table.push([i, this.commands[i].desc]);
	}

	r +=
		table.toString() + '\n\n' +
		str.help_further_help + this.prefix + ' ' + str.help_command + ' --help'
	;

	return r;
}
```

Again, you won't be able to use the `str` object, so watch out for that.