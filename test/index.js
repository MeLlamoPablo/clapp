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

		it('should successfully pass flags and arguments', function(){
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
});