const expect = require('expect.js');
const Clapp  = require('../lib');

describe('Clapp.App', function(){
	it('should create basic apps', function(){
		var app = new Clapp.App(
			{
				name: 'test', desc: 'desc', prefix: '/app'
			}, function() {}
		);
		expect(app).to.be.a(Clapp.App);
	});

	it('should support app versions', function(){
		var app = new Clapp.App(
			{
				name: 'test', desc: 'desc', prefix: '/app', version: '1.0'
			}, function() {}
		);
		expect(app).to.be.a(Clapp.App);
		expect(app.version).to.be('1.0');
	});

	it('should add basic commands', function(){
		var foo = new Clapp.Command(
			'foo', function() {}
		);

		var bar = new Clapp.Command(
			'bar', function() {}
		);

		var app = new Clapp.App(
			{
				name: 'test', desc: 'desc', prefix: '/app'
			}, function() {}, [foo]
		);

		app.addCommand(bar);

		expect(app).to.be.a(Clapp.App);
		expect(app.commands).to.have.property('foo');
		expect(app.commands).to.have.property('bar');
		expect(app.commands.foo).to.be.a(Clapp.Command);
		expect(app.commands.bar).to.be.a(Clapp.Command);
	});

	describe('#parseString()', function(){
		it('should execute commands', function(){
			var executed = false;
			var foo = new Clapp.Command(
				'foo', function() {
					executed = true;
				}
			);

			var app = new Clapp.App(
				{
					name: 'test', desc: 'desc', prefix: '/app'
				}, function() {}, [foo]
			);

			app.parseInput('/app foo');

			expect(executed).to.be.ok();
		});

		it('should execute async commands', function(done){
			var r;
			var foo = new Clapp.Command(
				'foo', function(argv, context, cb) {
					setTimeout(function() {
						cb('message');
					}, 100);
				}, 'desc', [], [], true
			);

			var app = new Clapp.App(
				{
					name: 'test', desc: 'desc', prefix: '/app'
				}, function(msg) {
					r = msg;
				}, [foo]
			);

			app.parseInput('/app foo');

			setTimeout(function(){
				expect(r).to.be('message');
				done();
			}, 100);
		});

		it('should pass flags and arguments', function(){
			var passed_argv;

			var foo = new Clapp.Command(
				'foo', function(argv) {
					passed_argv = argv;
				}, 'desc',
				[
					{
						name: 'testarg',
						desc: 'A test argument',
						type: 'string',
						required: true
					}
				],
				[
					{
						name: 'testflag',
						desc: 'A test flag',
						alias: 't',
						type: 'boolean',
						default: false
					}
				]
			);

			var app = new Clapp.App(
				{
					name: 'test', desc: 'desc', prefix: '/app'
				}, function() {}, [foo]
			);

			app.parseInput('/app foo argument -t');

			expect(passed_argv.args.testarg).to.be('argument');
			expect(passed_argv.flags.testflag).to.be(true);
		});

		it('should recognize aliases', function(){
			var passed_argv;

			var foo = new Clapp.Command(
				'foo', function(argv) {
					passed_argv = argv;
				}, 'desc', [], [
					{
						name: 'testflag',
						desc: 'A test flag',
						alias: 't',
						type: 'boolean',
						default: false
					}
				]
			);

			var app = new Clapp.App(
				{
					name: 'test', desc: 'desc', prefix: '/app', version: '1.2.3'
				}, function() {}, [foo]
			);

			app.parseInput('/app foo -t');

			expect(passed_argv.flags.testflag).to.be.ok();
		});

		describe('data types parsing', function(){
			describe('string given', function(){
				it('should work if a string is asked', function(){
					var passed = false;

					var app = new Clapp.App({
						name: 'test', desc: 'desc', prefix: '-app'
					}, function(msg){
						passed = (msg === "passed");
					});

					app.addCommand(new Clapp.Command(
						'foo',
						function(argv) {
							if (typeof argv.args.testarg === "string") {
								return "passed";
							} else {
								return "not passed";
							}
						}, 'desc',
						[
							{
								name: 'testarg',
								desc: 'desc',
								type: 'string',
								required: true
							}
						]
					));

					app.parseInput("-app foo thisisastring");

					expect(passed).to.be(true);
				});

				it('should\'nt work if a number is asked', function() {
					var passed = false;

					var app = new Clapp.App({
						name: 'test', desc: 'desc', prefix: '-app'
					}, function(msg){
						passed = msg.includes("Error");
					});

					app.addCommand(new Clapp.Command(
						'foo',
						function(argv) {
							console.log(argv);
							if (typeof argv.flags.testflag === "boolean") {
								return "passed";
							} else {
								return "not passed";
							}
						}, 'desc',
						[
							{
								name: 'testarg',
								desc: 'desc',
								type: 'number',
								required: true
							}
						]
					));

					app.parseInput("-app foo notanumber");

					expect(passed).to.be(true);
				});

				describe('boolean asked', function(){
					it('should work if the string can be converted to boolean', function(){
						var passed = false;

						var app = new Clapp.App({
							name: 'test', desc: 'desc', prefix: '-app'
						}, function(msg){
							passed = (msg === "passed");
						});

						app.addCommand(new Clapp.Command(
							'foo',
							function(argv) {
								if (typeof argv.flags.testflag === "boolean") {
									return "passed";
								} else {
									return "not passed";
								}
							}, 'desc',
							[],
							[
								{
									name: 'testflag',
									desc: 'desc',
									type: 'boolean',
									default: false
								}
							]
						));

						app.parseInput("-app foo --testflag=true");

						expect(passed).to.be(true);
					});

					it('shouldn\'t work if the string can\'t be converted to boolean', function(){
						var passed = false;

						var app = new Clapp.App({
							name: 'test', desc: 'desc', prefix: '-app'
						}, function(msg){
							passed = msg.includes("Error");
						});

						app.addCommand(new Clapp.Command(
							'foo',
							function(argv) {
								console.log(argv);
								if (typeof argv.flags.testflag === "boolean") {
									return "passed";
								} else {
									return "not passed";
								}
							}, 'desc',
							[],
							[
								{
									name: 'testflag',
									desc: 'desc',
									type: 'boolean',
									default: false
								}
							]
						));

						app.parseInput("-app foo --testflag='notaboolean'");

						expect(passed).to.be(true);
					});
				});
			});

			describe('number given', function(){
				it('should work if a string is asked', function(){
					var passed = false;

					var app = new Clapp.App({
						name: 'test', desc: 'desc', prefix: '-app'
					}, function(msg){
						passed = (msg === "passed");
					});

					app.addCommand(new Clapp.Command(
						'foo',
						function(argv) {
							if (typeof argv.args.testarg === "string") {
								return "passed";
							} else {
								return "not passed";
							}
						}, 'desc',
						[
							{
								name: 'testarg',
								desc: 'desc',
								type: 'string',
								required: true
							}
						]
					));

					app.parseInput("-app foo 123");

					expect(passed).to.be(true);
				});

				it('should work if a number is asked', function(){
					var passed = false;

					var app = new Clapp.App({
						name: 'test', desc: 'desc', prefix: '-app'
					}, function(msg){
						passed = (msg === "passed");
					});

					app.addCommand(new Clapp.Command(
						'foo',
						function(argv) {
							if (typeof argv.args.testarg === "number") {
								return "passed";
							} else {
								return "not passed";
							}
						}, 'desc',
						[
							{
								name: 'testarg',
								desc: 'desc',
								type: 'number',
								required: true
							}
						]
					));

					app.parseInput("-app foo 123");

					expect(passed).to.be(true);
				});

				describe('boolean asked', function(){
					it('should work if the number can be converted to boolean', function(){
						var passed = false;

						var app = new Clapp.App({
							name: 'test', desc: 'desc', prefix: '-app'
						}, function(msg){
							passed = (msg === "passed");
						});

						app.addCommand(new Clapp.Command(
							'foo',
							function(argv) {
								if (typeof argv.flags.testflag === "boolean") {
									return "passed";
								} else {
									return "not passed";
								}
							}, 'desc',
							[],
							[
								{
									name: 'testflag',
									desc: 'desc',
									type: 'boolean',
									default: false
								}
							]
						));

						app.parseInput("-app foo --testflag=1");

						expect(passed).to.be(true);
					});

					it('shouldn\'t work if the string can\'t be converted to boolean', function(){
						var passed = false;

						var app = new Clapp.App({
							name: 'test', desc: 'desc', prefix: '-app'
						}, function(msg){
							passed = (msg.includes("Error"));
						});

						app.addCommand(new Clapp.Command(
							'foo',
							function(argv) {
								if (typeof argv.flags.testflag === "boolean") {
									return "passed";
								} else {
									return "not passed";
								}
							}, 'desc',
							[],
							[
								{
									name: 'testflag',
									desc: 'desc',
									type: 'boolean',
									default: false
								}
							]
						));

						app.parseInput("-app foo --testflag=1234");

						expect(passed).to.be(true);
					});
				});
			});

			describe('boolean given', function(){
				it('shouldn\'t work if a string is asked', function() {
					var passed = false;

					var app = new Clapp.App({
						name: 'test', desc: 'desc', prefix: '-app'
					}, function(msg){
						passed = (msg.includes("Error"));
					});

					app.addCommand(new Clapp.Command(
						'foo',
						function(argv) {
							if (typeof argv.flags.testflag === "boolean") {
								return "passed";
							} else {
								return "not passed";
							}
						}, 'desc',
						[],
						[
							{
								name: 'testflag',
								desc: 'desc',
								type: 'string',
								default: 'defaultval'
							}
						]
					));

					app.parseInput("-app foo --testflag");

					expect(passed).to.be(true);
				});

				it('shouldn\'t work if a number is asked', function() {
					var passed = false;

					var app = new Clapp.App({
						name: 'test', desc: 'desc', prefix: '-app'
					}, function(msg){
						passed = (msg.includes("Error"));
					});

					app.addCommand(new Clapp.Command(
						'foo',
						function(argv) {
							if (typeof argv.flags.testflag === "boolean") {
								return "passed";
							} else {
								return "not passed";
							}
						}, 'desc',
						[],
						[
							{
								name: 'testflag',
								desc: 'desc',
								type: 'number',
								default: 123
							}
						]
					));

					app.parseInput("-app foo --testflag");

					expect(passed).to.be(true);
				});

				it('should work if a boolean is asked', function(){
					var passed = false;

					var app = new Clapp.App({
						name: 'test', desc: 'desc', prefix: '-app'
					}, function(msg){
						passed = (msg === "passed");
					});

					app.addCommand(new Clapp.Command(
						'foo',
						function(argv) {
							if (typeof argv.flags.testflag === "boolean") {
								return "passed";
							} else {
								return "not passed";
							}
						}, 'desc',
						[],
						[
							{
								name: 'testflag',
								desc: 'desc',
								type: 'boolean',
								default: false
							}
						]
					));

					app.parseInput("-app foo --testflag");

					expect(passed).to.be(true);
				});
			});
		});

		it('should allow modifications in the context', function(){
			var c;
			var foo = new Clapp.Command(
				'foo', function(argv, context) {
					context.push('b');
					return {
						message: 'return message',
						context: context
					};
				}
			);

			var app = new Clapp.App(
				{
					name: 'test', desc: 'desc', prefix: '/app'
				}, function(msg, context) {
					c = context;
				}, [foo]
			);

			app.parseInput('/app foo', ['a']);

			expect(c).to.eql(['a', 'b']);
		});

		it('should show app version', function(){
			var version;
			var foo = new Clapp.Command(
				'foo', function() {}
			);

			var app = new Clapp.App(
				{
					name: 'test', desc: 'desc', prefix: '/app', version: '1.2.3'
				}, function(msg) {
					version = msg;
				}, [foo]
			);

			app.parseInput('/app --version');

			expect(version).to.be('v1.2.3');
		});

		it('should show app help', function(){
			var help;

			var foo = new Clapp.Command(
				'foo', function() {}
			);

			var app = new Clapp.App(
				{
					name: 'test', desc: 'desc', prefix: '/app', version: '1.2.3'
				}, function(msg) {
					help = msg;
				}, [foo]
			);

			app.parseInput('/app --help');

			var help2;

			var app2 = new Clapp.App(
				{
					name: 'test', desc: 'desc', prefix: '/app', version: '1.2.3'
				}, function(msg) {
					help2 = msg;
				}, [foo]
			);

			app2.parseInput('/app');

			expect(help).to.be.a('string');
			expect(help2).to.be.a('string');
		});

		it('should show command	 help', function(){
			var help;

			var foo = new Clapp.Command(
				'foo', function() {}, 'desc'
			);

			var app = new Clapp.App(
				{
					name: 'test', desc: 'desc', prefix: '/app', version: '1.2.3'
				}, function(msg) {
					help = msg;
				}, [foo]
			);

			app.parseInput('/app foo --help');

			expect(help).to.be.a('string');
		});
	});

	describe('#addCommand()', function(){
		it('should only accept Command types', function(){
			var thrown = [];

			var app = new Clapp.App(
				{
					name: 'test', desc: 'desc', prefix: '/app', version: '1.2.3'
				}, function() {}
			);

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
				constructor(name, fn, desc = '', args = [], flags = []) {
					super(name, fn, desc, args, flags);
				}

				_getHelp(app) {
					return 'The command help for command "' + this.name + '" is overridden! D:'
				}
			}

			var response;

			var app = new Clapp.App(
				{
					name: 'test', desc: 'desc', prefix: '/app'
				}, function(msg) {
					response = msg;
				}
			);

			app.addCommand(new MyCommand(
				'foo',
				function() {},
				'does foo things'
			));

			app.parseInput("/app foo --help");

			expect(response).to.be("The command help for command \"foo\" is overridden! D:")

		});
	});

	describe('#_getHelp()', function(){
		it('should show help for child instances of App', function(){
			class MyApp extends Clapp.App {
				constructor(options, onReply, commands = []) {
					super(options, onReply, commands);
				}

				_getHelp() {
					return 'The help for the app "' + this.name + '" is overridden! D:';
				}
			}

			var response;

			var app = new MyApp(
				{
					name: 'test', desc: 'desc', prefix: '/app'
				}, function(msg) {
					response = msg;
				}
			);

			app.parseInput("/app");

			expect(response).to.be("The help for the app \"test\" is overridden! D:")
		});
	});

	// Exceptions

	it('should throw an Error when given wrong options', function(){
		var thrown = [];

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
				name: 'testapp', desc: 'desc', prefix: 'p'
			}, function(){}, 'invalid commands');
		} catch(e) {
			thrown.push('f');
		}

		expect(thrown).to.eql(['a', 'b', 'c', 'd', 'e', 'f']);
	});
});

describe('Clapp.Command', function(){
	it('should create basic commands', function(){
		var foo = new Clapp.Command(
			'foo', function() {}
		);

		expect(foo).to.be.a(Clapp.Command);
	});

	it('should create basic commands with arguments', function(){
		var foo = new Clapp.Command(
			'foo', function() {}, 'desc',
			[
				{
					name: 'testarg',
					desc: 'A test argument',
					type: 'string',
					required: false,
					default: 'testarg isn\'t defined'
				}
			],
			[
				{
					name: 'testflag',
					desc: 'A test flag',
					alias: 't',
					type: 'boolean',
					default: false
				}
			]
		);

		expect(foo).to.be.a(Clapp.Command);
		expect(foo.args).to.have.property('testarg');
		expect(foo.flags).to.have.property('testflag');
	});

	// Exceptions

	it('should throw an Error when given wrong options', function(){
		var thrown = [];

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

	it('should throw an Error when given an unamed argument or flag', function(){
		var thrown = [];

		try {
			new Clapp.Command('foo', function(){}, 'desc', [
				{
					desc: 'A test argument',
					type: 'string',
					required: true
				}
			]);
		} catch(e) {
			thrown.push('a');
		}

		try {
			new Clapp.Command('foo', function(){}, 'desc', [], [
				{
					desc: 'A test flag',
					alias: 't',
					type: 'boolean',
					default: false
				}
			]);
		} catch(e) {
			thrown.push('b');
		}

		expect(thrown).to.eql(['a', 'b']);
	});

	it('should throw an Error when given an unspecified argument or flag type', function(){
		var thrown = [];

		try {
			new Clapp.Command('foo', function(){}, 'desc', [
				{
					name: 'testarg',
					desc: 'A test argument',
					required: true
				}
			]);
		} catch(e) {
			thrown.push('a');
		}

		try {
			new Clapp.Command('foo', function(){}, 'desc', [], [
				{
					name: 'testflag',
					desc: 'A test flag',
					alias: 't',
					default: false
				}
			]);
		} catch(e) {
			thrown.push('b');
		}

		expect(thrown).to.eql(['a', 'b']);
	});

	it('should throw an Error when given an invalid argument or flag type', function(){
		var thrown = [];

		try {
			new Clapp.Command('foo', function(){}, 'desc', [
				{
					name: 'testarg',
					desc: 'A test argument',
					required: true,
					type: 'NullPointerException'
				}
			]);
		} catch(e) {
			thrown.push('a');
		}

		try {
			new Clapp.Command('foo', function(){}, 'desc', [], [
				{
					name: 'testflag',
					desc: 'A test flag',
					alias: 't',
					type: 'meme',
					default: false
				}
			]);
		} catch(e) {
			thrown.push('b');
		}

		try {
			new Clapp.Command('foo', function(){}, 'desc', [], [
				{
					name: 'testflag',
					desc: 'A test flag',
					alias: 't',
					type: 'boolean',
					default: false
				}
			]);
		} catch(e) {
			thrown.push('c');
		}

		expect(thrown).to.eql(['a', 'b']);
	});

	it('should throw an Error when given an alias with multiple characters', function(){
		var thrown = [];

		try {
			new Clapp.Command('foo', function(){}, 'desc', [], [
				{
					name: 'testflag',
					desc: 'A test flag',
					alias: 'invalidalias',
					type: 'boolean',
					default: false
				}
			]);
		} catch(e) {
			thrown.push('a');
		}

		expect(thrown).to.eql(['a']);
	});
});