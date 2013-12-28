module.exports = MyLDAP;

var Server = require('./server');
var Backend = require('./mysql');

function MyLDAP(config) {
	this._backend = new Backend(config.backend, config.attributes);
	this._server = new Server(this._backend, config.ldap);
}

MyLDAP.prototype.run = function (callback) {
	this._server.start(callback);
};
