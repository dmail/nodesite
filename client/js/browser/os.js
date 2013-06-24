(function(ua, hostname){

	var os = NS.os = {};
	var platform;

	if( ua.match(/ip(?:ad|od|hone)/) ){
		platform  = 'ios';
	}
	else{
		platform = ua.match(/(?:webos|android)/) || ua.match(/mac|win|linux/);

		if( platform ){
			platform = platform[0];
		}
		else{
			platform = 'other';
		}
	}

	os.hostname = hostname;
	os.platform = platform;
	os[platform] = true;

})(navigator.userAgent.toLowerCase(), navigator.platform.toLowerCase());

