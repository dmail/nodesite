var filePartDirectory = '../filePartManager';
var JSONFilePartManager = require(filePartDirectory + '/jsonFilePartManager.js');
var Record = require('./record.js');

var RecordManager = JSONFilePartManager.extend({
	name: null,
	partConstructor: Record,

	noop: function(callback, bind){
		return this.reply(callback, bind, null, 0);
	},

	notfound: function(callback, bind, selector){
		return this.reply(callback, bind, new Error('record not found for ' + selector));
	},

	compare: function(key, a, b){
		return a === b;
	},

	updatePart: function(part, fields, callback, bind){
		var item = part.item, key, changed, oldValue, value;

		changed = false;
		for(key in fields){
			oldValue = item[key];
			value = fields[key];

			if( this.compare(key, oldValue, value) ) continue;
			
			//this.emit('change', key, oldValue, value);
			item[key] = value;
			changed = true;
		}

		if( changed ){
			var newPart = this.newPart(item);
			this.replacePart(part, newPart, function(error){
				if( error ){
					this.reply(callback, bind, error);
				}
				else{
					this.reply(callback, bind, null, item);
				}
			});
		}
		else{
			this.reply(callback, bind, item);
		}
	},

	findPart: function(selector){
		var parts = this.parts, i = 0, j = parts.length, part, found = null;
		var filter = NS.Filter.toFilter(selector);

		for(;i<j;i++){
			part = parts[i];
			if( filter.call(this, part.item, i, part) === true ){
				found = part.item;
				break;
			}
		}

		return found;
	},

	callWhenReady: function(fn){
		//call fn when this file is ready (opened and readed)

		function callback(error){
			if( error ){
				fn.call(this, error);
			}
			else{
				this.callWhenReady(fn);
			}
		}

		if( this.state == 'closed' ){
			this.open(callback);
		}
		else if( this.state == 'opening' ){
			this.once('open', callback);			
		}
		else if( this.state == 'opened' ){
			this.read(callback);
		}
		else if( this.state == 'reading' ){
			this.once('read', callback);			
		}
		else if( this.state == 'readed' ){
			process.nextTick(fn.bind(this));
		}
		else if( this.state == 'writing' ){
			this.once('write', callback);
		}
		else if( this.state == 'closing' ){
			this.once('close', callback);
		}
	},

	find: function(selector, callback, bind){
		this.callWhenReady(function(error){
			if( error ){
				this.reply(callback, bind, error);
			}
			else{
				this.reply(callback, bind, null, this.findPart(selector));
			}
		});
	},

	insert: function(fields, callback, bind){
		this.callWhenReady(function(error){
			if( error ){
				this.reply(callback, bind, error);
			}
			else{
				this.appendPart(this.newPart(fields), function(error, part){
					if( error ){
						this.reply(callback, bind, error);
					}
					else{
						this.reply(callback, bind, null, part.item);
					}					
				});
			}
		});
	},

	update: function(selector, fields, callback, bind){
		this.find(selector, function(error, part){
			if( error ){
				this.reply(callback, bind, error);
			}
			else if( part ){
				this.updatePart(part, callback, bind);
			}
			else{
				this.notfound(selector, callback, bind);
			}
		});
	},

	remove: function(selector, callback, bind){
		this.find(selector, function(error, part){
			if( error ){
				this.reply(callback, bind, error);
			}
			else if( part ){
				this.removePart(part, function(error, part){
					if( error ){
						this.reply(callback, bind, error);
					}
					else{
						this.reply(callback, bind, null, part.item);
					}
				});
			}
			else{
				this.notfound(selector, callback, bind);
			}
		});
	},

	findAll: function(selector, callback, bind){

	},

	updateAll: function(selector, fields, callback, bind){

	},

	removeAll: function(selector, callback, bind){

	},

	drop: JSONFilePartManager.unlink
});

module.exports = RecordManager;