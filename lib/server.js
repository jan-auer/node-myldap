module.exports = Server;

var util = require('util');
var ldap = require('ldapjs');

function Server(backend, config) {
	this._backend = backend;
	this._config = config;
	this._ldap = null;
}

Server.prototype.start = function (callback) {
	var self = this;

	if (self._ldap) {
		callback();
		return;
	}

	self._backend.connect(function () {
		self._startListening(callback);
	});
};

Server.prototype._startListening = function (callback) {
	var config = this._config;

	this._ldap = ldap.createServer();
	this._ldap.bind(config.dn, this._auth.bind(this));
	this._ldap.search(config.dn, this._search.bind(this));

	try {
		this._ldap.listen(config.port || DEFAULT_PORT, callback);
	} catch (e) {
		throw Error(util.format('The LDAP server could not be started (%s).', e));
	}
};

Server.prototype._auth = function (req, res, next) {
//	var user = req.dn.toString();
//	var pwd  = req.credentials;

	res.end();
};

Server.prototype._search = function (req, res, next) {
	var config = this._config;
	var filter = req.filter;
//	var auth = req.connection.ldap.bindDN.toString();

	this._backend.query(filter, function (err, results) {
		if (err) {
			res.end();
			throw Error(util.format('There was an error obtaining LDAP results from the Backend: %s', err));
		}

		results.forEach(function (result) {
			res.send({
				dn : util.format('dn=%s, %s', result.id, config.dn),
				attributes : result
			});
		});

		res.end();

	});
};
