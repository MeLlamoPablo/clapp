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
class Option {
	constructor(options) {
		if (typeof options.name !== "string") {
			throw new Error("Error: unnamed " + this.constructor.name.toLowerCase() +
				". Please refer to the documentation.");
		}
		this.name = options.name;

		if (typeof options.desc !== "string") {
			throw new Error("Error: when creating " + this.constructor.name.toLowerCase() +
				" \"" + this.name + "\": no description provided. Please refer to the" +
				" documentation.");
		}
		this.desc = options.desc;

		if (typeof options.type !== "string") {
			throw new Error("Error: when creating " + this.constructor.name.toLowerCase() +
				" \"" + this.name + "\": no type provided. Please refer to the documentation.");
		}
		this.type = options.type;

		// TODO check validations
	}

	/**
	 * Determines whether or not a validation is correct, meaning that it has an errorMessage
	 * and a validate function, and that function returns a boolean value.
	 * @param {validation} validation The validation we're evaluating.
	 * @return {object} An object containing two properties: (boolean) result and (string) reason.
	 *                  reason is undefined in case of success.
	 * @private
	 */
	static _isValidationCorrect(validation) {
		if (
			typeof validation.errorMessage !== "string" ||
			typeof validation.validate     !== "function"
		) {
			return {
				result: false,
				reason: "is missing one of its parameters"
			};
		}

		// Test the validation to check if it returns a boolean
		let testVal;
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
				reason: "was tested and it didn't return a boolean value."
			};
		}

		return { result: true };
	}
}

module.exports = Option;
