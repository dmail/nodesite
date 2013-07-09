Object.extendMergePair = function(key, value){
	if( typeof value == 'object' && value !== null ){
		var current = this[key];
		// when an object exists in this and in value for key
		// we create an object heriting from current then we merge it
		if( typeof current == 'object' && current !== null ){
			current = this[key] = Object.create(current);
			Object.eachOwnPair(value, Object.extendMergePair, current);
		}
		else{
			Object.appendPair.apply(this, arguments);
		}
	}
	else{
		Object.appendPair.apply(this, arguments);
	}
};

/*
create an object linked to object
then merge it with merge but create subobject link if merge override subobject
*/

Object.extendMerge = function(object, merge){
	var instance = Object.create(object);

	Object.eachOwnPair(merge, Object.extendMergePair, instance);

	return instance;
};

// create a deep copy of object linked to object and his subobject by prototype
Object.copy = function(object){

	var copy = Object.create(object), key, value;

	for(key in copy){
		value = copy[key];
		if( typeof value == 'object' && value !== null ) copy[key] = Object.copy(value);
	}

	return copy;
};

NS.options = {
	setOptions: function(options){

		// only if this has not yet an options object
		if( !this.hasOwnProperty('options') ){
			// create object derived from parent options
			if( 'options' in this ){
				this.options = Object.copy(this.options);
			}
			else{
				this.options = {};
			}
		}

		if( options ){
			Object.merge(this.options, options);
		}

		return this;
	}
};