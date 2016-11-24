"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Table = require("cli-table2"),
    str = require("./strings/en.js");

/**
 * A Command that can be bound to an App. A command represents a single function that achieves a
 * single purpose. The command can receive arguments and flags, and can return a string that will be
 * redirected to the app output (See: {@link onReply}).
 *
 * @class  Command
 * @param {object}        options               The command options
 * @param {string}        options.name          The command's name. The command will be invoked
 *                                              by writing the app prefix followed by a space
 *                                              and the command's name.
 * @param {function}      options.fn            The function that will be executed when the command
 *                                              is invoked. The function receives the following
 *                                              params: {@link argv} and context. For more
 *                                              information, see {@tutorial
 *                                              Defining-the-command-function}.
 * @param {string}        [options.desc]        A description of what the command does.
 * @param {argument[]}    [options.args]        An array with every argument supported by the
 *                                              command. See {@link argument}.
 * @param {flag[]}        [options.flags]       An array with every flag supported by the command.
 *                                              See {@link flag}.
 * @param {boolean}       [options.async=false] DEPRECATED since 1.1.0. Use Promises instead, see
 *                                              {@tutorial Defining-the-command-function}.
 *                                              Whether or not the command's function is
 *                                              asynchronous. If it is, it will receive a third
 *                                              parameter: callback, that you will need to call when
 *                                              the process is over. See {@tutorial
 *                                              Defining-the-command-function}.
 *
 * @example
 * var foo = new Clapp.Command({
 * 	name: "foo",
 * 	desc: "does foo things",
 * 	fn: function(argv, context) {
 * 		console.log("foo was executed!");
 * 	},
 * 	args: [
 * 		{
 * 			name: "testarg",
 * 			desc: "A test argument",
 * 			type: "string",
 * 			required: false,
 * 			default: "testarg isn't defined"
 * 		}
 * 	],
 * 	flags: [
 * 		{
 * 			name: "testflag",
 * 			desc: "A test flag",
 * 			alias: 't',
 * 			type: "boolean",
 * 			default: false
 * 		}
 * 	],
 * });
 *
 * app.addCommand(foo);
 */

var Command = function () {
	function Command(options) {
		_classCallCheck(this, Command);

		if (typeof options.name !== "string" || // name is required
		options.name === "" || typeof options.fn !== "function" || // fn is required
		options.desc && typeof options.desc !== "string" || // options is not required
		options.args && !Array.isArray(options.args) || // args is not required
		options.flags && !Array.isArray(options.flags) || // flags is not required
		options.async && typeof options.async !== "boolean" // async is not required


		) {
				throw new Error("Wrong parameters passed when creating command " + options.name + ". Please refer to the documentation.");
			}

		this.name = options.name;
		this.desc = options.desc || null;
		this.async = options.async || false;
		this.fn = options.fn;
		this.suppressDeprecationWarnings = options.suppressDeprecationWarnings;

		/**
   * @typedef {Object} argument
   *
   * An argument is an option passed to the command. In the CLI sentence (See
   * [App.isCliSentence]{@link App#isCliSentence}) `/testapp foo bar`, `bar` would be the
   * value of the first argument.
   *
   * @property {string}  name               The argument name. This options has two
   *                                        purposes: to document the command help, and to
   *                                        identify the option in the `argv.args` variable
   *                                        passed back to the command function.
   * @property {string}  [desc]             A description about what the argument is and
   *                                        what information the user is expected to supply.
   *                                        It is used to show the command help to the user.
   * @property {string}  type               The argument data type, either `string` or
   *                                        `number`.
   * @property {boolean} [required=false]   Whether or not the argument is required for the
   *                                        command to work. If the user fails to supply every
   *                                        required argument, Clapp will warn them about the
   *                                        problem and redirect them to the command help.
   * @property {string|number} [default]    A default value that will be passed into the
   *                                        `argv.args` if the user does not supply a value.
   *                                        This only works if `required` is set to false;
   *                                        it has no effect otherwise. One of `required` or
   *                                        `default` must be supplied. Not supplying either
   *                                        would result in an error.
   * @property {validation[]} [validations] An array with every validation check that you
   *                                        want to perform on the user provided value. See
   *                                        {@link validation}.
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
		options.args = options.args || [];
		for (var i = 0; i < options.args.length; i++) {
			if (typeof options.args[i].name !== "string") {
				throw new Error("Error creating command " + options.name + ": unnamed argument. Please refer to the documentation.");
			}

			if (typeof options.args[i].type !== "string") {
				throw new Error("Error creating command " + options.name + ": unspecified argument type. Please refer to the documentation.");
			}

			if (options.args[i].type !== "string" && options.args[i].type !== "number") {
				throw new Error("Error creating command " + options.name + ": argument types can only be string or number. Please refer to the" + " documentation.");
			}

			/**
    * @typedef {object} validation
    *
    * A validation is a single check that you want to perform on an user provided value
    * before executing your command. If the validation isn't passed, the command won't
    * be executed at all, and the user will receive an error informing them about the
    * problem.
    *
    * @property {string} errorMessage
    *
    * A string with the error message shown to the user in case the validation isn't
    * passed.
    *
    * @property {function} validate
    *
    * The validation function, which follows these rules:
    * - It receives a single parameter: the user provided value.
    * - It needs to return true if the validation is passed, or false if it isn't. Any
    * other return value will result in an exception.
    * - Clapp tests your validations when you construct the command, so don't panic if you
    * see an unexpected `console.log` or something similar.
    * - Validations cannot be asynchronous. Any asynchronous operation needs to be
    * inside your command's fn.
    * - No validation will be performed if the user input doesn't match the required
    * data type.
    * - Trivia: your default values also get validated, because they get treated as
    * user input. This isn't really useful, but watch out, because if you mistakenly
    * set a wrong default value you might break your app.
    *
    * @example
    * var myValidation = {
    * 	errorMessage: "The number must be between 1 and 100!",
    * 	validate: function (value) {
    * 		return value >= 1 && value <= 100;
    * 	}
    * };
    *
    * @since 1.0.0
    */
			var validations = options.args[i].validations || [];
			if (!Array.isArray(validations)) {
				throw new Error("Error creating command " + options.name + ": validations must be " + "in an array.");
			}

			for (var j = 0; j < validations.length; j++) {
				if (typeof validations[j].errorMessage !== "string" || typeof validations[j].validate !== "function") {
					throw new Error("Error creating command " + options.name + ": a provided" + " validation is missing one of their parameters. Please refer to the" + " documentation.");
				}

				// Test the validation to check if it returns a boolean
				var testVal = void 0;
				switch (options.args[i].type) {
					case "string":
						testVal = "Clapp is testing your validation. Please don't panic.";
						break;
					case "number":
						testVal = 123456;
						break;
				}

				if (typeof validations[j].validate(testVal) !== "boolean") {
					throw new Error("Error creating command " + options.name + ": one of your" + " validations was tested, but it didn't return a boolean value.");
				}
			}

			this.args[options.args[i].name] = {
				required: typeof options.args[i].required === "boolean" ? options.args[i].required : false,
				desc: typeof options.args[i].desc === "undefined" ? undefined : options.args[i].desc,
				type: options.args[i].type,
				validations: validations
			};

			// If the argument is not required, it must have a default value
			if (!this.args[options.args[i].name].required && typeof options.args[i].default !== "undefined") {
				if (_typeof(options.args[i].default) !== options.args[i].type) {
					throw new Error("Error creating command " + options.name + ": argument default value for argument " + options.args[i].name + " does not match its data type. Please refer to the documentation.");
				}

				this.args[options.args[i].name].default = options.args[i].default;
			} else if (
			// If it doesn't have a default value, then show an error.
			!this.args[options.args[i].name].required && typeof options.args[i].default === "undefined") {
				throw new Error("Error creating command " + options.name + ": argument " + options.args[i].name + " is not required, but no default" + " value was provided. Please refer to the documentation.");
			}
		}

		/**
   * @typedef {object} flag
   *
   * A flag is an option passed to the command. Unlike arguments, flags are optional by
   * nature, meaning that you can't require the user to pass a flag. Flags always have a full
   * name, and may have aliases (i.e: `--debug` and `-d`). In the CLI sentence (See
   * [App.isCliSentence]{@link App#isCliSentence}) `/testapp foo --bar`, `bar` would be the
   * flag the user passed, and its value would be `true`.
   *
   * @property {string}                name      The flag name. This options has two
   *                                             purposes: to document the command help,
   *                                             and to identify the option in the
   *                                             `argv.flags` variable passed back to the
   *                                             command function.
   * @property {string}                type      The flag data type, either `string`,
   *                                             `number` or `boolean`.
   * @property {string|number|boolean} default   A default value that will be passed into the
   *                                             `argv.flags` if the user does not supply a
   *                                             value.
   * @property {string}                [desc]    A description about what the flag is and
   *                                             what information the user is expected to
   *                                             supply. It is used to show the command
   *                                             help to the user.
   * @property {string}                [alias]   A string of only one character containing
   *                                             the alias of the flag. If the alias of
   *                                             `limit` is `l`, then `--limit=15` will
   *                                             have the same effect as `-l 15`.
   * @property {validation[]}      [validations] An array with every validation check that you
   *                                             want to perform on the user provided
   *                                             value. See {@link validation}.
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
		options.flags = options.flags || [];
		for (var _i = 0; _i < options.flags.length; _i++) {
			if (typeof options.flags[_i].name !== "string") {
				throw new Error("Error creating command " + options.name + ": unnamed flag. Please refer to the documentation.");
			}

			if (typeof options.flags[_i].type !== "string") {
				throw new Error("Error creating command " + options.name + ": unspecified flag type. Please refer to the documentation.");
			}

			if (options.flags[_i].type !== "boolean" && options.flags[_i].type !== "string" && options.flags[_i].type !== "number") {
				throw new Error("Error creating command " + options.name + ": flag types can only be boolean, string or number. Please refer to the" + " documentation.");
			}

			if (typeof options.flags[_i].alias === "string" && options.flags[_i].alias.length !== 1) {
				throw new Error("Error creating command " + options.name + ": aliases can only be one character long.");
			}

			if (typeof options.flags[_i].default === "undefined") {
				throw new Error("Error creating command " + options.name + ": flag " + options.flags[_i].name + " does not have a default value. Please" + " refer to the documentation.");
			}

			if (typeof options.flags[_i].default !== "undefined" && _typeof(options.flags[_i].default) !== options.flags[_i].type) {
				throw new Error("Error creating command " + options.name + ": flag default value for flag " + options.flags[_i].name + " does not" + " match its data type. Please refer to the documentation.");
			}

			var _validations = options.flags[_i].validations || [];
			if (!Array.isArray(_validations)) {
				throw new Error("Error creating command " + options.name + ": validations must" + " be in an array.");
			}

			for (var _j = 0; _j < _validations.length; _j++) {
				if (typeof _validations[_j].errorMessage !== "string" || typeof _validations[_j].validate !== "function") {
					throw new Error("Error creating command " + options.name + ": a provided" + " validation is missing one of their parameters. Please refer to the" + " documentation.");
				}

				// Test the validation to check if it returns a boolean
				var _testVal = void 0;
				switch (options.flags[_i].type) {
					case "string":
						_testVal = "Clapp is testing your validation. Please don't panic.";
						break;
					case "number":
						_testVal = 123456;
						break;
					case "boolean":
						// does it really make sense to validate a boolean though?
						_testVal = true;
				}

				if (typeof _validations[_j].validate(_testVal) !== "boolean") {
					throw new Error("Error creating command " + options.name + ": one of your" + " validations was tested, but it didn't return a boolean value.");
				}
			}

			this.flags[options.flags[_i].name] = {
				type: options.flags[_i].type,
				alias: options.flags[_i].alias || null,
				default: typeof options.flags[_i].default === "undefined" ? null : options.flags[_i].default,
				desc: options.flags[_i].desc || null,
				validations: _validations
			};
		}
	}

	/**
  * Returns the command specific help
  *
  * @param {App} app We need it to access the parent app info.
  * @return {string} The command help
  * @private
  */


	_createClass(Command, [{
		key: "_getHelp",
		value: function _getHelp(app) {
			var LINE_WIDTH = 100;

			var r = str.help_usage + " " + app.prefix + " " + this.name;
			var args_table = void 0;

			// Add every argument to the usage (Only if there are arguments)
			if (Object.keys(this.args).length > 0) {
				args_table = new Table({
					chars: {
						"top": "", "top-mid": "", "top-left": "", "top-right": "", "bottom": "",
						"bottom-mid": "", "bottom-left": "", "bottom-right": "", "left": "",
						"left-mid": "", "mid": "", "mid-mid": "", "right": "", "right-mid": "",
						"middle": ""
					},
					head: ["Argument", "Description", "Default"],
					colWidths: [0.20 * LINE_WIDTH, 0.35 * LINE_WIDTH, 0.25 * LINE_WIDTH],
					wordWrap: true
				});
				for (var i in this.args) {
					r += this.args[i].required ? " (" + i + ")" : " [" + i + "]";
					args_table.push([i, typeof this.args[i].desc !== "undefined" ? this.args[i].desc : "", typeof this.args[i].default !== "undefined" ? this.args[i].default : ""]);
				}
			}

			r += "\n" + this.desc;

			if (Object.keys(this.args).length > 0) {
				r += "\n\n" + str.help_av_args + ":\n\n" + args_table.toString();
			}

			// Add every flag, only if there are flags to add
			if (Object.keys(this.flags).length > 0) {
				var flags_table = new Table({
					chars: {
						"top": "", "top-mid": "", "top-left": "", "top-right": "", "bottom": "",
						"bottom-mid": "", "bottom-left": "", "bottom-right": "", "left": "",
						"left-mid": "", "mid": "", "mid-mid": "", "right": "", "right-mid": "",
						"middle": ""
					},
					head: ["Option", "Description", "Default"],
					colWidths: [0.20 * LINE_WIDTH, 0.35 * LINE_WIDTH, 0.25 * LINE_WIDTH],
					wordWrap: true
				});
				for (var _i2 in this.flags) {
					flags_table.push([(typeof this.flags[_i2].alias !== "undefined" ? "-" + this.flags[_i2].alias + ", " : "") + "--" + _i2, typeof this.flags[_i2].desc !== "undefined" ? this.flags[_i2].desc : "", typeof this.flags[_i2].default !== "undefined" ? this.flags[_i2].default : ""]);
				}

				r += "\n\n" + str.help_av_options + ":\n\n" + flags_table.toString();
			}

			if (Object.keys(this.args).length > 0) {
				r += "\n\n" + str.help_args_required_optional;
			}

			return r;
		}
	}]);

	return Command;
}();

module.exports = Command;