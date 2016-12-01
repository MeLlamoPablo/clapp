"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* eslint-disable */
/**
 * @class Option
 * @private
 *
 * An Option is a type that can become an Argument or a Flag.
 *
 * @param {object} options
 * @param {string} options.name
 * @param {string} options.desc
 * @param {string} options.type
 */
/* eslint-enable */
var Option = function () {
	function Option(options) {
		_classCallCheck(this, Option);

		if (typeof options.name !== "string") {
			throw new Error("Error: unnamed " + this.constructor.name.toLowerCase() + ". Please refer to the documentation.");
		}
		this.name = options.name;

		if (typeof options.desc !== "string") {
			throw new Error(this._genErrStr("no description provided"));
		}
		this.desc = options.desc;

		if (typeof options.type !== "string") {
			throw new Error(this._genErrStr("no type provided"));
		}
		this.type = options.type;

		/* eslint-disable */
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
   * let email = new Clapp.Argument({
   * 	name: "email",
   * 	desc: "The user's email",
   * 	type: "string",
   * 	required: true,
   * 	validations: [
   * 		{
   * 			errorMessage: "This argument must be a valid email",
   * 			validate: value => {
   * 				return 	!!value.match(/\A[^@]+@[^@]+\z/);
   * 			}
   * 		}
   * 	]
   * });
   *
   * @since 1.0.0
   */
		/* eslint-enable */
		this.validations = options.validations || [];
		for (var i in this.validations) {
			var test = this._testValidation(options.validations[i]);

			if (!test.result) {
				throw new Error(this._genErrStr("one of its validations " + test.reason));
			}
		}
	}

	/**
  * Determines whether or not a validation is correct, meaning that it has an errorMessage
  * and a validate function, and that function returns a boolean value.
  * @param {validation} validation The validation we're evaluating.
  * @return {object} An object containing two properties: (boolean) result and (string) reason.
  *                  reason is undefined in case of success.
  * @private
  */


	_createClass(Option, [{
		key: "_testValidation",
		value: function _testValidation(validation) {
			if (typeof validation.errorMessage !== "string" || typeof validation.validate !== "function") {
				return {
					result: false,
					reason: "is missing one of its parameters"
				};
			}

			// Test the validation to check if it returns a boolean
			var testVal = void 0;
			switch (this.type) {
				case "string":
					testVal = "Clapp is testing your validation. Please don't panic.";
					break;
				case "number":
					testVal = 123456;
					break;
			}

			if (typeof validation.validate(testVal) !== "boolean") {
				return {
					result: false,
					reason: "was tested and it didn't return a boolean value"
				};
			}

			return { result: true };
		}

		/**
   * Generates an error string based on an error message and the instance type (Argument or Flag)
   *
   * @param {string} err The custom error message.
   * @returns {string} The generated error message.
   * @private
   */

	}, {
		key: "_genErrStr",
		value: function _genErrStr(err) {
			return "Error when creating " + this.constructor.name.toLowerCase() + " \"" + this.name + "\": " + err + ". Please refer to the" + " documentation.";
		}
	}]);

	return Option;
}();

module.exports = Option;