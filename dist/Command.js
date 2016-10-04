'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var printTable = require('tableprinter');

var str = require('./strings/en.js');

/**
 * A Command that can be bound to an App. A command represents a single function that achieves a
 * single purpose. The command can receive arguments and flags, and can return a string that will be
 * redirected to the app output (See: {@link onReply}).
 *
 * @class  Command
 * @param {string} name The command's name. The command will be invoked by writing the app prefix
 *                      followed by a space and the command's name.
 * @param {function} fn The function that will be executed when the command is invoked. The
 *                      function receives the following params: {@link argv} and context. For more
 *                      information, see {@tutorial Defining-the-command-function}.
 * @param {string} [desc] A description of what the command does.
 * @param {argument[]} [arguments] An array with every argument supported by the command. See
 *                                 {@link argument}.
 * @param {flag[]} [flags] An array with every flag supported by the command. See {@link flag}.
 *
 * @example
 * var foo = new Clapp.Command(
 * 	'foo',
 * 	function(argv, context) {
 * 		console.log('foo was executed');
 * 	},
 * 	'does foo'
 * 	[
 * 		{
 * 			name: 'testarg',
 * 			desc: 'A test argument',
 * 			type: 'string',
 * 			required: false,
 * 			default: 'testarg isn\'t defined'
 * 		}
 * 	],
 * 	[
 * 		{
 * 			name: 'testflag',
 * 			desc: 'A test flag',
 * 			alias: 't',
 * 			type: 'boolean',
 * 			default: false
 * 		}
 * 	]
 * );
 *
 * app.addCommand(foo);
 */

var Command = function () {
	function Command(name, fn) {
		var desc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
		var args = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
		var flags = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];

		_classCallCheck(this, Command);

		if (typeof name !== 'string' || name === '' || typeof desc !== 'string' || !Array.isArray(args) || !Array.isArray(flags) || typeof fn !== 'function') throw new Error('Wrong parameters passed when creating command ' + name + '. Please refer to the documentation.');

		this.name = name;
		this.desc = desc;

		/**
   * @typedef {Object} argument
   *
   * An argument is an option passed to the command. In the CLI sentence (See
   * [App.isCliSentence]{@link App#isCliSentence}) "/testapp foo bar", "bar" would be the
   * value of the first argument.
   *
   * @property {string} name The argument name. This options has two purposes: to document the
   *                         command help, and to identify the option in the "argv.args"
   *                         variable passed back to the command function.
   * @property {string} [desc] A description about what the argument is and what information
   *                           the user is expected to supply. It is used to show the
   *                           command help to the user.
   * @property {string} type The argument data type. Typically, this will be "string" or
   *                         "number". Clapp won't complain about other data types, but using
   *                         them will probably cause unexpected behaviour.
   * @property {boolean} [required=false] Whether or not the argument is required for the
   *                                      command to work. If the user fails to supply every
   *                                      required argument, Clapp will warn them about the
   *                                      problem and redirect them to the command help.
   * @property {*} [default] A default value that will be passed into the "argv.args" if the
   *                         user does not supply a value. This only works if "required" is
   *                         set to false; it has no effect otherwise.
   *
   * @example
   * var arg = {
   * 	name: 'file',
   * 	desc: 'The file where the data will be saved',
   * 	type: 'string',
   * 	required: false,
   * 	default: 'defaultfile.dat'
   * }
   */
		this.args = {};
		for (var i = 0; i < args.length; i++) {
			if (typeof args[i].name !== 'string') throw new Error('Error creating command ' + name + ': unnamed argument. Please refer to the documentation.');

			if (typeof args[i].type !== 'string') throw new Error('Error creating command ' + name + ': unspecified argument type. Please refer to the documentation.');

			this.args[args[i].name] = {
				required: typeof args[i].required === 'boolean' ? args[i].required : false,
				desc: typeof args[i].desc === 'undefined' ? undefined : args[i].desc,
				type: args[i].type
			};

			// If the argument is not required, it may have a default value
			if (!this.args[args[i].name].required && typeof args[i].default !== 'undefined') this.args[args[i].name].default = args[i].default;
		}

		/**
   * @typedef {Object} flag
   *
   * A flag is an option passed to the command. Unlike arguments, flags are optional by
   * nature, meaning that you can't require the user to pass a flag. Flags always have a full
   * name, and may have aliases (i.e: "--debug" and "-d"). In the CLI sentence (See
   * [App.isCliSentence]{@link App#isCliSentence}) "/testapp foo --bar", "bar" would be the
   * flag the user passed, and its value would be "true".
   *
   * @property {string} name The flag name. This options has two purposes: to document the
   *                         command help, and to identify the option in the "argv.flags"
   *                         variable passed back to the command function.
   * @property {string} [desc] A description about what the flag is and what information
   *                           the user is expected to supply. It is used to show the
   *                           command help to the user.
   * @property {string} type The flag data type. Typically, this will be "boolean", "string"
   *                          or "number". Clapp won't complain about other data types, but
   *                          using them will probably cause unexpected behaviour.
   * @property {*} [default] A default value that will be passed into the "argv.flags" if the
   *                         user does not supply a value.
   * @property {string} [alias] A string of only one character containing the alias of the
   *                            flag. If the alias of "limit" is "l", then "--limit=15" will
   *                            have the same effect as "-l 15".
   *
   * @example
   * var flag = {
   * 	name: 'limit',
   * 	desc: 'The number of items that will be shown. Can\'t be higher than 50',
   * 	type: 'number',
   * 	alias: 'l',
   * 	default: 10
   * }
   */
		this.flags = {};
		for (i = 0; i < flags.length; i++) {
			if (typeof flags[i].name !== 'string') throw new Error('Error creating command ' + name + ': unnamed flag. Please refer to the documentation.');

			if (typeof flags[i].type !== 'string') throw new Error('Error creating command ' + name + ': unspecified flag type. Please refer to the documentation.');

			if (typeof flags[i].alias === 'string' && flags[i].alias.length !== 1) throw new Error('Error creating command ' + name + ': aliases can only be one character long.');

			this.flags[flags[i].name] = {
				type: flags[i].type,
				alias: typeof flags[i].alias === 'undefined' ? undefined : flags[i].alias,
				default: typeof flags[i].default === 'undefined' ? undefined : flags[i].default,
				desc: typeof flags[i].desc === 'undefined' ? undefined : flags[i].desc
			};
		}

		this.fn = fn;
	}

	/**
  * Returns the command specific help
  *
  * @param {App} app We need it to access the parent app info.
  * @private
  */


	_createClass(Command, [{
		key: '_getHelp',
		value: function _getHelp(app) {
			var r = str.help_usage + ' ' + app.prefix + ' ' + this.name;

			// Add every argument to the usage (Only if there are arguments)
			if (Object.keys(this.args).length > 0) {
				var args_data = [];
				for (var i in this.args) {
					r += this.args[i].required ? ' (' + i + ')' : ' [' + i + ']';
					args_data.push({
						'Argument': i,
						'Description': typeof this.args[i].desc !== 'undefined' ? this.args[i].desc : '',
						'Default': typeof this.args[i].default !== 'undefined' ? this.args[i].default : ''
					});
				}
			}

			r += '\n' + this.desc;

			if (Object.keys(this.args).length > 0) r += '\n\n' + str.help_av_args + ':\n\n' + printTable(args_data);

			// Add every flag, only if there are flags to add
			if (Object.keys(this.flags).length > 0) {
				var flags_data = [];
				for (i in this.flags) {
					flags_data.push({
						'Option': (typeof this.flags[i].alias !== 'undefined' ? '-' + this.flags[i].alias + ', ' : '') + '--' + i,
						'Description': typeof this.flags[i].desc !== 'undefined' ? this.flags[i].desc : '',
						'Default': typeof this.flags[i].default !== 'undefined' ? this.flags[i].default : ''
					});
				}

				r += '\n\n' + str.help_av_options + ':\n\n' + printTable(flags_data);
			}

			if (Object.keys(this.args).length > 0) r += '\n\n' + str.help_args_required_optional;

			return r;
		}
	}]);

	return Command;
}();

module.exports = Command;