// lorsqu'on crée un noeud depuis un objet File on récupère que name, pas type ou lastmodifieddateFile.prototype.toTreenode = function(){	return {		name: this.name,		// si file.type est null c'est un dossier		type: this.type || this.type == '' || this.type == 'dir' ? 'dir' : 'file',		file: this	};};var FileTreenode = new Class({	Extends: Treenode,		calcExtension: function(){		return Path.extname(this.name).substr(1);	},		calcProto: function(){		var proto, name, extension;				proto = Tree.plugins.types.node.calcProto.call(this);		name = this.properties.name || proto.name || this.getDefault('name');		extension;				if( name ){			this.name = name;			extension = this.calcExtension();			if( extension ) Object.append(proto, this.tree.getExtensionProperties(extension));		}					return proto;	},		encodePropertyValue: function(name, value){		var schema = this.tree.schemas[name];						if( schema && value != null ){			if( schema.type ){				if( schema.type == "string" ){					value = String(value);					if( schema.singleSpace === true ) value = value.singleSpace();					if( schema.trim === true ) value = value.trim();					if( schema.toUpperCase === true ) value = value.toUpperCase();					else if( schema.toLowerCase === true ) value = value.toLowerCase();				}			}		}				return value;	},		// retourne le chemin où se trouve le noeud sous la forme nomdugrandparent/nomduparent/nomdunoeud	getPath: function(){		var node = this, path = [];				while( !node.isRoot ){			path.unshift(node.name);			node = node.parentNode;		}				return path.join('/');	},		isFile: function(){		return this.type == 'file';	},		calcExtension: function(){		// seul les extensions de fichier sont prises en compte		if( this.isFile() ){			// this.constructor.prototype.updateExtension.call(this);			Tree.plugins.extension.node.calcExtension.call(this);		}	},		toJSON: function(){		var json = {};				// on envoit au serveur uniquement name, type, content, children et encoding, le reste est inutile		json.name = this.name;		json.type = this.type;		if( this.children.length ) json.children = this.children;		if( this.has('content') ){			json.content = this.get('content');			json.encoding = this.get('encoding');		}		if( this.has('mode') ) json.mode = this.get('mode');				return json;	},				// copie dans le même parent: on utilise immédiatement un nom libre	prepareCopy: function(into, index){		var copy = this.clone(true);				if( this.parentNode == into ){			copy.setProperty('name', this.parentNode.getFree('name', this.name + ' - Copie'));		}				return copy;	}});var FileTree = new Class({	Extends: Tree,	nodeConstructor: FileTreenode,	schemas: {		encoding: {			'default': 'binary'		},		type: {			'default': 'dir'		},		size: {			'get': function(){				return this.has('content') ? this.get('content').length : 0;			}		},		name: {			type: 'string',			notnull: true,			unique: true,			// TODO caseSensitive: false,			nextFree: function(value, i){ return value + ' (' + (i + 2) + ')'; },			// un fichier ne peut pas avoir un nom > 255 caractères			max: 255,			// ne peut pas contenir certains caractères spéciaux: /\\:*?<>|"			regexp: new RegExp('^[^' + '/\\:*?<>|"'.escapeRegExp() + ']*?$'),			trim: true,			singleSpace: true		}	},		actions: {		update: {			arguments: function(key, value){				var args = toArray(arguments);				args[1] = this.encodePropertyValue(key, value);				return Tree.prototype.actions.update.arguments.apply(this, args);			},						prevent: function(key, value){				var schema = this.tree.schemas[key];								if( schema ){					if( schema.notnull && value == null ) return true;					if( schema.regexp && !value.match(schema.regexp) ) return true;					if( schema.max && value > schema.max ) return true;				}								return Tree.prototype.actions.update.prevent.call(this, key, value);			}		}	},		types: {		file: {			nounzip: true,			noexpand: true,			nocontract: true,			nolist: true,			noinsert: true,			nosort: true,			img: 'file.png'		},		dir: {			nounzip: true,			noactive: true,			img: 'dir.png'		}	},		extensions: {		img: {			img: 'img.png',			group: 'img'		},		jpg: {			img: 'img.png',			group: 'img'		},		jpeg: {			img: 'img.png',			group: 'img'		},		png: {			img: 'png.png',			group: 'img'		},		gif: {			img: 'gif.png',			group: 'img'		},		txt: {			encoding: 'utf8'		},		js: {			encoding: 'utf8'		},		php: {			encoding: 'utf8'		},		json: {			encoding: 'utf8'		},		xml: {			encoding: 'utf8'		},		php: {			encoding: 'utf8'		},		zip: {			nounzip: false		},		mp3: {					},		wav: {					},		midi: {					}	},		constructor: function(path, callback){		Tree.prototype.constructor.call(this);				// 'dropfile', 'clipboard', 'menu', 'selectionRectangle', 'drag'		if( path ) this.loadPath(path, callback);	},		loadPath: function(path, callback){		server.callAction('filesystem/fileinfo', path, function(error, fileinfo){			if( error ) throw error;			fileinfo.name = path;			this.root.adopt(this.createNode(fileinfo));			if( callback ) callback.call(this);		}.bind(this));	},		// les autres fichiers ne sont pas considéré comme des noeud externes à cet arbre	isExternal: function(node){		return node.tree != this && !(node.tree instanceof FileTree);	},		getExtensionProperties: function(extension){		return this.extensions[extension];	}});// FileTree.prototype.plugins = Tree.prototype.plugins.concat('types', 'extension', 'ajax', 'unique', 'list', 'file');FileTree.prototype.removeDefinition('remove', 'reverse');FileTree.prototype.define('obtain', 'serverResponseHandler', function(response, args){	Array.prototype.splice.call(args, 1, 0, response);});FileTree.prototype.define('read', 'arguments', function(){	var encoding = args[0], callback = args[1];					if( typeof encoding == 'string' ) this.setProperty('encoding', encoding);	if( typeof callback != 'function' ) callback = typeof encoding == 'function' ? encoding : Function.EMPTY;		args[0] = this.get('encoding');	args[1] = callback;});FileTree.prototype.define('write', 'arguments', function(content, encoding, callback){	if( typeof encoding == 'string' ) this.setProperty('encoding', encoding);	if( typeof callback != 'function' ) callback = typeof encoding == 'function' ? encoding : Function.EMPTY;		return [content, this.get('encoding'), callback];});FileTree.prototype.on('read', function(node, content, encoding, callback){	callback.call(node, content, encoding);});// extension lorsqu'on change le nom change le protoFileTree.prototype.on('change:name', function(node){ node.updateProto(); });FileTree.prototype.setPropertyAction('content', 'obtain', 'read');FileTree.prototype.setPropertyAction('content', 'update', 'write');// toServerObject.eachPair({	// actions de bases	remove: function(){ return ['remove', this.getPath()]; },	insert: function(node, index){ return ['insert', this.getPath(), node]; },	copy: function(into, index, copy){ return ['copy', this.getPath(), into.getPath() + '/' + copy.name]; },	move: function(into){		// déplacement au sein du même dossier en local		if( this.parentNode != into ) return ['move', this.getPath(), into.getPath() + '/' + this.name];	},	// action de lecture d'une propriété (list, read)	obtain: function(property, callback){		if( this.hasProperty(property) ){			callback.call(this, this.getProperty(key));		}		else{			var action = this.tree.getPropertyAction(property, 'obtain');			if( action ) return this.tree.applyDefinition(action, 'toServer', this, toArray(arguments, 1));		}	},			// action d'écriture d'une propriété (rename, write)	update: function(property, value){		var action = this.tree.getPropertyAction(property, 'update');		if( action ) return this.tree.applyDefinition(action, 'toServer', this, toArray(arguments, 1));	},	// lecture	list: function(){ return ['list', this.getPath()]; },	read: function(encoding){ return ['read', this.getPath(), encoding]; },	// écriture	rename: function(name){ return ['rename', this.getPath(), name]; },	write: function(content, encoding){ return ['write', this.getPath(), content, encoding]; }}, function(key, value){	FileTree.prototype.define(key, 'toServer', value);});