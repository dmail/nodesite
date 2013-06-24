/*---name: Array.finddescription: Advanced search against arrayrequire: Filter, Array.prototype.iterateprovides: Array.prototype.find, Array.prototype.findAll, Array.prototype.count...*/Array.implement({	// loop through array testing all items	matchIterator: function(match, bind, first, direction, from, to){		/*		a speed improvment is possible is we just need to find the item through a number		if( typeof match == 'number' ){			var value = array[(match * direction == 'left' ? -1 : 1) + (from || 0)];			if( typeof value == 'undefined' ) value = null;			return first ? value : [value];		}*/		return NS.Filter.matchIterator(			function(push){ this.iterate(push, null, direction, from, to); },			this,			match,			bind,			first		);	},	// returns first item satifying match or null	find: function(match, bind, direction, from, to){		return this.matchIterator(match, bind, true, direction, from, to);	},	// returns an array containing all items satifying match	findAll: function(match, bind, direction, from, to){		return this.matchIterator(match, bind, false, direction, from, to);	},	// returns the number of items satisfying at least one arguments	count: function(){		return this.findAll(arguments).length;	}});