NS.Cookie = {
	name: null,
	path: '/',
	duration: false,
	secure: false,
	encode: true,
	value: null,

	create: function(options){
		if( typeof options == 'string' ){
			this.name = arguments[0];
			this.value = arguments[1];
			options = arguments[2];
		}

		if( typeof options == 'object' ){
			for(var key in options){
				this[key] = options[key];
			}
		}
	},

	toString: function(){
		var output, date;

		output = this.encode ? encodeURIComponent(this.value) : this.value;

		if( this.path ) output+= "; path=" + this.path;
		if( this.duration ){
			date = new Date();
			date.setTime(date.getTime() + this.duration * 24 * 60 * 60 * 1000);
			output+= '; expires=' + date.toUTCString(); // toGMTString maybe?
		}
		else if( this.expires ){
			output+= ', expires=' + this.expires;
		}
		if( this.domain ) output+= "; domain=" + this.domain;
		if( this.secure ) output+= "; secure";
		if( this.httpOnly ) output+= "; httponly";

		return this.name + '=' + output;
	}
};

Object.append(NS.Cookie, {
	cache: {},

	getRegexp: function(){
		var regexp = this.cache[name];

		if( regexp ) return regexp;

		regexp = new RegExp(
			"(?:^|;) *" +
			name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") +
			"=([^;]*)"
		);

		return this.cache[name] = regexp;
	},

	getValue: function(value){
		return value ? decodeURIComponent(value).trim() : null;
	},

	parse: function(source, name){
		var match;

		if( source ){
			match = source.match(this.getRegexp(name));
			return this.getValue(match ? match[1] : null);
		}

		return null;
	},

	parseAll: function(source){
		var cookies = source.split(';'), i = 0, j = cookies.length, pair, map = {};

		for(;i<j;i++){
			pair = cookies[i].split('=');
			map[pair[0].trim()] = this.getValue(pair[1]);
		}

		return map;
	}
});

if( typeof document != 'undefined' ){
	document.setCookie = function(){
		var cookie = NS.Cookie.new.apply(NS.Cookie, arguments).toString();
		document.cookie = cookie;
		return cookie;
	};
	document.removeCookie = function(name){
		var cookie = NS.Cookie.new({name: name, duration: -1});
		return this.setCookie(cookie);
	};
	document.readCookies = function(){
		return NS.Cookie.parseAll(document.cookie);
	};
}