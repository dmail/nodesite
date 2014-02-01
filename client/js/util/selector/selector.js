/*
---

name: Selector

description: Object having with a match function destined to be called on an item

requires: Function.TRUE, Function.FALSE

...
*/

NS.Selector = {
	alwaysTrue: Function.TRUE,
	alwaysFalse: Function.FALSE,
	ACCEPT: true, // a filter return true? we found what we wanted break the loop
	REJECT: false, // a filter return reject? we continue the loop
	SKIP: 2, // only used in netxNode, prevNode, reject a node without invalidating it's descendant
	constructors: [],

	new: function(selector){
		if( selector instanceof this ) return selector;
		
		var i = 0, j = this.constructors.length, test, constructor;

		for(;i<j;i+=2){
			test = this.constructors[i];
			if( test(selector) ){
				constructor = this.constructors[i+1];
				return constructor.new.apply(constructor, arguments);
			}
		}

		throw new TypeError(selector + ' is not a valid selector');
	},

	addConstructor: function(test, constructor){
		if( typeof test == 'string' ){
			var type = test;
			test = function(){
				return typeof selector == type;
			};
		}

		this.constructors.push(test, constructor);
	},

	filter: Function.FALSE,

	isRejected: function(value){
		return value === this.REJECT;
	},

	isAccepted: function(value){
		return value === this.ACCEPT;
	},

	callFilter: function(filter, item){
		return filter.call(this, item);
	},

	match: function(item){
		return this.isAccepted(this.callFilter(this.filter, item));
	},

	matchReverse: function(item){
		return this.isRejected(this.callFilter(this.filter, item));
	},

	neverMatch: function(){
		return this.filter === this.alwaysFalse;
	},

	setReverse: function(reverse){
		if( reverse ){
			this.match = this.matchReverse;
		}
		else{
			this.match = NS.Selector.match;
		}
	},

	// iterator supply items to test, we returns the first or all items filtered
	collectMatch: function(iterator, iteratorBind, first){
		var found = first ? null : [], result, self = this;
		
		if( !this.neverMatch() ){
			iterator.call(iteratorBind, function(item){
				result = self.callFilter(self.filter, item);

				if( self.isAccepted(result) ){
					if( first ){
						found = item;
					}
					else{
						found.push(item);
						// simulate that the item isn't accepted to keep looping
						result = self.SKIP;
					}
				}

				return result;
			});
		}

		return found;
	}
};
