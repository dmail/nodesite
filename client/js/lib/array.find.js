/*---name: Array.finddescription: Advanced search against arrayrequire: Finder, Array.prototype.iterateprovides: Array.prototype.find, Array.prototype.findAll, Array.prototype.count...*/Array.implement({	// loop through array testing all items	matchIterator: function(match, first, direction, from, to){		/*		a speed improvment is possible is we just need to find the item through a number		if( typeof match == 'number' ){			var value = array[(match * direction == 'left' ? -1 : 1) + (from || 0)];			if( typeof value == 'undefined' ) value = null;			return first ? value : [value];		}*/				return NS.Finder.matchIterator(			function(push){ this.iterate(push, direction, from, to); },			this,			match,			first		);	},	// returns first item satifying match or null	find: function(match, direction, from, to){		return this.matchIterator(match, true, direction, from, to);	},	// returns an array containing all items satifying match	findAll: function(match, direction, from, to){		return this.matchIterator(match, false, direction, from, to);	},	// returns the number of items satisfying at least one arguments	count: function(){		return this.findAll(arguments).length;	}});