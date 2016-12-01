"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Option = require("./Option");

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

var Flag = function (_Option) {
  _inherits(Flag, _Option);

  function Flag(options) {
    _classCallCheck(this, Flag);

    var _this = _possibleConstructorReturn(this, (Flag.__proto__ || Object.getPrototypeOf(Flag)).call(this, options));

    if (_this.type !== "string" && _this.type !== "number" && _this.type !== "boolean") {
      throw new Error(_this._genErrStr("type is not string, number or boolean"));
    }

    _this.required = false;

    if (typeof options.alias === "string") {
      if (options.alias.length !== 1) {
        throw new Error(_this._genErrStr("aliases can only be one character long"));
      }

      _this.alias = options.alias;
    }

    if (typeof options.default === "undefined") {
      throw new Error(_this._genErrStr("it does not have a default value"));
    }

    _this.default = options.default;

    if (_typeof(_this.default) !== _this.type) {
      throw new Error(_this._genErrStr("its default value doesn't match its data type"));
    }
    return _this;
  }

  return Flag;
}(Option);

module.exports = Flag;