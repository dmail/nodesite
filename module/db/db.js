/* global Finder */

/*

MORE

NOTE
- lorsqu'on populate les référence, l'objet qu'on référence peut lui même avoir des référence, on peut alors les populates elles aussi
dans ce cas, on doit détecter les référence circulaire pour ne pas populate en boucle

TODO

*/

var DB = {
	schemas: require('./schemas.js'),
	TableConstructor: require('./DBTable'),
	dirPath: './',
	tables: {},

	start: function(){
		var table, tables = this.tables, rules, key;

		for(table in this.schemas){
			this.getTable(table);
		}

		/*for(table in tables){
			table = tables[table];
			if( table.hasRule() ){
				rules = table.getRule();
				for(key in rules){
					if( table.hasRule(key, 'ref') ){
						this.getTable(table.getRule(key, 'ref')).references.push({table: table.name, key:key});
					}
				}
			}
		}*/
	},

	createTable: function(){
		return this.TableConstructor.new.apply(this.TableConstructor, arguments);
	},

	getTable: function(name){
		if( typeof name != 'string' ){
			throw new TypeError('string expected for table name');
		}

		var table = this.tables[name];
		if( !table ){
			table = this.tables[name] = this.createTable(this.dirPath + '/' + name);
		}

		return table;
	},

	getTables: function(callback){
		callback.call(this, this.tables);
	},

	getSchema: function(name){
		var table = this.getTable(name);
		//callback.call(this, table.schema);
	},

	find: function(tableName, selector, callback, bind){
		
		var table = this.getTable(tableName);

		if( table ){
			table.find(selector, callback, bind);
		}
		else{
			callback(new Error('can\'t find table ' + tableName));
		}

	},

	insert: function(tableName, fields, callback){

		var table = this.getTable(tableName);

		if( table ){
			table.insert(fields, callback);
		}
		else{
			callback(new Error('can\'t find table ' + tableName));
		}

	},

	update: function(tableName, selector, fields, callback){

		var table = this.getTable(tableName);

		if( table ){
			table.update(selector, fields, callback);
		}
		else{
			callback(new Error('can\'t find table ' + tableName));
		}

	},

	remove: function(tableName, selector, callback){

		var table = this.getTable(tableName);

		if( table ){
			table.remove(selector, callback);
		}
		else{
			callback(new Error('can\'t find table ' + tableName));
		}

	}
};

/*
var Table = {
	name: null,

	create: function(name){
		this.schema = Object.merge({}, DB.schemas.default, DB.schemas[name] || {});

		this.references = [];
		this.modifiedReferences = {};
		this.removedReferences = [];

		this.on('change', function(key, oldValue, value){
			if( key == 'id' ){
				this.modifiedReferences[oldValue] = value;
			}
		});
		this.before('removeLine', function(index){
			if( this.references.length ){
				this.removedReferences.push(this.items[index].id);
			}
		});
	},

	update: function(){
		
		this.matchRules(properties, function(error){
			if( error ) return this.error(error);

			this.watchChanges();
			this.match(match, function(item, index){
				this.updateLine(index, properties);
			});
			this.applyChanges();
		});
	},

	updateAll: function(){
		
		this.matchRules(properties, function(error){
			if( error ) return this.error(error);

			this.watchChanges();
			this.matchAll(match, function(item, index){
				this.updateLine(index, properties);
			});
			this.applyChanges();
		});
		
	},

	insert: function(){
		var key, rules = this.getRules(), result;

		// met les propriétés par défaut
		for(key in rules){
			if( this.hasRule(key, 'default') && !(key in item) ){
				item[key] = this.getDefault(key);
			}
		}

		this.matchRules(item, function(error){
			if( error ) return this.error(error);

			this.watchChanges();
			this.exec('appendLine', this.stringify(item), item);

			this.applyChanges();
		});
	},

	find: function(){

	},

	remove: function(){

	}
};
*/

/*
préserve les références
this.oncesuccess = function(){
	function updateModified(){
		var pairs = Object.pairs(this.modifiedReferences), keys = pairs[0], values = pairs[1];

		if( keys.length ){
			this.modifiedReferences = {};

			keys = keys.map(Number);

			this.updateAllReferences(keys, values, function(error){
				if( error ) return this.error(error);
				updateRemoved.call(this);
			});
		}
		else{
			updateRemoved.call(this);
		}
	}

	function updateRemoved(){
		var removed = this.removedReferences;

		if( removed.length ){
			this.removedReferences = [];

			this.removeAllReferences(removed, function(error){
				if( error ) return this.error(error);
				this.success(j);
			});
		}
		else{
			this.success(j);
		}
	}

	updateModified.call(this);
};
*/

module.exports = DB;
