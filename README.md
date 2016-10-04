# clapp [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> A tool for building command line apps that aren&#39;t necessarily built for the command line.

## Installation

```sh
$ npm install --save clapp
```

## Features

* Input isn't restricted to node's `process.argv`, unlike other libraries, so you may use Clapp for a node cli app, or use it for anything alse. For instance, you may use it for a [discord bot](https://github.com/hydrabolt/discord.js/), where an user message is the input, and the bot behaves like a command line app.
* Clapp also handles command execution. When using other command parsing libraries, you'd need to manually execute the command function by evaluating the user input. Clapp will execute the command for you if the user input satisfies your needs, or let the user know the error otherwise.
* It also handles documentation. Clapp takes an *"if you don't document it, go fuck yourself"* apporach, meaning that it will simply not work if you don't document your app. For example, if you don't declare an argument that you expect the user to pass, Clapp will ignore it and not pass it back to you. But because of that, Clapp is able to easily print documentation to the user when they pass the `--help` flag.
* Clapp handles the `--version` flag as well.

## Usage

```js
var clapp = require('clapp');

var app = new Clapp.App({
	name: 'Test App',
	desc: 'An app that does the thing',
	prefix: '-testapp',
	version: '1.0'
}, function(msg, context) {
	console.log(msg);
});

app.addCommand(new Clapp.Command(
	'foo', // Command name
	function(argv, context) {
		return 'Foo was executed!';
	},
	'does foo things' // Command description
));

app.parseInput('/app foo');
```

Please check out the [docs][docs] for the full instructions!

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

[docs]: http://mellamopablo.github.io/clapp/latest.html