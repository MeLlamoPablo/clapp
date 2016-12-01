"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Argument = require("./Argument"),
    Flag = require("./Flag"),
    Table = require("cli-table2"),
    str = require("./strings/en.js");

/* eslint-disable no-trailing-spaces */
/**
 * A Command that can be bound to an App. A command represents a single function that achieves a
 * single purpose. The command can receive arguments and flags, and can return a string that will be
 * redirected to the app output (See: {@link onReply}).
 *
 * @class  Command
 *
 * @param {object} options
 *
 * @param {string} options.name
 *
 * The command's name. The command will be invoked  by writing the app prefix followed by a
 * space and the command's name.
 *
 * @param {function} options.fn
 *
 * The function that will be executed when the command is invoked. The function receives the
 * following params: {@link argv} and context. For more information, see
 * {@tutorial Defining-the-command-function}.
 *
 * @param {string} options.desc
 *
 * A description of what the command does.
 *
 * @param {Argument[]} [options.args]
 *
 * An array with every argument supported by the command. See {@link Argument}.
 * @param {flag[]} [options.flags]
 *
 * An array with every flag supported by the command. See {@link flag}.
 *
 * @param {boolean} [options.async=false]
 *
 * DEPRECATED since 1.1.0. Use Promises instead, see {@tutorial Defining-the-command-function}.
 * Whether or not the command's function is asynchronous. If it is, it will receive a third
 * parameter: callback, that you will need to call when the process is over. See
 * {@tutorial Defining-the-command-function}.
 *
 * @example
 * var foo = new Clapp.Command({
 * 	name: "foo",
 * 	desc: "does foo things",
 * 	fn: function(argv, context) {
 * 		console.log("foo was executed!");
 * 	},
 * 	args: [
 * 		new Clapp.Argument({
 * 			name: "testarg",
 * 			desc: "A test argument",
 * 			type: "string",
 * 			required: false,
 * 			default: "testarg isn't defined"
 * 		})
 * 	],
 * 	flags: [
 * 		new Clapp.Flag({
 * 			name: "testflag",
 * 			desc: "A test flag",
 * 			alias: 't',
 * 			type: "boolean",
 * 			default: false
 * 		})
 * 	],
 * });
 *
 * app.addCommand(foo);
 */
/* eslint-enable */

var Command = function () {
	function Command(options) {
		_classCallCheck(this, Command);

		if (typeof options.name !== "string" || // name is required
		options.name === "" || typeof options.desc !== "string" || // desc is required
		options.desc === "" || typeof options.fn !== "function" || // fn is required
		options.args && !Array.isArray(options.args) || // args is not required
		options.flags && !Array.isArray(options.flags) || // flags is not required
		options.async && typeof options.async !== "boolean" // async is not required


		) {
				throw new Error("Wrong parameters passed when creating command " + options.name + ". Please refer to the documentation.");
			}

		this.name = options.name;
		this.desc = options.desc;
		this.async = options.async || false;
		this.fn = options.fn;
		this.suppressDeprecationWarnings = options.suppressDeprecationWarnings;

		this.args = {};
		options.args = options.args || [];
		for (var i = 0; i < options.args.length; i++) {

			if (options.args[i] instanceof Argument) {
				this.args[options.args[i].name] = options.args[i];
			} else if (_typeof(options.args[i]) === "object") {
				// Give support to the deprecated API
				this.args[options.args[i].name] = new Argument(options.args[i]);
			} else {
				throw new Error("One of the items in the args array is not an Argument.");
			}
		}

		this.flags = {};
		options.flags = options.flags || [];
		for (var _i = 0; _i < options.flags.length; _i++) {

			if (options.flags[_i] instanceof Flag) {
				this.flags[options.flags[_i].name] = options.flags[_i];
			} else if (_typeof(options.flags[_i]) === "object") {
				// Give support to the deprecated API
				this.flags[options.flags[_i].name] = new Flag(options.flags[_i]);
			} else {
				throw new Error("One of the items in the flags array is not a Flag.");
			}
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