/*

description: manipulate a file content part by part splitting the part with separator 

NOTE:
- the file is entirely read and kept into memory
- doesn't support non string data

TODO:

*/

var FilePartManager = NS.Emitter.extend({
	partConstructor: require('./filePart.js'),
	fileSystem: require('fs'),

	path: null,				// path to the file
	state: 'closed',		// 'closed','opening','opened','reading','readed','writing','closing' (default: 'closed')
	fd: null,				// filedescriptor when the file is opened
	stat: null,				// stat object used to read the file
	size: null,				// size of the file
	encoding: 'utf8',		// encoding of the file content
	separator: '\n',		// the char used to separate file content into parts (default to '\n')
	separatorBuffer: null,	// separatorBuffer that will be created from separator	
	parts: null,			// array of part

	create: function(path, encoding){
		if( typeof path != 'string' ){
			throw new TypeError('string expected for file path ' + typeof string + ' given');
		}
		if( path === '' ){
			throw new TypeError('file path cannot be empty');
		}

		this.setPath(path);
		if( typeof encoding == 'string' ){
			if( !Buffer.isEncoding(encoding) ){
				throw new Error(encoding + ' is not a valid encoding');
			}
			this.encoding = encoding;
		}

		NS.Emitter.create.call(this);
	},

	setPath: function(path){
		this.path = path;
	},

	reply: function(callback, bind){
		if( callback == null ){
			callback = console.log;
			bind = console;
		}
		else if( typeof callback != 'function' ){
			throw new TypeError('function expected as callback');
		}

		bind = bind || this;

		return callback.apply(bind, Array.slice(arguments, 2));
	},

	onopen: function(){
		this.applyListeners('open', arguments);
	},

	onread: function(){
		this.applyListeners('read', arguments);
	},

	onclose: function(){
		this.applyListeners('close', arguments);
	},

	onwrite: function(error, written, buffer){
		if( !error && written != buffer.length ){
			error = new Error('write error: ' + written + 'bytes written on ' + buffer.length);
		}
		this.emit('write', error, written, buffer);
	},

	open: function(callback, bind){

		if( this.state != 'closed' ){
			return this.reply(callback, bind, new Error('file already open'));
		}
		
		this.once('open', function(error, fd){
			if( error ){
				this.state = 'closed';
				this.reply(callback, bind, error);
			}
			else{
				this.state = 'opened';
				this.fd = fd;
				this.separatorBuffer = new Buffer(this.separator, this.getEncoding());
				this.parts = [];
				this.reply(callback, bind, null, fd);
			}
		});

		this.state = 'opening';
		this.fileSystem.open(this.path, 'r+', this.onopen.bind(this));
	},

	close: function(callback, bind){
		var state = this.state;

		if( state != 'opened' && state != 'readed' ){
			return this.reply(callback, bind, new Error('file not opened'));
		}
		if( this.fd == null ){
			return this.reply(callback, bind, new Error('file descriptor is null'));
		}

		this.once('close', function(error){
			if( error ){
				this.state = state;
				this.reply(callback, bind, error);
			}
			else{
				this.clean();
				this.reply(callback, bind);
			}			
		});

		this.state = 'closing';
		this.fileSystem.close(this.fd, this.onclose.bind(this));
	},

	read: function(callback, bind){
		if( this.state != 'opened' ){
			return this.reply(callback, bind, new Error('file not opened'));
		}

		function onstat(error, stat){
			if( error ){
				return this.reply(callback, bind, error);
			}

			this.once('read', function(error, readed, buffer){
				if( error ){
					this.state = 'opened';
					this.reply(callback, bind, error);
				}
				else{
					this.state = 'readed';
					this.reply(callback, bind, null, this.parseBuffer(buffer));
				}
			});

			this.stat = stat;
			this.size = stat.size;

			if( stat.size === 0 ){
				return this.onread(null, 0, new Buffer(0));
			}
			
			this.fileSystem.read(this.fd, new Buffer(stat.size), 0, stat.size, 0, this.onread.bind(this));
		}

		this.state = 'reading';
		this.fileSystem.fstat(this.fd, onstat.bind(this));
	},

	write: function(buffer, byte, callback, bind){
		// byte est un argument optionnel
		if( typeof byte != 'number' ){
			bind = callback;
			callback = byte;
			byte = 0;
		}
		// byte ne doit pas être sortir des limites du fichier
		else{
			byte = Math.max(byte, 0);
			byte = Math.min(byte, this.size);
		}

		if( this.state != 'readed' ){
			return this.reply(callback, bind, new Error('can\'t write: file not in readed state'));
		}

		this.once('write', function(error, written, buffer){
			this.state = 'readed';

			if( error ){
				return this.reply(callback, bind, error);
			}
			
			this.size = Math.max(this.size, byte + buffer.length);
			this.reply(callback, bind);
		});

		if( buffer.length === 0 ){
			this.onwrite(null, 0, new Buffer(0));
		}
		else{
			this.state = 'writing';
			this.fileSystem.write(this.fd, buffer, 0, buffer.length, byte, this.onwrite.bind(this));
		}
	},

	clean: function(){
		this.state = 'closed';
		this.parts = null;
		this.fd = null;
		this.stat = null;
		this.size = null;
	},

	unlink: function(callback, bind){
		this.fileSystem.unlink(this.path, function(error){
			if( error ){
				return this.reply(callback, bind, error);
			}
			this.clean();
			this.reply(callback, bind);
		}.bind(this));
	},

	newPart: function(){
		return this.partConstructor.new.apply(this.partConstructor, arguments);
	},

	addPart: function(buffer, byte){
		var part = this.newPart(buffer);
		part.byte = byte;
		this.parts.push(part);
		return part;
	},

	parseBuffer: function(buffer){
		var byte = 0, i = 0, j = buffer.length, separatorCode = this.separatorBuffer[0];

		for(;i<j;i++){
			if( buffer[i] == separatorCode ){
				this.addPart(buffer.slice(byte, i), byte);
				byte = i+1;
			}
		}
		
		// crée une dernière partie pour la fin du fichier
		this.addPart(buffer.slice(byte, j), byte);

		return this.parts;
	},

	getEncoding: function(){
		return this.encoding;
	},

	truncateThenWrite: function(byte, buffer, callback, bind){
		// écrit directement en fin de fichier
		if( byte >= this.size ){
			this.write(buffer, this.size, callback, bind);
			return;
		}

		// tronque avant d'écrire en fin de fichier
		function ontruncate(error){
			if( error ){
				return this.reply(callback, bind, error);
			}

			this.size = byte;
			this.write(buffer, byte, callback, bind);
		}

		this.fileSystem.truncate(this.fd, byte, ontruncate.bind(this));
	},

	concatBufferFrom: function(index){
		var i = index, j = this.parts.length, buffer = new Buffer(0), list;
		
		for(;i<j;i++){
			list = [buffer];
			if( i !== index ){
				list.push(this.separatorBuffer);
			}
			list.push(this.parts[i].buffer);
			buffer = Buffer.concat(list);
		}

		return buffer;
	},

	isPart: function(part){
		return this.partConstructor.isPrototypeOf(part);
	},

	checkPart: function(part){
		var error = null;

		if( !this.isPart(part) ){
			part = new Error('not a part object');
		}
		else if( part.byte != null ){
			error = new Error('part is already in an other file');
		}
		else if( part.bufferError ){
			error = part.bufferError;
		}

		return error;
	},

	appendPart: function(part, callback, bind){
		var index, lastPart, byte = 0, error, buffer, writeBuffer, writeByte;

		if( this.state == 'closed' ){
			error = new Error('can\'t appendPart file is closed');
		}
		else{
			error = this.checkPart(part);
		}

		if( error ){
			return this.reply(callback, bind, error);
		}		

		index = this.parts.length;
		lastPart = this.parts[index - 1];
		buffer = part.buffer;
		writeBuffer = buffer;
		writeByte = byte;

		// si le fichier est vide
		if( index === 1 && lastPart.buffer.length === 0 ){
			this.parts = [];
		}
		else{
			byte = lastPart.byte + lastPart.buffer.length + this.separatorBuffer.length;

			// create a temporary buffer to write the separator and the new part
			writeBuffer = Buffer.concat([this.separatorBuffer, buffer]);
			// start to write at separator
			writeByte = byte - this.separatorBuffer.length;
		}
		
		this.write(writeBuffer, writeByte, function(error){
			if( error ){
				return this.reply(callback, bind, error);
			}
			
			part.byte = byte;
			this.parts.push(part);			
			this.reply(callback, bind, null, part);
		});
	},

	replacePart: function(oldPart, part, callback, bind){
		var index, i, j, buffer, writeBuffer, writeByte, diff, error;

		error = this.checkPart(part);

		if( !error ){
			if( !this.isPart(oldPart) ){
				error = new Error('oldPart is not a part object');
			}
			else if( this.state == 'closed' ){
				error = new Error('cannot replacePart file is closed');
			}
			else{
				index = this.parts.indexOf(oldPart);
				if( index === -1 ){
					error = new Error('oldPart not a part of this file');
				}
			}
		}

		if( error ){
			return this.reply(callback, bind, error);
		}

		buffer = part.buffer;
		writeBuffer = buffer;
		writeByte = oldPart.byte;

		if( index != (this.parts.length - 1) ){
			writeBuffer = Buffer.concat([buffer, this.separatorBuffer]);
		}
		diff = part.buffer.length - writeBuffer.length;

		function onsuccess(error){
			if( error ){
				return this.reply(callback, bind, error);
			}

			part.byte = writeByte;
			this.parts[index] = part;

			// décale toutes les lignes suivantes
			if( diff !== 0 ){
				i = index + 1;
				j = this.parts.length;
				for(;i<j;i++){
					this.parts[i].byte-= diff;
				}
			}

			this.reply(callback, bind, null, part);
		}

		if( diff === 0 ){
			this.write(writeBuffer, writeByte, onsuccess);
		}
		else{
			this.truncateThenWrite(writeByte, Buffer.concat([writeBuffer, this.concatBufferFrom(index + 1)]), onsuccess);
		}

		return part;
	},

	removePart: function(part, callback, bind){
		var i, j, diff, byte, error, index;

		error = this.checkPart(part);

		if( !error ){
			if( this.state == 'closed' ){
				error = new Error('cannot removePart, file is closed');
			}
			else{
				index = this.parts.indexOf(part);
				if( index === -1 ){
					error = new Error('not part of this file');
				}
			}
		}

		if( error ){
			return this.reply(callback, bind, error);
		}

		diff = part.buffer.length;
		byte = part.byte;
		
		// je supprime la dernière ligne
		if( index === (this.parts.length - 1) ){
			// la ligne d'avant perds son séparateur je dois dont truncate à cet endroit là
			byte-= this.separatorBuffer.length;
		}
		// la ligne suivante perd son séparateur ce qui décale d'autant le bytes des lignes suivantes
		else{
			diff+= this.separatorBuffer.length;
		}
		
		this.truncateThenWrite(byte, this.concatBufferFrom(index + 1), function(error){
			if( error ){
				return this.reply(callback, bind, error);
			}

			if( diff !== 0 ){
				i = index + 1;
				j = this.parts.length;
				for(;i<j;i++){
					this.parts[i].byte-= diff;
				}
			}

			// il n'y a qu'une partie: cette partie devient vide
			if( index === 0 && this.parts.length == 1  ){
				part.empty();
			}
			// on supprime totalement cette partie
			else{
				this.parts.splice(index, 1);
			}

			this.reply(callback, bind, null, part);
		});
	}
});

module.exports = FilePartManager;
