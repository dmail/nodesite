/* global NodeController */

NodeController.create('selection', {
	events: {
		'view:select': function(view, e){
			if( this.selected ) this.selected.unselect(e);
			this.selected = view;
		},

		'view:unselect': function(){
			delete this.selected;
		},

		mousedown: function(view, e){
			if( view && view != this.view ){
				view.select(e);
			}
			else if( this.selected ){
				this.selected.unselect(e);
			}
		}
	},
	selected: null
});

NodeController.prototype.getSelected = function(){
	var controller = this.getController('selection');
	return controller ? controller.selected : null;
};
