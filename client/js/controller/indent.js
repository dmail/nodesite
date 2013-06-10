/* global */

Item('controller.tree').extend('indent', {
	events: {
		'view:insertElement': function(view){
			view.getDom('div').style.paddingLeft = this.padding * this.getLevel(view) + 'px';
		}
	},
	padding: 18,

	getLevel: function(view){
		var level = 0, parent = view.parentNode;
		while(parent){
			level++;
			parent = parent.parentNode;
		}
		return level - 1;
	}
});
