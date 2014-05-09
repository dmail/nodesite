/* global FS, util, Path, ABS_PATH, ROOT_PATH, APP_PATH, SERVER_PATH, CLIENT_PATH */

Error.stackTraceLimit = 20;

global.ROOT_PATH = Path.resolve(process.cwd(), '../../');
global.APP_PATH = ROOT_PATH + Path.sep + 'app';
global.SERVER_PATH = APP_PATH + Path.sep + 'server';
global.CLIENT_PATH = APP_PATH + Path.sep + 'client';

global.config = require(APP_PATH + Path.sep + 'config.js');

var pair = require('Object.pair');
pair.append(global, require('functions'));
global.lang = global.loadLanguageDirectory(SERVER_PATH + '/lang/' + config.lang);

var ansi = require('ansi');
var server = {
	http: require('http'),
	logger: require('logger').new(),
	router: require('router'),

	onrequest: function(request, response){
		this.router.new(request, response);//.start();
	},

	onclientError: function(e){
		server.logger.error('client request error', e);
	},

	open: function(){
		this.connection = this.http.createServer();

		this.connection.on('request', this.onrequest);
		//this.connection.on('listening', this.onlistening);
		this.connection.on('clientError', this.onclientError);

		/*
		var socket = require('socket.io');
		var IO = socket.listen(this.server);

		IO.set('log level', 0);
		IO.set('authorization', this.authorize.bind(this));
		IO.sockets.on('connection', this.onClient.bind(this));
		*/
	},

	listen: function(port, host, callback){
		var connection = this.connection;

		function serverError(error){
			connection.removeListener('error', serverError);
			connection.removeListener('listen', serverListening);
			callback(error);
		}

		function serverListening(){
			connection.removeListener('error', serverError);
			connection.removeListener('listen', serverListening);
			callback();
		}

		connection.on('listening', serverListening);
		connection.on('error', serverError);
		connection.listen(port, host);
	},

	close: function(callback){
		this.connection.close(callback);
	},

	// lorsqu'une socket veut se connecter
	authorize: function(data, callback){
		callback(null, true);
	},

	onClient: function(socket){
		//new Client(socket);
	}
};

var router = server.router;
// use basic services
router.use('bodyReader');
router.use('cookieParser');
router.use('params');
router.use('methodOverride');
router.use('jsonParam');
router.use('responseTime');
router.use('session');
router.use('logger', server.logger);
router.use('cors');
router.use('page');
router.use('module');
router.use('file');
router.use('errorHandler');

router.use('bodyWriter');

router.allowErrorTrace = config.debug;
//router.Request.defaultAcceptedCharset = config.charset;
router.Request.charset = config.charset;
router.Response.charset = config.charset;

server.open();
server.logger.styles['host'] = {color: 'grey'};
server.logger.styles['port'] = {color: 'red'};

server.listen(config.port, config.host, function(error){
	if( error ){
		if( error.code == 'EADDRINUSE' ){
			error.message = 'Port ' + config.port + ' already in use';
		}
		throw error;
	}

	server.logger.info('Server running at {host}:{port}', config.host, config.port);
});