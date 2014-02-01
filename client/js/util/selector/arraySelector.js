(function(Selector){

	var ArraySelector = Selector.extend({
		selectors: null,

		new: function(selector){
			if( selector.length === 0 ){
				return Selector.new(null);
			}
			if( selector.length === 1 ){
				return Selector.new(selector[0]);
			}

			return Object.prototype.new.apply(this, arguments);
		},

		create: function(){
			Selector.create.apply(this, arguments);
			this.selectors = this.selector.map(Selector.new, Selector);
		},

		filter: function(item){
			var i = 0, j = this.selectors.length;

			for(;i<j;i++){
				if( !this.selectors[i].match(item) ) return false;
			}
			
			return true;
		}
	});

	Selector.addConstructor(function(item){ return item instanceof Array; }, ArraySelector);

})(NS.Selector);