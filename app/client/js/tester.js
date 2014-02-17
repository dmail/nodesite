/*

kinda jasmine test

*/

var Test = {
	create: function(description, fn){
		this.description = description;
		this.fn = fn;
	},

	getError: function(){
		var test = this, error = false;

		window.expect = function(a){
			return {
				toBe: function(b){
					if( a !== b ){
						error = test.createExpectError(a, b);
					}
				}
			};
		};

		try{
			this.fn.apply(this, arguments);
		}
		catch(e){
			error = e;
		}

		this.error = error;

		return error;
	},

	createExpectError: function(a, b){
		return new Error(this.description + ': expect ' + b + ' and got ' + a);
	}
};

var TestSuite = {
	create: function(description, fn){
		this.tests = [];
		this.fn = fn;
		this.description = description;
	},

	addTest: function(test){
		this.tests.push(test);
		test.testSuite = this;
	},

	createTest: function(description, fn){
		return Test.new(description, fn);
	},

	collectTests: function(){
		var testSuite = this;

		window.it = function(description, fn){
			testSuite.addTest(testSuite.createTest(description, fn));
		};

		this.fn.apply(this, arguments);
	},

	start: function(){
		this.collectTests.apply(this, arguments);

		var i = 0, j = this.tests.length;

		for(;i<j;i++){
			this.tests[i].getError();
		}

		return this;
	},

	logStatus: function(){
		var i = 0, j = this.tests.length, test, errors = [];

		for(;i<j;i++){
			test = this.tests[i];
			if( test.error ){
				errors.push(test.error);
			}
		}

		if( errors.length ){
			console.error('TEST FAILED:', this.description, errors.length, 'errors', errors);
		}
	}
};

window.testModule = function(fileName, tests){
	var module;

	try{
		module = require(fileName);
	}
	catch(e){
		throw e;
	}

	var testSuite = TestSuite.new(fileName, tests).start(module).logStatus();
};

window.it = function(){
	throw new Error('it called out of TestSuite.collectTests()');
};

window.expect = function(){
	throw new Error('expect called out of Test.getError()');
};