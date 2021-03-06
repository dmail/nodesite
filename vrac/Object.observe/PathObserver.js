var Observer = require('../Observer');

var PathObserver = Observer.create({
	init: function(object, path){
		Observer.init.call(this);

		this.object_ = object;
		this.path_ = getPath(path);
		this.directObserver_ = undefined;
	},

	get path() {
		return this.path_;
	},

	connect_: function() {
		if (hasObserve)
			this.directObserver_ = getObservedSet(this, this.object_);

		this.check_(undefined, true);
	},

	disconnect_: function() {
		this.value_ = undefined;

		if (this.directObserver_) {
			this.directObserver_.close(this);
			this.directObserver_ = undefined;
		}
	},

	iterateObjects_: function(observe) {
		this.path_.iterateObjects(this.object_, observe);
	},

	check_: function(changeRecords, skipChanges) {
		var oldValue = this.value_;
		this.value_ = this.path_.getValueFrom(this.object_);
		if (skipChanges || areSameValue(this.value_, oldValue))
			return false;

		this.report_([this.value_, oldValue, this]);
		return true;
	},

	setValue: function(newValue) {
		if (this.path_)
			this.path_.setValueFrom(this.object_, newValue);
	}
});

module.exports = PathObserver;