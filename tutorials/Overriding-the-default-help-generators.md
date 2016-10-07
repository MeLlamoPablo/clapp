# Overriding the default help generators

When the user passes the `--help` flag, Clapp automatically generates a command help and outputs it. This is good enough in some scenarios, but in others you might need to override the default `_getHelp()` methods to print the help in your custom style. For example, if we were to design a Discord bot using Clapp, we'd want to take advantage of the Discord markdown; so we'd need to override the default help generator.

That can be done by extending the default Classes: [App]{@link App} and [Command]{@link Command}.

### Extending Command

In order to extend command, declare your own class, and call `super` indide the constrcutor:

```js
class MyCommand extends Clapp.Command {
	constructor(name, fn, desc = '', args = [], flags = []) {
		super(name, fn, desc, args, flags);
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
_getHelp(app) {
	var r = str.help_usage + ' ' + app.prefix + ' ' + this.name;

	// Add every argument to the usage (Only if there are arguments)
	if (Object.keys(this.args).length > 0) {
		var args_data = [];
		for (var i in this.args) {
			r += this.args[i].required ? ' (' + i + ')' : ' [' + i + ']';
			args_data.push({
				'Argument': i,
				'Description': typeof this.args[i].desc !== 'undefined' ?
					           this.args[i].desc : '',
				'Default': typeof this.args[i].default !== 'undefined' ?
					       this.args[i].default : ''
			});
		}
	}

	r += '\n' + this.desc;

	if (Object.keys(this.args).length > 0)
		r += '\n\n' + str.help_av_args + ':\n\n' + printTable(args_data);

	// Add every flag, only if there are flags to add
	if (Object.keys(this.flags).length > 0) {
		var flags_data = [];
		for (i in this.flags) {
			flags_data.push({
				'Option': (typeof this.flags[i].alias !== 'undefined' ?
				        '-' + this.flags[i].alias + ', ' : '') + '--' + i,
				'Description': typeof this.flags[i].desc !== 'undefined' ?
					this.flags[i].desc : '',
				'Default': typeof this.flags[i].default !== 'undefined' ?
					this.flags[i].default : ''
			});
		}

		r += '\n\n' + str.help_av_options + ':\n\n' + printTable(flags_data);
	}

	if (Object.keys(this.args).length > 0)
		r += '\n\n' + str.help_args_required_optional;

	return r;
}
```

Note that the `str` object won't be available to you since Clapp doesn't export it. You may copy it from the source, or replace it with your own strings. Note also that the [printTable](https://www.npmjs.com/package/tableprinter) function comes already as a dependency with Clapp, so fel free to use it with:

```js
const printTable = require('tableprinter');
```

### Extending App

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
_getHelp(app) {
	var r = str.help_usage + ' ' + app.prefix + ' ' + this.name;

	// Add every argument to the usage (Only if there are arguments)
	if (Object.keys(this.args).length > 0) {
		var args_data = [];
		for (var i in this.args) {
			r += this.args[i].required ? ' (' + i + ')' : ' [' + i + ']';
			args_data.push({
				'Argument': i,
				'Description': typeof this.args[i].desc !== 'undefined' ?
					           this.args[i].desc : '',
				'Default': typeof this.args[i].default !== 'undefined' ?
					       this.args[i].default : ''
			});
		}
	}

	r += '\n' + this.desc;

	if (Object.keys(this.args).length > 0)
		r += '\n\n' + str.help_av_args + ':\n\n' + printTable(args_data);

	// Add every flag, only if there are flags to add
	if (Object.keys(this.flags).length > 0) {
		var flags_data = [];
		for (i in this.flags) {
			flags_data.push({
				'Option': (typeof this.flags[i].alias !== 'undefined' ?
				        '-' + this.flags[i].alias + ', ' : '') + '--' + i,
				'Description': typeof this.flags[i].desc !== 'undefined' ?
					this.flags[i].desc : '',
				'Default': typeof this.flags[i].default !== 'undefined' ?
					this.flags[i].default : ''
			});
		}

		r += '\n\n' + str.help_av_options + ':\n\n' + printTable(flags_data);
	}

	if (Object.keys(this.args).length > 0)
		r += '\n\n' + str.help_args_required_optional;

	return r;
}
```

Again, you won't be able to use the `str` object, so watch out for that.