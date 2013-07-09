Function.implement = Object.implement.bind(Function);
Function.complement = Object.complement.bind(Function);

Function.EMPTY = function(){ };
Function.TRUE = function(){ return true; };
Function.FALSE = function(){ return false; };
Function.NULL = function(){ return null; };
Function.ZERO = function(){ return 0; };
Function.THIS = function(){ return this; };
Function.RETURN = function(a){ return a; };
Function.IMPLEMENT = function(){ throw new Error('unimplemented'); };

// keep function through JSON format JSON.parse(json, Function.reviver);
Function.reviver = function(key, value){
	return typeof value == 'string' && value.indexOf('(function ') === 0 ? eval(value) : value;
};

// JSON.stringify(object, Function.replacer);
Function.replacer = function(key, value){
	return typeof value == 'function' ? '(' + String(value) + ')' : value;
};

// from http://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically-from-javascript
RegExp.ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
RegExp.COMMA = /,/;
RegExp.ARG = /^\s*(_?)(.+?)\1\s*$/;
RegExp.COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

Function.argumentNames = function(fn){

	var source, declaration, args, i, j, names;

	if( 'argumentNames' in fn ){
		names = fn.argumentNames;
	}
	else{
		names = [];
		source = fn.toString().replace(RegExp.COMMENTS, String.EMPTY);
		declaration = source.match(RegExp.ARGS);

		args = declaration[1];
		if( args ){
			args = args.split(RegExp.COMMA);
			i = 0;
			j = args.length;

			for(;i<j;i++){
				args[i].replace(RegExp.ARG, function(all, underscore, name){
					names.push(name);
				});
			}
		}

		fn.argumentNames = names;
	}

	return names;
};

/*
lets say an object have a method expecting that type of signature:

var a = {
	applyAction: function(action, args, callback, bind)
};

createApplyAlias will create a function allowing to write args with a call signature

a.callAction = Function.createApplyAlias('applyAction', 1);

a.callAction('test', 'arg1', 'arg2', function(){});
<->
a.applyAction('test', ['arg1', 'arg2'], function(){});

*/
Function.createApplyAlias = function(alias, index){

	return function(){
		var args, i, j = arguments.length, realArgs, arg;

		args = Array.slice(arguments, 0, index);

		if( index < j ){
			realArgs = [];
			i = index;
			j = j - 2;
			for(;i<j;i++){
				arg = arguments[i];
				realArgs.push(arg);
			}

			// the two last arguments are special
			// maybe we can found the callback and the bind
			arg = arguments[i];
			if( typeof arg == 'function' ){
				args.push(realArgs, arg, arguments[i+1]);
			}
			else{
				realArgs.push(arg);
				args.push(realArgs, arguments[i+1]);
			}
		}

		return this[alias].apply(this, args);
	};

};

Function.complement({
	// allow to prefill that execution of a function with x arguments
	curry: function(){
		var self = this, args = Array.slice(arguments);
		return function(){
			// if arguments needs to be added, add them after prefilled arguments, else use directly prefilled arguments
			return self.apply(this, arguments.length ? [].concat(args, Array.slice(arguments)) : args);
		};
	},

	overloadGetter: function(usePlural){
		var self = this;
		return function(a){
			var args, result;
			if (typeof a != 'string') args = a;
			else if (arguments.length > 1) args = arguments;
			else if (usePlural) args = [a];
			if (args){
				result = {};
				for (var i = 0; i < args.length; i++) result[args[i]] = self.call(this, args[i]);
			} else {
				result = self.call(this, a);
			}
			return result;
		};
	},

	overloadSetter: function(usePlural){
		var self = this;
		return function(a, b){
			if( a == null ) return this;
			if( usePlural || typeof a != 'string' ){
				for( var k in a ) self.call(this, k, a[k]);
			}
			else{
				self.call(this, a, b);
			}

			return this;
		};
	}
});