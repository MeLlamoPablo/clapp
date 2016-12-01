"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Option = require("./Option");

/* eslint-disable no-trailing-spaces */
/**
 * @class Argument
 *
 * An argument is an option passed to a {@link Command}. In the CLI sentence (See
 * [App.isCliSentence]{@link App#isCliSentence}) `/testapp foo bar`, `bar` would be the
 * value of the first argument.
 *
 * @param {object} options
 *
 * @param {string} options.name
 *
 * The Argument name. This options has two  purposes: to document the command help, and to
 * identify the option in the `argv.args` variable passed back to the command function.
 *
 * @param {string} options.desc
 *
 * A description about what the Argument is and what information the user is expected to
 * supply. It is used to show the command help to the user.
 *
 * @param {string} options.type
 *
 * The Argument data type, either `string` or `number`.
 *
 * @param {boolean} [options.required=false]
 *
 * Whether or not the Argument is required for the command to work. If the user fails to supply
 * every required Argument, Clapp will warn them about the problem and redirect them to the
 * command help.
 *
 * @param {string|number} [options.default]
 *
 * A default value that will be passed into the `argv.args` if the user does not supply a value.
 * This only works if `required` is set to false; it has no effect otherwise. If `required` is
 * set to false (its default value), then `default` is mandatory.
 *
 * @param {validation[]} [options.validations]
 *
 * An array with every validation check that you want to perform on the user provided value. See
 * {@link validation}.
 *
 * @example
 * let arg = new Clapp.Argument({
 * 	name: "file",
 * 	desc: "The file where the data will be saved",
 * 	type: "string",
 * 	required: false,
 * 	default: "defaultfile.dat"
 * });
 */
/* eslint-enable */

var Argument = function (_Option) {
  _inherits(Argument, _Option);

  function Argument(options) {
    _classCallCheck(this, Argument);

    var _this = _possibleConstructorReturn(this, (Argument.__proto__ || Object.getPrototypeOf(Argument)).call(this, options));

    if (_this.type !== "string" && _this.type !== "number") {
      throw new Error(_this._genErrStr("type is not string or number"));
    }

    if (typeof options.required !== "boolean") {
      _this.required = false;
    } else {
      _this.required = options.required;
    }

    if (typeof options.default !== "undefined") {
      _this.default = options.default;
    }

    // If the argument is not required, it must have a default value
    if (!_this.required && typeof _this.default !== "undefined") {
      if (_typeof(_this.default) !== _this.type) {
        throw new Error(_this._genErrStr("its default value doesn't match its data type"));
      }
    } else if (
    // If it doesn't have a default value, then show an error.
    !_this.required && typeof _this.default === "undefined") {
      throw new Error(_this._genErrStr("it's not required, and no default value was" + " provided"));
    }
    return _this;
  }

  return Argument;
}(Option);

module.exports = Argument;