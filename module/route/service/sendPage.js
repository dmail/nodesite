exports.extend = {
	// metas utilisant l'attribut "http-equiv"
	http_equiv: [
		'content-language',
		'content-type',
		'refresh',
		'pragma',
		'expires',
		'cache-control',
		'cache'
	],
	metaTemplate: '<meta {attr}="{name}" content="{value}" />',
	tags: {
		style: '<link href="#" type="text/css" rel="stylesheet" />',
		script: '<script src="#" type="text/javascript"></script>',
		favicon: '<link href="#" type="image/x-icon" rel="shortcut icon"/>'
	},

	sendPage: function(){
		var filePath = root + '/module/route/skeleton.html';
		FS.readFile(filePath, this.parsePage.bind(this));
	},

	parsePage: function(error, html){
		if( error ) return this.error(error);

		var metas = {
			'charset': config.encoding,
			'content-type': 'text/html',
			'content-language': config.lang,
			'description': lang.metas.description,
			'keywords': lang.metas.keywords,
			'robots': config.robot || 'all'
			// viewport: 'width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=1;' // pour les portables
		};

		// si on est en local ceci évite la mise en cache qui est pénible
		if( config.local ){
			metas['cache-control'] = metas['pragma'] = 'no-cache';
			// metas['cache'] = 'no store';
			metas['expires'] = 0;
		}

		var data = {
			'metas': this.parseMetas(metas),
			'title': lang.metas.title,
			'favicon': this.setTagUrl(this.tags.favicon, 'favicon.png'),
			'styles': this.parseStyles(config.css),
			'scripts': this.parseScripts(config.js),
			'lang': JSON.stringify(lang, Function.replacer),
			'config': JSON.stringify({
				'protocol': config.protocol,
				'host': config.host,
				'port': config.port
			})
		};

		html = html.toString(config.encoding);
		html = html.parse(data);

		this.setContentType('text/html');
		// size is different of the filesize because im parsing content
		this.setHeader('content-length', Buffer.byteLength(html, config.encoding));

		this.writeHead(200);
		this.write(html);
		this.end();
	},

	parseStyle: function(name){
		return this.setTagUrl(this.tags.style, 'css/' + name + '.css');
	},

	parseStyles: function(names){
		var output = [];

		names.forEach(function(name){
			output.push(this.parseStyle(name));
		}, this);

		return output.join('\n\t');
	},

	parseScript: function(name){
		return this.setTagUrl(this.tags.script, 'js/' + name + '.js');
	},

	parseScripts: function(names){
		var output = [];

		names.forEach(function(name){
			output.push(this.parseScript(name));
		}, this);

		return output.join('\n\t');
	},

	parseMeta: function(name, value){
		name = name.toLowerCase();
		var attr = 'name', meta;

		if( this.http_equiv.contains(name) ){
			attr = 'http-equiv';
			name = name.capitalize();
		}

		if( name == 'charset' ){
			return '<meta charset="' + value + '" />';
		}

		return this.metaTemplate.parse({
			attr: attr,
			name: name,
			value: value
		});
	},

	parseMetas: function(metas){
		var output = [], name;

		for(name in metas){
			output.push(this.parseMeta(name, metas[name]));
		}

		return output.join('\n\t');
	},

	setTagUrl: function(tag, path){
		var url = require('url').format({
			protocol: config.protocol,
			host: config.host + (config.port ? ':' + config.port : ''),
			pathname: path
		});

		return tag.replace('#', url);
	}
};
