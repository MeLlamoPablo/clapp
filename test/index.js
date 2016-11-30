/* eslint-disable */

const expect = require('expect.js');
const Clapp  = require('../lib');

describe('Clapp.App', function(){
	it('should create basic apps', function(){
		let app = new Clapp.App({
			name: 'test', desc: 'desc', prefix: '/app', onReply: function() {}
		});
		expect(app).to.be.a(Clapp.App);
	});

	it('should support app versions', function(){
		let app = new Clapp.App({
			name: 'test', desc: 'desc', prefix: '/app', version: '1.0', onReply: function() {}
		});
		expect(app).to.be.a(Clapp.App);
		expect(app.version).to.be('1.0');
	});

	it('should add basic commands', function(){
		let foo = new Clapp.Command({
			name: 'foo',
			fn: function() {}
		});

		let bar = new Clapp.Command({
			name: 'bar',
			fn: function() {}
		});

		let app = new Clapp.App({
			name: 'test', desc: 'desc', prefix: '/app', onReply: function(){}, commands: [foo]
		});

		app.addCommand(bar);

		expect(app).to.be.a(Clapp.App);
		expect(app.commands).to.have.property('foo');
		expect(app.commands).to.have.property('bar');
		expect(app.commands.foo).to.be.a(Clapp.Command);
		expect(app.commands.bar).to.be.a(Clapp.Command);
	});

	it('should support custom separators', function(){
		let executed = false;

		let app = new Clapp.App({
			name: 'test', desc: 'desc', prefix: '/', separator: '',
			onReply: function(){}
		});

		app.addCommand(new Clapp.Command({
			name: 'foo',
			fn: function() {
				executed = true;
			}
		}));

		app.parseInput('/foo');

		expect(executed).to.be.ok();
	});

	describe('#parseInput()', function(){
		it('should execute commands', function(){
			let executed = false;
			let foo = new Clapp.Command({
				name: 'foo',
				fn: function() {
					executed = true;
				}
			});

			let app = new Clapp.App({
				name: 'test', desc: 'desc', prefix: '/app',
				onReply: function() {}, commands: [foo]
			});

			app.parseInput('/app foo');

			expect(executed).to.be.ok();
		});

		it('should pass flags and arguments', function(){
			let passed_argv;

			let foo = new Clapp.Command({
				name: 'foo',
				desc: 'desc',
				fn: function(argv) {
					passed_argv = argv;
				},
				args: [
					{
						name: 'testarg',
						desc: 'A test argument',
						type: 'string',
						required: true
					}
				],
				flags: [
					{
						name: 'testflag',
						desc: 'A test flag',
						alias: 't',
						type: 'boolean',
						default: false
					}
				]
			});

			let app = new Clapp.App({
				name: 'test', desc: 'desc', prefix: '/app',
				onReply: function() {}, commands: [foo]
			});

			app.parseInput('/app foo argument -t');

			expect(passed_argv.args.testarg).to.be('argument');
			expect(passed_argv.flags.testflag).to.be(true);
		});

		it('should recognize aliases', function(){
			let passed_argv;

			let foo = new Clapp.Command({
				name: 'foo',
				desc: 'desc',
				fn: function(argv) {
					passed_argv = argv;
				},
				flags: [
					{
						name: 'testflag',
						desc: 'A test flag',
						alias: 't',
						type: 'boolean',
						default: false
					}
				]
			});

			let app = new Clapp.App({
				name: 'test', desc: 'desc', prefix: '/app', version: '1.2.3',
				onReply: function() {}, commands: [foo]
			});

			app.parseInput('/app foo -t');

			expect(passed_argv.flags.testflag).to.be.ok();
		});

		it('should allow modifications in the context returning messages', function(){
			let c;
			let foo = new Clapp.Command({
				name: 'foo',
				fn: function(argv, context) {
					context.push('b');
					return {
						message: 'return message',
						context: context
					};
				}
			});

			let app = new Clapp.App({
				name: 'test', desc: 'desc', prefix: '/app',
				onReply: function(msg, context) {
					c = context;
				}, commands: [foo]
			});

			app.parseInput('/app foo', ['a']);

			expect(c).to.eql(['a', 'b']);
		});

		it('should allow modifications in the context without returning messages', function(){
			let c;
			let foo = new Clapp.Command({
				name: 'foo',
				fn: function(argv, context) {
					context.push('b');
					return {
						context: context
					};
				}
			});

			let app = new Clapp.App({
				name: 'test', desc: 'desc', prefix: '/app',
				onReply: function(msg, context) {
					c = context;
				}, commands: [foo]
			});

			app.parseInput('/app foo', ['a']);

			expect(c).to.eql(['a', 'b']);
		});

		it('should show app version', function(){
			let version;

			let foo = new Clapp.Command({
				name: 'foo', fn: function() {}
			});

			let app = new Clapp.App({
				name: 'test', desc: 'desc', prefix: '/app', version: '1.2.3',
				onReply: function(msg) {
					version = msg;
				}, commands: [foo]
			});

			app.parseInput('/app --version');

			expect(version).to.be('v1.2.3');
		});

		it('should show app help', function(){
			let help;

			let foo = new Clapp.Command({
				name: 'foo', fn: function() {}
			});

			let app = new Clapp.App({
				name: 'test', desc: 'desc', prefix: '/app', version: '1.2.3',
				onReply: function(msg) {
					help = msg;
				}, commands: [foo]
			});

			app.parseInput('/app --help');

			let help2;

			let app2 = new Clapp.App({
				name: 'test', desc: 'desc', prefix: '/app', version: '1.2.3',
				onReply: function(msg) {
					help2 = msg;
				}, commands: [foo]
			});

			app2.parseInput('/app');

			expect(help).to.be.a('string');
			expect(help2).to.be.a('string');
		});

		it('should show command	 help', function(){
			let help;

			let foo = new Clapp.Command({
				name: 'foo', desc: 'desc', fn: function() {}
			});

			let app = new Clapp.App({
				name: 'test', desc: 'desc', prefix: '/app', version: '1.2.3',
				onReply: function(msg) {
					help = msg;
				}, commands: [foo]
			});

			app.parseInput('/app foo --help');

			expect(help).to.be.a('string');
		});

		it('should pass default values', function(){
			let passed;

			let app = new Clapp.App({
				name: 'testapp', desc: 'desc', prefix: 'p',
				onReply: function(){}
			});

			app.addCommand(new Clapp.Command({
				name: 'foo',
				desc: 'desc',
				fn: function(argv) {
					passed = (argv.args.testarg === "defaultval" && argv.flags.testflag === 123)
				},
				args: [
					{
						name: "testarg",
						type: "string",
						desc: "desc",
						required: false,
						default: "defaultval"
					}
				],
				flags: [
					{
						name: "testflag",
						type: "number",
						desc: "desc",
						default: 123
					}
				]
			}));

			app.parseInput("p foo");

			expect(passed).to.be.ok();
		});

		it('should show errors when options don\'t pass validations', function(){
			let passed;

			let app = new Clapp.App({
				name: 'testapp', desc: 'desc', prefix: 'p',
				onReply: function(msg){
					passed = (msg.includes("firstError") && msg.includes("secondError"));
				}
			});

			app.addCommand(new Clapp.Command({
				name: 'foo',
				desc: 'desc',
				fn: function() {},
				args: [
					{
						name: "testarg",
						type: "string",
						desc: "desc",
						required: false,
						default: "defaultval",
						validations: [
							{
								errorMessage: "firstError",
								validate: () => {
									return false;
								}
							}
						]
					}
				],
				flags: [
					{
						name: "testflag",
						type: "number",
						desc: "desc",
						default: 123,
						validations: [
							{
								errorMessage: "secondError",
								validate: () => {
									return false;
								}
							}
						]
					}
				]
			}));

			app.parseInput("p foo");

			expect(passed).to.be.ok();
		});

		describe('async command handling', function(){

			describe('with Promise', function () {

				it('should execute async commands', function(done){
					let r;
					let foo = new Clapp.Command({
						name: 'foo',
						fn: function(argv, context) {
							return new Promise((fulfill, reject) => {
								setTimeout(function() {
									fulfill('message');
								}, 10);
							});
						}
					});

					let app = new Clapp.App({
						name: 'test', desc: 'desc', prefix: '/app',
						onReply: function(msg) {
							r = msg;
						}, commands: [foo]
					});

					app.parseInput('/app foo');

					setTimeout(function(){
						expect(r).to.be('message');
						done();
					}, 25);
				});

				it('should allow context modifications from async commands', function(done){
					let r, c;
					let foo = new Clapp.Command({
						name: 'foo',
						fn: function(argv, context) {
							return new Promise((fulfill, reject) => {
								setTimeout(function() {
									expect(context).to.be("old context");
									let newContext = "hello world";
									fulfill({
										message: 'message',
										context: newContext
									});
								}, 10);
							});

						}
					});

					let app = new Clapp.App({
						name: 'test', desc: 'desc', prefix: '/app',
						onReply: function(msg, context) {
							r = msg;
							c = context;
						}, commands: [foo]
					});

					app.parseInput('/app foo', "old context");

					setTimeout(function(){
						expect(r).to.be('message');
						expect(c).to.be("hello world");
						done();
					}, 25);
				});

				it('shouldn\'t do anything if the fulfilled value is not string or object with' +
					' string and context', function(done){
					let r = "didntDoAnything";
					let foo = new Clapp.Command({
						name: 'foo',
						fn: function(argv, context) {
							return new Promise((fulfill, reject) => {
								setTimeout(function() {
									fulfill(1234);
								}, 10);
							});
						}
					});

					let app = new Clapp.App({
						name: 'test', desc: 'desc', prefix: '/app',
						onReply: function(msg) {
							r = msg;
						}, commands: [foo]
					});

					app.parseInput('/app foo');

					setTimeout(function(){
						expect(r).to.be("didntDoAnything");
						done();
					}, 25);
				});

				it('should handle rejects', function(done){
					let r;
					let foo = new Clapp.Command({
						name: 'foo',
						fn: function(argv, context) {
							return new Promise((fulfill, reject) => {
								setTimeout(function() {
									reject(new Error("Ignore this plz"));
								}, 10);
							});
						}
					});

					let app = new Clapp.App({
						name: 'test', desc: 'desc', prefix: '/app',
						onReply: function(msg) {
							r = msg;
						}, commands: [foo]
					});

					app.parseInput('/app foo');

					setTimeout(function(){
						expect(r).to.contain("error");
						done();
					}, 25);
				});

			});

			describe('with async attribute (deprecated)', function () {

				it('should execute async commands', function(done){
					let r;
					let foo = new Clapp.Command({
						name: 'foo',
						fn: function(argv, context, cb) {
							setTimeout(function() {
								cb('message');
							}, 10);
						},
						async: true, suppressDeprecationWarnings: true
					});

					let app = new Clapp.App({
						name: 'test', desc: 'desc', prefix: '/app',
						onReply: function(msg) {
							r = msg;
						}, commands: [foo]
					});

					app.parseInput('/app foo');

					setTimeout(function(){
						expect(r).to.be('message');
						done();
					}, 25);
				});

				it('should allow context modifications from async commands', function(done){
					let r, c;
					let foo = new Clapp.Command({
						name: 'foo',
						fn: function(argv, context, cb) {
							setTimeout(function() {
								expect(context).to.be("old context");
								let newContext = "hello world";
								cb('message', newContext);
							}, 10);
						},
						async: true, suppressDeprecationWarnings: true
					});

					let app = new Clapp.App({
						name: 'test', desc: 'desc', prefix: '/app',
						onReply: function(msg, context) {
							r = msg;
							c = context;
						}, commands: [foo]
					});

					app.parseInput('/app foo', "old context");

					setTimeout(function(){
						expect(r).to.be('message');
						expect(c).to.be("hello world");
						done();
					}, 25);
				});

			});

		});

		describe('data types parsing', function(){
			describe('string given', function(){
				it('should work if a string is asked', function(){
					let passed = false;

					let app = new Clapp.App({
						name: 'test', desc: 'desc', prefix: '-app',
						onReply: function(msg){
							passed = (msg === "passed");
						}
					});

					app.addCommand(new Clapp.Command({
						name: 'foo',
						desc: 'desc',
						fn: function(argv) {
							if (typeof argv.args.testarg === "string") {
								return "passed";
							} else {
								return "not passed";
							}
						},
						args: [
							{
								name: 'testarg',
								desc: 'desc',
								type: 'string',
								required: true
							}
						]
					}));

					app.parseInput("-app foo thisisastring");

					expect(passed).to.be(true);
				});

				it('should\'nt work if a number is asked', function() {
					let passed = false;

					let app = new Clapp.App({
						name: 'test', desc: 'desc', prefix: '-app',
						onReply: function(msg){
							passed = msg.includes("Error");
						}
					});

					app.addCommand(new Clapp.Command({
						name: 'foo',
						desc: 'desc',
						fn: function(argv) {
							if (typeof argv.flags.testflag === "boolean") {
								return "passed";
							} else {
								return "not passed";
							}
						},
						args: [
							{
								name: 'testarg',
								desc: 'desc',
								type: 'number',
								required: true
							}
						]
					}));

					app.parseInput("-app foo notanumber");

					expect(passed).to.be(true);
				});

				describe('boolean asked', function(){
					it('should work if the string can be converted to boolean', function(){
						let passed = false;

						let app = new Clapp.App({
							name: 'test', desc: 'desc', prefix: '-app',
							onReply: function(msg){
								passed = (msg === "passed");
							}
						});

						app.addCommand(new Clapp.Command({
							name: 'foo',
							desc: 'desc',
							fn: function(argv) {
								if (
									argv.flags.testflag  === true &&
									argv.flags.testflag2 === false
								) {
									return "passed";
								} else {
									return "not passed";
								}
							},
							flags: [
								{
									name: 'testflag',
									desc: 'desc',
									type: 'boolean',
									default: false
								},
								{
									name: 'testflag2',
									desc: 'desc',
									type: 'boolean',
									default: false
								}
							]
						}));

						app.parseInput("-app foo --testflag=true --testflag2=false");

						expect(passed).to.be(true);
					});

					it('shouldn\'t work if the string can\'t be converted to boolean', function(){
						let passed = false;

						let app = new Clapp.App({
							name: 'test', desc: 'desc', prefix: '-app',
							onReply: function(msg){
								passed = msg.includes("Error");
							}
						});

						app.addCommand(new Clapp.Command({
							name: 'foo',
							desc: 'desc',
							fn: function(argv) {
								if (typeof argv.flags.testflag === "boolean") {
									return "passed";
								} else {
									return "not passed";
								}
							},
							flags: [
								{
									name: 'testflag',
									desc: 'desc',
									type: 'boolean',
									default: false
								}
							]
						}));

						app.parseInput("-app foo --testflag='notaboolean'");

						expect(passed).to.be(true);
					});
				});
			});

			describe('number given', function(){
				it('should work if a string is asked', function(){
					let passed = false;

					let app = new Clapp.App({
						name: 'test', desc: 'desc', prefix: '-app',
						onReply: function(msg){
							passed = (msg === "passed");
						}
					});

					app.addCommand(new Clapp.Command({
						name: 'foo',
						desc: 'desc',
						fn: function(argv) {
							if (typeof argv.args.testarg === "string") {
								return "passed";
							} else {
								return "not passed";
							}
						},
						args: [
							{
								name: 'testarg',
								desc: 'desc',
								type: 'string',
								required: true
							}
						]
					}));

					app.parseInput("-app foo 123");

					expect(passed).to.be(true);
				});

				it('should work if a number is asked', function(){
					let passed = false;

					let app = new Clapp.App({
						name: 'test', desc: 'desc', prefix: '-app',
						onReply: function(msg){
							passed = (msg === "passed");
						}
					});

					app.addCommand(new Clapp.Command({
						name: 'foo',
						desc: 'desc',
						fn: function(argv) {
							if (typeof argv.args.testarg === "number") {
								return "passed";
							} else {
								return "not passed";
							}
						},
						args: [
							{
								name: 'testarg',
								desc: 'desc',
								type: 'number',
								required: true
							}
						]
					}));

					app.parseInput("-app foo 123");

					expect(passed).to.be(true);
				});

				describe('boolean asked', function(){
					it('should work if the number can be converted to boolean', function(){
						let passed = false;

						let app = new Clapp.App({
							name: 'test', desc: 'desc', prefix: '-app',
							onReply: function(msg){
								passed = (msg === "passed");
							}
						});

						app.addCommand(new Clapp.Command({
							name: 'foo',
							desc: 'desc',
							fn: function(argv) {
								if (
									argv.flags.testflag  === true &&
									argv.flags.testflag2 === false
								) {
									return "passed";
								} else {
									return "not passed";
								}
							},
							flags: [
								{
									name: 'testflag',
									desc: 'desc',
									type: 'boolean',
									default: false
								},
								{
									name: 'testflag2',
									desc: 'desc',
									type: 'boolean',
									default: false
								}
							]
						}));

						app.parseInput("-app foo --testflag=1 --testflag2=0");

						expect(passed).to.be(true);
					});

					it('shouldn\'t work if the number can\'t be converted to boolean',
						function(){
						let passed = false;

						let app = new Clapp.App({
							name: 'test', desc: 'desc', prefix: '-app',
							onReply: function(msg){
								passed = (msg.includes("Error"));
							}
						});

						app.addCommand(new Clapp.Command({
							name: 'foo',
							desc: 'desc',
							fn: function(argv) {
								passed = (msg.includes("Error"));
							},
							flags: [
								{
									name: 'testflag',
									desc: 'desc',
									type: 'boolean',
									default: false
								}
							]
						}));

						app.parseInput("-app foo --testflag=1234");

						expect(passed).to.be(true);
					});
				});
			});

			describe('boolean given', function(){
				it('shouldn\'t work if a string is asked', function() {
					let passed = false;

					let app = new Clapp.App({
						name: 'test', desc: 'desc', prefix: '-app',
						onReply: function(msg){
							passed = (msg.includes("Error"));
						}
					});

					app.addCommand(new Clapp.Command({
						name: 'foo',
						desc: 'desc',
						fn: function(argv) {
							if (typeof argv.flags.testflag === "boolean") {
								return "passed";
							} else {
								return "not passed";
							}
						},
						flags: [
							{
								name: 'testflag',
								desc: 'desc',
								type: 'string',
								default: 'defaultval'
							}
						]
					}));

					app.parseInput("-app foo --testflag");

					expect(passed).to.be(true);
				});

				it('shouldn\'t work if a number is asked', function() {
					let passed = false;

					let app = new Clapp.App({
						name: 'test', desc: 'desc', prefix: '-app',
						onReply: function(msg){
							passed = (msg.includes("Error"));
						}
					});

					app.addCommand(new Clapp.Command({
						name: 'foo',
						desc: 'desc',
						fn: function(argv) {
							if (typeof argv.flags.testflag === "boolean") {
								return "passed";
							} else {
								return "not passed";
							}
						},
						flags: [
							{
								name: 'testflag',
								desc: 'desc',
								type: 'number',
								default: 123
							}
						]
					}));

					app.parseInput("-app foo --testflag");

					expect(passed).to.be(true);
				});

				it('should work if a boolean is asked', function(){
					let passed = false;

					let app = new Clapp.App({
						name: 'test', desc: 'desc', prefix: '-app',
						onReply: function(msg){
							passed = (msg === "passed");
						}
					});

					app.addCommand(new Clapp.Command({
						name: 'foo',
						desc: 'desc',
						fn: function(argv) {
							if (typeof argv.flags.testflag === "boolean") {
								return "passed";
							} else {
								return "not passed";
							}
						},
						flags: [
							{
								name: 'testflag',
								desc: 'desc',
								type: 'boolean',
								default: false
							}
						]
					}));

					app.parseInput("-app foo --testflag");

					expect(passed).to.be(true);
				});
			});
		});

		describe('error handling', function(){
			describe('developer error handling', function(){
				it('should throw an error if not given a string', function(){
					let thrown = [];

					try {
						let a = new Clapp.App({
							name: 'testapp', desc: 'desc', prefix: 'p', onReply: function(){}
						});

						a.parseInput(123);
					} catch(e) {
						thrown.push('a');
					}

					try {
						let b = new Clapp.App({
							name: 'testapp', desc: 'desc', prefix: 'p', onReply: function(){}
						});

						b.parseInput([]);
					} catch(e) {
						thrown.push('b');
					}

					try {
						let c = new Clapp.App({
							name: 'testapp', desc: 'desc', prefix: 'p', onReply: function(){}
						});

						c.parseInput({});
					} catch(e) {
						thrown.push('c');
					}

					try {
						let d = new Clapp.App({
							name: 'testapp', desc: 'desc', prefix: 'p', onReply: function(){}
						});

						d.parseInput(null);
					} catch(e) {
						thrown.push('d');
					}

					try {
						let e = new Clapp.App({
							name: 'testapp', desc: 'desc', prefix: 'p', onReply: function(){}
						});

						e.parseInput();
					} catch(e) {
						thrown.push('e');
					}

					expect(thrown).to.eql(['a', 'b', 'c', 'd', 'e']);
				});

				it('should throw an error if not given a CLI sentence', function(){
					let thrown = [];

					try {
						let a = new Clapp.App({
							name: 'testapp', desc: 'desc', prefix: 'p', onReply: function(){}
						});

						a.parseInput("not a cli sentence");
					} catch(e) {
						thrown.push('a');
					}

					expect(thrown).to.eql(['a']);
				});
			});

			describe('user error handling', function(){
				it('should show an error when an unknown command is passed', function(){
					let r;

					let app = new Clapp.App({
						name: 'testapp', desc: 'desc', prefix: 'p',
						onReply: function(msg){
							r = msg;
						}
					});

					app.parseInput("p unknown-command");

					expect(r).to.contain("Error");
				});

				it('should show an error when required arguments aren\'t passed', function(){
					let r;

					let app = new Clapp.App({
						name: 'testapp', desc: 'desc', prefix: 'p',
						onReply: function(msg){
							r = msg;
						}
					});

					app.addCommand(new Clapp.Command({
						name: 'foo',
						fn: function() {},
						args: [
							{
								name: "testarg",
								type: "string",
								desc: "desc",
								required: true
							}
						]
					}));

					app.parseInput("p foo");

					expect(r).to.contain("Error");
				});
			});
		});
	});

	describe('#addCommand()', function(){
		it('should only accept Command types', function(){
			let thrown = [];

			let app = new Clapp.App({
				name: 'test', desc: 'desc', prefix: '/app',
				version: '1.2.3', onReply: function() {}
			});

			try {
				app.addCommand('not a command');
			} catch(e) {
				thrown.push('a');
			}

			try {
				app.addCommand(123);
			} catch(e) {
				thrown.push('b');
			}

			expect(thrown).to.eql(['a', 'b']);
		});

		it('should accept child instances of Command', function(){
			class MyCommand extends Clapp.Command {
				constructor(options) {
					super(options);
				}

				_getHelp(app) {
					return 'The command help for command "' + this.name + '" is overridden! D:'
				}
			}

			let response;

			let app = new Clapp.App({
				name: 'test', desc: 'desc', prefix: '/app',
				onReply: function(msg) {
					response = msg;
				}
			});

			app.addCommand(new MyCommand({
				name: 'foo',
				desc: 'does foo things',
				fn: function() {},
			}));

			app.parseInput("/app foo --help");

			expect(response).to.be("The command help for command \"foo\" is overridden! D:")

		});
	});

	describe('#_getHelp()', function(){
		it('should show app help', function(){
			let response;

			let app = new Clapp.App({
				name: 'test', desc: 'desc', prefix: '/app',
				onReply: function(msg) {
					response = msg;
				}
			});

			app.addCommand(new Clapp.Command({
				name: 'testc',
				desc: 'desc',
				fn: function(){},
			}));

			app.parseInput("/app");

			expect(response).to.contain(app.name);
		});

		it('should show help for child instances of App', function(){
			class MyApp extends Clapp.App {
				constructor(options) {
					super(options);
				}

				_getHelp() {
					return 'The help for the app "' + this.name + '" is overridden! D:';
				}
			}

			let response;

			let app = new MyApp({
				name: 'test', desc: 'desc', prefix: '/app',
				onReply: function(msg) {
					response = msg;
				}
			});

			app.parseInput("/app");

			expect(response).to.be("The help for the app \"test\" is overridden! D:")
		});
	});

	// Exceptions

	it('should throw an Error when given wrong options', function(){
		let thrown = [];

		try {
			new Clapp.App();
		} catch(e) {
			thrown.push('a');
		}

		try {
			new Clapp.App({});
		} catch(e) {
			thrown.push('b');
		}

		try {
			new Clapp.App({
				name: 'testapp'
			});
		} catch(e) {
			thrown.push('c');
		}

		try {
			new Clapp.App({
				name: 'testapp', desc: 'desc'
			});
		} catch(e) {
			thrown.push('d');
		}

		try {
			new Clapp.App({
				name: 'testapp', desc: 'desc', prefix: 'p'
			});
		} catch(e) {
			thrown.push('e');
		}

		try {
			new Clapp.App({
				name: 'testapp', desc: 'desc', prefix: 'p', onReply: function(){},
				commands: 'invalid commands'
			});
		} catch(e) {
			thrown.push('f');
		}

		expect(thrown).to.eql(['a', 'b', 'c', 'd', 'e', 'f']);
	});
});

describe('Clapp.Command', function(){
	it('should create basic commands', function(){
		let foo = new Clapp.Command({
			name: 'foo',
			fn: function() {}
		});

		expect(foo).to.be.a(Clapp.Command);
	});

	it('should create basic commands with arguments', function(){
		let foo = new Clapp.Command({
			name: 'foo',
			desc: 'desc',
			fn: function() {},
			args: [
				{
					name: 'testarg',
					desc: 'A test argument',
					type: 'string',
					required: false,
					default: 'testarg isn\'t defined'
				}
			],
			flags: [
				{
					name: 'testflag',
					desc: 'A test flag',
					alias: 't',
					type: 'boolean',
					default: false
				}
			]
		});

		expect(foo).to.be.a(Clapp.Command);
		expect(foo.args).to.have.property('testarg');
		expect(foo.flags).to.have.property('testflag');
	});

	describe('error handling', function(){
		it('should throw an Error when given wrong options', function(){
			let thrown = [];

			try {
				new Clapp.Command()
			} catch(e) {
				thrown.push('a');
			}

			try {
				new Clapp.Command('foo');
			} catch(e) {
				thrown.push('b');
			}

			try {
				new Clapp.Command('foo', function(){}, {this: 'is not a valid description'});
			} catch(e) {
				thrown.push('c');
			}

			try {
				new Clapp.Command('', function(){}, 'desc');
			} catch(e) {
				thrown.push('d');
			}

			try {
				new Clapp.Command(
					'foo', function(){}, 'desc', 'this is an invalid arg', 'this is an invalid flag'
				);
			} catch(e) {
				thrown.push('e');
			}

			expect(thrown).to.eql(['a', 'b', 'c', 'd', 'e']);
		});

		it('should throw an Error when given an unnamed argument or flag', function(){
			let thrown = [];

			try {
				new Clapp.Command({
					name: 'foo',
					fn: function(){},
					desc: 'desc',
					args: [
						{
							desc: 'A test argument',
							type: 'string',
							required: true
						}
					]
				});
			} catch(e) {
				thrown.push('a');
			}

			try {
				new Clapp.Command({
					name: 'foo',
					fn: function(){},
					desc: 'desc',
					flags: [
						{
							desc: 'A test flag',
							alias: 't',
							type: 'boolean',
							default: false
						}
					]
				});
			} catch(e) {
				thrown.push('b');
			}

			expect(thrown).to.eql(['a', 'b']);
		});

		it('should throw an Error when given an unspecified argument or flag type',
			function(){
			let thrown = [];

			try {
				new Clapp.Command({
					name: 'foo',
					fn: function (){},
					desc: 'desc',
					args: [
						{
							name: 'testarg',
							desc: 'A test argument',
							required: true
						}
					]
				});
			} catch(e) {
				thrown.push('a');
			}

			try {
				new Clapp.Command({
					name: 'foo',
					fn: function (){},
					desc: 'desc',
					flags: [
						{
							name: 'testflag',
							desc: 'A test flag',
							alias: 't',
							default: false
						}
					]
				});
			} catch(e) {
				thrown.push('b');
			}

			expect(thrown).to.eql(['a', 'b']);
		});

		it('should throw an Error when given a flag without a default value', function(){
			let thrown = [];

			try {
				new Clapp.Command({
					name: 'foo',
					fn: function (){},
					desc: 'desc',
					flags: [
						{
							name: 'testflag',
							desc: 'A test flag',
							alias: 't'
						}
					]
				});
			} catch(e) {
				thrown.push('a');
			}

			expect(thrown).to.eql(['a']);
		});

		it('should throw an Error when given an invalid argument or flag type', function(){
			let thrown = [];

			try {
				new Clapp.Command({
					name: 'foo',
					fn: function (){},
					desc: 'desc',
					args: [
						{
							name: 'testarg',
							desc: 'A test argument',
							required: true,
							type: 'NullPointerException'
						}
					]
				});
			} catch(e) {
				thrown.push('a');
			}

			try {
				new Clapp.Command({
					name: 'foo',
					fn: function (){},
					desc: 'desc',
					flags: [
						{
							name: 'testflag',
							desc: 'A test flag',
							alias: 't',
							type: 'meme',
							default: false
						}
					]
				});
			} catch(e) {
				thrown.push('b');
			}

			try {
				new Clapp.Command({
					name: 'foo',
					fn: function (){},
					desc: 'desc',
					flags: [
						{
							name: 'testflag',
							desc: 'A test flag',
							alias: 't',
							type: 'boolean',
							default: false
						}
					]
				});
			} catch(e) {
				thrown.push('c');
			}

			expect(thrown).to.eql(['a', 'b']);
		});

		it('should throw an Error when given an alias with multiple characters', function(){
			let thrown = [];

			try {
				new Clapp.Command({
					name: 'foo',
					fn: function (){},
					desc: 'desc',
					flags: [
						{
							name: 'testflag',
							desc: 'A test flag',
							alias: 'invalidalias',
							type: 'boolean',
							default: false
						}
					]
				});
			} catch(e) {
				thrown.push('a');
			}

			expect(thrown).to.eql(['a']);
		});

		it('should throw an Error when given invalid validations', function(){
			let thrown = [];

			// The validations is not an array

			try {
				new Clapp.Command({
					name: 'foo',
					fn: function (){},
					desc: 'desc',
					flags: [
						{
							name: 'testflag',
							desc: 'A test flag',
							type: 'boolean',
							default: false,
							validations: 'not valid'
						}
					],
				});
			} catch(e) {
				thrown.push('a');
			}

			// The validation is missing a parameter or contains a wrong one

			try {
				new Clapp.Command({
					name: 'foo',
					fn: function (){},
					desc: 'desc',
					flags: [
						{
							name: 'testflag',
							desc: 'A test flag',
							type: 'boolean',
							default: false,
							validations: [
								{
									errorMessage: "error", validate: function(){}
								},
								{
									errorMessage: "error", validate: 12345
								}
							]
						}
					],
				});
			} catch(e) {
				thrown.push('b');
			}

			try {
				new Clapp.Command({
					name: 'foo',
					fn: function (){},
					desc: 'desc',
					flags: [
						{
							name: 'testflag',
							desc: 'A test flag',
							type: 'boolean',
							default: false,
							validations: [
								{
									errorMessage: "error", validate: function(){}
								},
								{
									validate: function(){}
								}
							]
						}
					],
				});
			} catch(e) {
				thrown.push('c');
			}

			// The validate function does not return boolean - try with string...

			try {
				new Clapp.Command({
					name: 'foo',
					fn: function (){},
					desc: 'desc',
					flags: [
						{
							name: 'testflag',
							desc: 'A test flag',
							type: 'string',
							default: 'yo',
							validations: [
								{
									errorMessage: "error", validate: function(){return "invalid"}
								}
							]
						}
					],
				});
			} catch(e) {
				thrown.push('d1');
			}

			// ... with number

			try {
				new Clapp.Command({
					name: 'foo',
					fn: function (){},
					desc: 'desc',
					flags: [
						{
							name: 'testflag',
							desc: 'A test flag',
							type: 'number',
							default: 123,
							validations: [
								{
									errorMessage: "error", validate: function(){return "invalid"}
								}
							]
						}
					],
				});
			} catch(e) {
				thrown.push('d2');
			}

			// ... and with boolean

			try {
				new Clapp.Command({
					name: 'foo',
					fn: function (){},
					desc: 'desc',
					flags: [
						{
							name: 'testflag',
							desc: 'A test flag',
							type: 'boolean',
							default: true,
							validations: [
								{
									errorMessage: "error", validate: function(){return "invalid"}
								}
							]
						}
					],
				});
			} catch(e) {
				thrown.push('d3');
			}

			// Do the same with args instead of flags

			try {
				new Clapp.Command({
					name: 'foo',
					fn: function (){},
					desc: 'desc',
					args: [
						{
							name: 'testflag',
							desc: 'A test flag',
							type: 'number',
							default: 123,
							validations: 'not valid'
						}
					],
				});
			} catch(e) {
				thrown.push('e');
			}

			try {
				new Clapp.Command({
					name: 'foo',
					fn: function (){},
					desc: 'desc',
					args: [
						{
							name: 'testflag',
							desc: 'A test flag',
							type: 'number',
							default: 123,
							validations: [
								{
									errorMessage: "error", validate: function(){}
								},
								{
									errorMessage: "error", validate: 12345
								}
							]
						}
					],
				});
			} catch(e) {
				thrown.push('f');
			}

			try {
				new Clapp.Command({
					name: 'foo',
					fn: function (){},
					desc: 'desc',
					args: [
						{
							name: 'testflag',
							desc: 'A test flag',
							type: 'number',
							default: 123,
							validations: [
								{
									errorMessage: "error", validate: function(){}
								},
								{
									validate: function(){}
								}
							]
						}
					],
				});
			} catch(e) {
				thrown.push('g');
			}

			try {
				new Clapp.Command({
					name: 'foo',
					fn: function (){},
					desc: 'desc',
					args: [
						{
							name: 'testflag',
							desc: 'A test flag',
							type: 'string',
							default: 'yo',
							validations: [
								{
									errorMessage: "error", validate: function(){return "invalid"}
								}
							]
						}
					],
				});
			} catch(e) {
				thrown.push('h1');
			}

			try {
				new Clapp.Command({
					name: 'foo',
					fn: function (){},
					desc: 'desc',
					args: [
						{
							name: 'testflag',
							desc: 'A test flag',
							type: 'number',
							default: 123,
							validations: [
								{
									errorMessage: "error", validate: function(){return "invalid"}
								}
							]
						}
					],
				});
			} catch(e) {
				thrown.push('h2');
			}

			expect(thrown).to.eql(['a', 'b', 'c', 'd1', 'd2', 'd3',
				'e', 'f', 'g', 'h1', 'h2']);
		});
	});
});
