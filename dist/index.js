'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var parseSentence = require('minimist-string');
var Table = require('cli-table2');

var Command = require('./Command.js');
var str = require('./strings/en.js');

/**
 * @class App
 *
 * A command line app. An App can parse an input with {@link parseInput}, and if it's correct (i.e:
 * refers to an existing command and provides the required options), the command will be executed.
 * An App needs an onReply function to be able to communicate with the user.
 *
 * @param {object} options
 * @param {string} options.name
 *
 * The app's name. This isn't necessarily the same as the prefix. Its only purpose is to be shown to
 * the user in case of syntax error, or when they request the app help.
 *
 * @param {string} options.desc
 *
 * A description of what the app does. This will be used to document the app's help.
 *
 * @param {string} options.prefix
 *
 * The app's prefix. It will be used by {@link parseInput} to determine the user's intention to run
 * a command corresponding to this App instance.
 *
 * @param {onReply} options.onReply
 *
 * A function that allows the App to communicate with the end user. When the App needs to show an
 * output, the onReply function will be executed.
 *
 * @param {string} [options.version]
 *
 * The app's version. It will be used to document the app's help.
 *
 * @param {string} [options.separator=" "]
 *
 * A string that separates the app's prefix from the rest of the CLI sentence. For instance, in the
 * sentence `-testapp foo` the separator would be `' '` (space character). Normally you wouldn't
 * want to touch this, but in some scenarios it's useful to have the separator be `''`
 * (empty string), so that you could do `/command`, where `/` is the app's prefix.
 *
 * @param {Command[]} [options.commands]
 *
 * An array of commands that will immediately be bound to the app. Additional commands can be later
 * bound using {@link App#addCommand}.
 *
 * @example
 * const Clapp = require('clapp');
 *
 * var myApp = new Clapp.App({
 * 	name: "Test App",
 * 	desc: "An app created with Clapp!",
 * 	prefix: "-testapp", // Commands will have this structure: -testapp foo --bar
 * 	version: "1.2.0",
 * 	onReply: function (msg, context) {
 * 		// Called when the App shows output
 * 		console.log(msg);
 * 	},
 * 	commands: [myCommand1, myCommand2]
 * });
 *
 * myApp.addCommand(myCommand3);
 */

var App = function () {
	function App(options) {
		_classCallCheck(this, App);

		if (typeof options === 'undefined' || // options is required
		typeof options.name !== 'string' || // name is required
		typeof options.desc !== 'string' || // desc is required
		typeof options.prefix !== 'string' || // prefix is required
		typeof options.onReply !== 'function' || // onReply is required
		options.commands && !Array.isArray(options.commands) || // commands are not required
		options.version && typeof options.version !== 'string' || // version is not required
		options.separator && typeof options.separator !== 'string' // separator is not required

		) throw new Error('Wrong options passed into the Clapp constructor. ' + 'Please refer to the documentation.');

		this.name = options.name;
		this.desc = options.desc;
		this.prefix = options.prefix;
		this.version = typeof options.version === 'string' ? options.version : undefined;
		// doing options.separator || ' ' would invalidate the separator being ''
		this.separator = typeof options.separator !== 'undefined' ? options.separator : ' ';

		/**
   * @typedef {function} onReply
   *
   * The onReply function gets called every time Clapp needs to show output to the user. It
   * receives two parameters: `msg` and `context`. The `msg` parameter is the message that you
   * need to show to the user. It can be the generated command help, if the user requests
   * it, an error message if the user doesn't pass a valid cli sentence, or your own message,
   * returned by the command function.
   *
   * The `context` is anything that you defined when calling {@link App#parseInput}, for more
   * information see {@tutorial Working-with-contexts}
   *
   * @example
   * function(msg, context) {
   * 	createMessage(msg, context.user);
   * }
   */
		this.reply = options.onReply;

		this.commands = {};
		options.commands = options.commands || [];
		for (var i = 0; i < options.commands.length; i++) {
			this.addCommand(options.commands[i]);
		}
	}

	/**
  * Binds a command to the app so that the command can be executed from
  * [parseInput]{@link App#parseInput}.
  *
  * @param {Command} cmd The command to bind.
  *
  * @example
  * app.addCommand(new Clapp.Command(
  * 	'foo',
  * 	function(argv, context) {
  * 		console.log('foo was executed');
  * 	}
  * )):
  */


	_createClass(App, [{
		key: 'addCommand',
		value: function addCommand(cmd) {
			if (!(cmd instanceof Command)) throw new Error('Error adding a command to ' + this.name + '. Provided parameter is not a command. Please refer to the documentation.');

			this.commands[cmd.name] = cmd;
		}

		/**
   * Parses an input CLI sentence (See [isCliSentence]{@link App#isCliSentence}) and performs
   * actions accordingly:
   * if the sentence is a valid command, that command is executed. If it is an invalid CLI
   * sentence, the user is warned about the problem. If the user passes the "--help" flag, they
   * are prompted with the app general help, or the command specific help.
   *
   * Please note the following:
   *
   * - The input is not sanitized. It is your responsibility to do so.
   * - It would be a good idea to sanitize your input by using [validations]{@link validation}.
   * - It is also imperative that you make sure that the input is a CLI sentence (valid or
   * not) by using [isCliSentence]{@link App#isCliSentence}. Otherwise, Clapp will throw an error.
   *
   * @param {string} input A CLI sentence. See [isCliSentence]{@link App#isCliSentence}.
   * @param {*} context The context to retrieve later. See {@tutorial Working-with-contexts}.
   *
   * @example
   * app.parseInput('/testapp foo');        // Executes `foo`
   * app.parseInput('/testapp foo --bar');  // Executes `foo` passing the --bar flag
   * app.parseInput('/testapp foo --help'); // Shows the command help for `foo`
   * app.parseInput('/testapp --help');     // Shows the app help
   * app.parseInput('Not a CLI sentence');  // Throws an error. Make sure to validate
   *                                        // user input with App.isCliSentence();
   */

	}, {
		key: 'parseInput',
		value: function parseInput(input, context) {
			if (typeof input !== 'string') throw new Error('Input must be a string! Don\'t forget to sanitize it.');

			if (!this.isCliSentence(input)) {
				throw new Error('Clapp: attempted to parse the input "' + input + '", ' + 'but it is not a CLI sentence (doesn\'t begin with the app prefix).');
			}

			var argv = parseSentence(input.replace(this.prefix + this.separator, ''));

			// Find whether or not the requested command exists
			var cmd = this.commands[argv._[0]];
			if (typeof cmd === 'undefined') {
				// The command doesn't exist. Four scenarios possible:
				if (argv.help || input === this.prefix) {
					// The help flag was passed OR the user typed just the command prefix.
					// Show app help.
					this.reply(this._getHelp(), context);
				} else if (argv.version) {
					// The user asked for the app version
					this.reply('v' + this.version, context);
				} else {
					// The user made a mistake. Let them know.
					this.reply(str.err + str.err_unknown_command.replace('%CMD%', argv._[0]) + ' ' + str.err_type_help.replace('%PREFIX%', this.prefix), context);
				}
			} else {
				// The command exists. Three scenarios possible:
				if (argv.help) {
					// The user requested the command specific help.
					this.reply(cmd._getHelp(this), context);
				} else {
					// Find whether or not it supplies every required argument.
					var unfulfilled_args = {};
					var j = 1; // 1 because argv._[0] is the command name
					for (var i in cmd.args) {
						if (cmd.args[i].required && typeof argv._[j] === 'undefined') unfulfilled_args[i] = cmd.args[i];

						j++;
					}

					if (Object.keys(unfulfilled_args).length > 0) {
						var r = str.err + str.err_unfulfilled_args + '\n';
						for (i in unfulfilled_args) {
							r += i + '\n';
						}
						r += '\n' + str.err_type_help.replace('%PREFIX%', this.prefix + ' ' + argv._[0]);

						this.reply(r, context);
					} else {
						var final_argv = { args: {}, flags: {} };
						var errors = [];

						// Give values to every argument
						j = 1;
						for (i in cmd.args) {
							final_argv.args[i] = argv._[j];

							// If the arg wasn't supplied and it has a default value, use it
							if (typeof final_argv.args[i] === 'undefined' && typeof cmd.args[i].default !== 'undefined') final_argv.args[i] = cmd.args[i].default;

							// Convert it to the correct type, and register errors.
							final_argv.args[i] = App._convertType(final_argv.args[i], cmd.args[i].type);

							if (_typeof(final_argv.args[i]) === "object") {
								errors.push("Error on argument " + i + ": expected " + final_argv.args[i].expectedType + ", got " + final_argv.args[i].providedType + " instead.");
							} else {
								// If the user input matches the required data type, perform every
								// validation, if there's any:
								for (var k = 0; k < cmd.args[i].validations.length; k++) {
									if (!cmd.args[i].validations[k].validate(final_argv.args[i])) {
										errors.push("Error on argument " + i + ": " + cmd.args[i].validations[k].errorMessage);
									}
								}
							}

							j++;
						}

						// Give values to every flag
						for (i in cmd.flags) {
							if (typeof argv[i] === 'undefined' || argv[i] === null) {
								// The user didn't specify the flag, but might have specified the alias
								final_argv.flags[i] = argv[cmd.flags[i].alias] || cmd.flags[i].default;
							} else {
								// The user specified the flag
								final_argv.flags[i] = argv[i];
							}

							// Convert it to the correct type, and register errors.
							final_argv.flags[i] = App._convertType(final_argv.flags[i], cmd.flags[i].type);

							if (_typeof(final_argv.flags[i]) === "object") {
								errors.push("Error on flag " + i + ": expected " + final_argv.flags[i].expectedType + ", got " + final_argv.flags[i].providedType + " instead.");
							} else {
								// If the user input matches the required data type, perform every
								// validation, if there's any:
								for (k = 0; k < cmd.flags[i].validations.length; k++) {
									if (!cmd.flags[i].validations[k].validate(final_argv.flags[i])) {
										errors.push("Error on flag " + i + ": " + cmd.flags[i].validations[k].errorMessage);
									}
								}
							}
						}

						// If we don't have any errors, we can execute the command
						var response;
						if (errors.length === 0) {
							/**
       * @typedef {Object} argv
       *
       * For more information, see {@tutorial Defining-the-command-function}.
       *
       * @property {Object} args  An object containing every argument.
       * @property {Object} flags An object containing every flag.
       *
       * @example
       *
       * {
       * 	args: {
       * 		myRequiredArg: 'foo',
       * 		myOptionalArgWithDefaultValue: 'bar',
       * 	},
       * 	flags: {
       * 		limit: 20,
       * 		debug: true
       * 	}
       * }
       */
							if (!this.commands[argv._[0]].async) {
								response = this.commands[argv._[0]].fn(final_argv, context);

								if (typeof response === 'string') {
									this.reply(response, context);
								} else if ((typeof response === 'undefined' ? 'undefined' : _typeof(response)) === 'object' && (typeof response.message !== 'undefined' || typeof response.context !== 'undefined')) {
									this.reply(response.message, response.context);
								}
							} else {
								var self = this;
								this.commands[argv._[0]].fn(final_argv, context, function cb(response, newContext) {
									if (typeof response === 'string') {
										if (typeof newContext !== 'undefined') {
											self.reply(response, newContext);
										} else {
											self.reply(response, context);
										}
									}
								});
							}
						} else {
							response = str.err + str.err_type_mismatch + "\n\n";
							for (i = 0; i < errors.length; i++) {
								response += errors[i] + "\n";
							}
							this.reply(response, context);
						}
					}
				}
			}
		}

		/**
   * Validates an input to find out whether or not it is a CLI sentence.
   *
   * A CLI sentence (valid or not) is a string that begins with the app prefix. A valid CLI
   * sentence is a CLI sentence that does not result in an error upon parsing.
   *
   * @param {string} sentence The string to test.
   *
   * @example
   * app.isCliSentence('/testapp foo --bar'); // True
   * app.isCliSentence('Hello, world!')       // False
   */

	}, {
		key: 'isCliSentence',
		value: function isCliSentence(sentence) {
			return sentence === this.prefix || sentence.substring(0, this.prefix.length + this.separator.length) === this.prefix + this.separator;
		}

		/**
   * Converts an argument to the requested data type. Returns null if impossible.
   * @param  {string|number|boolean} arg
   * @param  {string}                toType
   * @return {string|number|boolean|null|inputMismatchInfo}
   *         Returns the desired value, or the error information on fail.
   * @private
   *
   * @typedef  {object} inputMismatchInfo
   * @property {string} providedType
   * @property {string} expectedType
   */

	}, {
		key: '_getHelp',


		/**
   * Returns the global app help
   *
   * @private
   */
		value: function _getHelp() {
			var LINE_WIDTH = 100;

			var r = this.name + (typeof this.version !== 'undefined' ? ' v' + this.version : '') + '\n' + this.desc + '\n\n' + str.help_usage + this.prefix + ' ' + str.help_command + '\n\n' + str.help_cmd_list + '\n\n';

			// Command list
			var table = new Table({
				chars: {
					'top': '', 'top-mid': '', 'top-left': '', 'top-right': '', 'bottom': '',
					'bottom-mid': '', 'bottom-left': '', 'bottom-right': '', 'left': '',
					'left-mid': '', 'mid': '', 'mid-mid': '', 'right': '', 'right-mid': '',
					'middle': ''
				},
				colWidths: [0.1 * LINE_WIDTH, 0.9 * LINE_WIDTH],
				wordWrap: true
			});

			for (var i in this.commands) {
				table.push([i, this.commands[i].desc]);
			}

			r += table.toString() + '\n\n' + str.help_further_help + this.prefix + ' ' + str.help_command + ' --help';

			return r;
		}
	}], [{
		key: '_convertType',
		value: function _convertType(arg, toType) {
			switch (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) {
				case "string":

					switch (toType) {
						case "string":
							// String asked, string provided. We're good to go.
							return arg;
						case "number":
							// Number asked, string provided.
							// We don't even try to convert the string to a number, because if the user
							// had provided a number, minimist would have given us a number, meaning
							// that we wouldn't be here. So we have an error.
							return {
								providedType: "string",
								expectedType: "number"
							};
						case "boolean":
							// Boolean asked, string provided.
							// The common scenario for getting a boolean would be an user inputting
							// something like this: --boolOption.
							// But we also want this to work: --boolOption=true and --boolOption="true"
							// So we try to convert the string to boolean:
							switch (arg.toLowerCase()) {
								case "true":
									// We have a boolean with the value true. We're good to go.
									return true;
								case "false":
									// We have a boolean with the value false. We're good to go.
									return false;
								default:
									// The string can't be converted to boolean.
									// We have an error.
									return {
										providedType: "string",
										expectedType: "boolean"
									};
							}
						/* istanbul ignore next */
						default:
							// This shouldn't happen.
							throw new Error("Clapp: internal error." + "Please report this to the bug tracker.");
					}

				case "number":

					switch (toType) {
						case "string":
							// String asked, number provided.
							// This is fine, the expected value could be a number string,
							// so we just convert it.
							return arg.toString();
						case "number":
							// Number asked, number provided. We're good to go.
							return arg;
						case "boolean":
							// We want to accept the values of 0 and 1 as booleans, and reject the rest.
							if (arg === 0) {
								return false;
							} else if (arg === 1) {
								return true;
							} else {
								return {
									providedType: "number",
									expectedType: "boolean"
								};
							}
						/* istanbul ignore next */
						default:
							// This shouldn't happen.
							throw new Error("Clapp: internal error." + "Please report this to the bug tracker.");
					}

				case "boolean":

					// If a boolean is provided, it only makes sense to accept it if a boolean is asked
					// because although true could be converted to 1 or string "true", it would only
					// be confusing and cause unexpected behaviour.
					switch (toType) {
						case "string":
							return {
								providedType: "boolean",
								expectedType: "string"
							};
						case "number":
							return {
								providedType: "boolean",
								expectedType: "number"
							};
						case "boolean":
							// We gucci
							return arg;
						/* istanbul ignore next */
						default:
							// This shouldn't happen.
							throw new Error("Clapp: internal error." + "Please report this to the bug tracker.");
					}

				case "object":
					// This happens when a flag doesn't have a default value and the user doesn't
					// provide it. In this case we simply return null so we don't break anything.
					// Keep in mind that we're in this case because typeof null === "object"
					return null;
				/* istanbul ignore next */
				default:
					// This shouldn't happen.
					throw new Error("Clapp: internal error. Please report this to the bug tracker.");
			}
		}
	}]);

	return App;
}();

module.exports = {
	App: App,
	Command: Command
};