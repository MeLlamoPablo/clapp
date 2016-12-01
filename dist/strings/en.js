"use strict";

module.exports = {

	// Help
	help_usage: "Usage: ",
	help_command: "(command)",
	help_cmd_list: "Here's a list of commands:",
	help_further_help: "To get further help on a command, type: ",
	help_av_args: "Available arguments",
	help_av_options: "Available options",
	help_args_required_optional: "Arguments in (parenthesis) are required, arguments in [brackets]" + " are optional",

	// Errors
	err: "Error: ",

	err_internal_error: "An internal error occurred while trying to execute the command %CMD%.",
	err_unknown_command: "unknown command %CMD%.",
	err_unfulfilled_args: "not every required argument was fulfilled. Missing arguments:",
	err_type_mismatch: "your command couldn't be executed for the following reasons:",
	err_type_help: "Type %PREFIX% --help for help."

};