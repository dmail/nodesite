/**Array.prototype.iteratefn(item): a function that will be called over every item of the array, returns true to break the iterationdirection: 'left'|'right'|'both' default: 'right'from: number, index from wich to start iteration default: 0to: number|true, maximum index for the iteration default: this.length*/Array.prototype.iterate = function(fn, direction, from, to, bind){	var length = this.length, start, end, sign, loop;	if( typeof fn != 'function' ) throw new TypeError(fn + 'is not callable');	if( length === 0 ) return this;	if( !direction || direction === 'right' ){		sign = 1;		start = -1;		end = length - 1;	}	else{		if( direction === 'both' ) to = true;		sign = -1;		start = length;		end = 0;	}	// from should respect array limits	if( typeof from != 'number' ) from = start;	else if( sign == 1 ? from < start : from > start ) from = start;	else if( sign == 1 ? from > end : from < end ) from = end;	// if to === true we loop twice except if from == start as loop is useless	if( to === true && from != start ) loop = from == end ? from + sign : from;	// to should respect array limits	if( typeof to != 'number' ) to = end;	else if( sign == 1 ? to > end : to < end ) to = end;	else if( sign == 1 ? to < start : to > start ) to = start;	// prevent infinite loop	if( sign == 1 ? to < from : to > from ) return this;	do{		while(from != to){			from+= sign;			if( fn.call(bind, this[from], from) === true ) return this;		}		if( typeof loop != 'number' ) break;		from = start;		to = loop - sign;		loop = null;	}	while(true);	return this;};