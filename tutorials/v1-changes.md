# v1.0.0 changes

## Major changes

#### API changes

The API has changed to a more organized one. Previously, the API was quite illogical:

```javascript
// App constructor:
new Clapp.App(options, onReply, commands)

// Command constructor
new Clapp.Command(name, fn, desc, arguments, flags, async)
```

The `App` constructor had the `onReply` and `commands` parameters outside of the options object. 
The `Command` constructor didn't have an options object at all, and instead had many parameters 
in a seemingly arbitrary order. Both constructor have been changed to only take one parameter, 
the options object:

```javascript
// App constructor:
new Clapp.App(options)

// Command constructor
new Clapp.Command(options)
```

Please refer to their respective documentation ({@link App} and {@link Command}) to see what 
options are available.

#### Introduced validations

This version introduces validations, an easy way to sanitize your inputs. Validations are checks 
that are performed on the user input before the command is executed. If any validation isn't 
passed, the command isn't executed and instead Clapp lets the user know about the problem.

For example, if you need a parameter to be an email, you could use a validation:

```javascript
// email argument
var email = {
	name: "email",
	desc: "The user's email",
	type: "string",
	required: true,
	validations: [
		{
			errorMessage: "This argument must be a valid email.",
			validate: function(value) {
				return value.match(/\A[^@]+@[^@]+\z/) ? true : false;
			}
		}
	]
}
```

You can write as many validations you want for the same argument or flag. The only requirement is
 that your validations return a boolean value. For more information, see {@link validation}.

## Minor changes

#### Passing non-cli sentences to parseInput is no longer allowed

Previously you could do `parseInput('blah blah blah')` (assuming that "blah" is not your app's 
prefix). Clapp would log a warning to the console and move on. Now, Clapp will throw an error. 
Make sure to validate all your user input with [isCliSentence]{@link App#isCliSentence} before 
using `parseInput()`.

#### Ditching undefined

Clapp always recommends to set default values for flags. Previously, if you didn't provide a 
default value for a flag, you'd get `undefined`, if the user didn't give a value themselves. Now,
 you'll get `null` instead. While this is a minor change, it could break your code.