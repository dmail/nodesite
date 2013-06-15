module.exports = Object.prototype.extend({
	constructor: function(request, response, e){
		if( e ) logger.error(e);

		response.writeHead(500, {'content-type': 'text/plain'});
		response.write('Internal server error');
		response.end();
	}
});
