module.exports = Server;

var ldap = require('ldapjs');

function Server(backend, config) {
	this._backend = backend;
	this._config = config;
	this._ldap = null;
}

Server.prototype.start = function (callback) {
	var self = this;
	var config = self._config;

	if (self._ldap) {
		callback();
		return;
	}

	self._backend.connect(function () {
		self._ldap = ldap.createServer();
		self._ldap.bind(config.dn, self._auth.bind(self));
		self._ldap.search(config.dn, self._search.bind(self));

		server.listen(config.port || DEFAULT_PORT, function (err) {
			if (err) {
				throw Error('The LDAP server could not be started (%s).', err);
			} else {
				callback && callback();
			}
		});
	});
};

Server.prototype._auth = function (req, res, next) {
	var user = req.dn.toString();
	var pwd  = req.credentials;

	res.end();
};

Server.prototype._search = function (req, res, next) {
	var filter = req.filter;
	var auth = req.connection.ldap.bindDN.toString();

	this._backend.query(filter, function (err, results) {
		if (err) {
			res.end();
			throw Error('There was an error obtaining LDAP results from the Backend: %s', err);
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