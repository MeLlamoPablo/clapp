const Option = require("./Option");

/* eslint-disable no-trailing-spaces */
/**
 * @class Flag
 *
 * A flag is an option passed to a {@link Command}. Unlike arguments, flags are optional by
 * nature, meaning that you can't require the user to pass a flag. Flags always have a full
 * name, and may have aliases (i.e: `--debug` and `-d`). In the CLI sentence (See
 * [App.isCliSentence]{@link App#isCliSentence}) `/testapp foo --bar`, `bar` would be the
 * flag the user passed, and its value would be `true`.
 *
 * @param {object} options
 *
 * @param {string} options.name
 *
 * The Flag name. This options has two  purposes: to document the command help, and to
 * identify the option in the `argv.args` variable passed back to the command function.
 *
 * @param {string} options.desc
 *
 * A description about what the Flag is and what information the user is expected to
 * supply. It is used to show the command help to the user.
 *
 * @param {string} options.type
 *
 * The Flag data type, either `string` or `number`, or `boolean`
 *
 * @param {string|number|boolean} options.default
 *
 * A default value that will be passed into the `argv.args` if the user does not supply a value.
 *
 * @param {string} [options.alias]
 *
 * A string of only one character containing the alias of the flag. If the alias of `limit` is
 * `l`, then `--limit=15` will have the same effect as `-l 15`.
 *
 * @param {boolean} [options.caseSensitive=true]
 *
 * Whether or not the flag is case sensitive. This doesn't affect aliases, which are always case
 * sensitive.
 *
 * @param {validation[]} [options.validations]
 *
 * An array with every validation check that you want to perform on the user provided value. See
 * {@link validation}.
 *
 * @example
 * let flag = new Clapp.Flag({
 * 	name: "limit",
 * 	desc: "The number of items that will be shown. Can\'t be higher than 50",
 * 	type: "number",
 * 	alias: "l",
 * 	default: 10
 * });
 */
/* eslint-enable */

class Flag extends Option {

	constructor(options) {
		super(options);

		if (
			this.type !== "string" &&
			this.type !== "number" &&
			this.type !== "boolean"
		) {
			throw new Error(this._genErrStr("type is not string, number or boolean"));
		}

		this.required = false;

		if (typeof options.alias === "string") {
			if (options.alias.length !== 1) {
				throw new Error(this._genErrStr("aliases can only be one character long"));
			}

			this.alias = options.alias;
		}

		if (typeof options.default === "undefined") {
			throw new Error(this._genErrStr("it does not have a default value"));
		}

		this.default = options.default;

		if (typeof this.default !== this.type) {
			throw new Error(this._genErrStr("its default value doesn't match its data type"));
		}

		if (options.caseSensitive && typeof options.caseSensitive !== "boolean") {
			throw new Error(this._genErrStr("the case sensitive option is not a boolean value"));
		}
		this.caseSensitive = typeof options.caseSensitive === "boolean"
			? options.caseSensitive
			: true;
	}

}

module.exports = Flag;
