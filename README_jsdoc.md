# clapp [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> A tool for building command line apps that aren&#39;t necessarily built for the command line.

[![Average time to resolve an issue](http://isitmaintained.com/badge/resolution/mellamopablo/clapp.svg)](http://isitmaintained.com/project/mellamopablo/clapp "Average time to resolve an issue") [![Percentage of issues still open](http://isitmaintained.com/badge/open/mellamopablo/clapp.svg)](http://isitmaintained.com/project/mellamopablo/clapp "Percentage of issues still open")
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](http://makeapullrequest.com)

## Installation

```sh
$ npm install --save clapp
```

## Features

* Input isn't restricted to node's `process.argv`, unlike other libraries, so you may use Clapp for
a node cli app, or use it for anything alse. For instance, you may use it for a
[discord bot](https://github.com/MeLlamoPablo/generator-discordbot), where an user message is the
input, and the bot behaves like a command line app.
* Clapp also handles command execution. When using other command parsing libraries, you'd need to
manually execute the command function by evaluating the user input. Clapp will execute the command
for you if the user input satisfies your needs, or let the user know the error otherwise.
* Clapp allows you to have precise control of user input: it takes care of required arguments,
default values, data types, and data validation for you.
* It also handles documentation. Clapp takes an *"if you don't document it, go fuck yourself"*
apporach, meaning that it will simply not work if you don't document your app. For example, if you
don't declare an argument that you expect the user to pass, Clapp will ignore it and not pass it
back to you. But because of that, Clapp is able to easily print documentation to the user when they
pass the `--help` flag.
* Clapp handles the `--version` flag as well.

## Usage

```js
const Clapp = require('clapp');

let app = new Clapp.App({
	name: "Test App",
	desc: "An app that does the thing",
	prefix: "-testapp",
	version: "1.0",
	onReply: function(msg, context) {
		// Clapp will use this function to
		// communicate with the end user
		console.log(msg);
	}
});

app.addCommand(new Clapp.Command({
	name: "foo",
	desc: "An example command",
	fn: function(argv, context) {
		return "Foo was executed!"
	}
}));

let userInput = "-testapp foo";

// Checks if the user input is an acceptable command
if (app.isCliSentence(userInput)) {
	app.parseInput(userInput); // logs "Foo was executed!"
}
```

To get started see the [App reference]{@link App} and [Command reference]{@link Command}.

If you used a previous version of Clapp, please see
[v1.0.0 changes](https://mellamopablo.github.io/clapp/clapp/1.0.0/tutorial-v1-changes.html)
to update your code.

## License

Apache-2.0 © [Pablo Rodríguez](https://github.com/MeLlamoPablo)

[npm-image]: https://badge.fury.io/js/clapp.svg
[npm-url]: https://npmjs.org/package/clapp
[travis-image]: https://travis-ci.org/MeLlamoPablo/clapp.svg?branch=master
[travis-url]: https://travis-ci.org/MeLlamoPablo/clapp
[daviddm-image]: https://david-dm.org/MeLlamoPablo/clapp.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/MeLlamoPablo/clapp
[coveralls-image]: https://coveralls.io/repos/MeLlamoPablo/clapp/badge.svg
[coveralls-url]: https://coveralls.io/r/MeLlamoPablo/clapp
