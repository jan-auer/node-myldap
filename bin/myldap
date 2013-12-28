var util    = require('util');
var ldap    = require('ldapjs');
var mysql   = require('mysql');
var config  = require('./config.json');

// Application Constants   ------------------------------------------

var LDAP_PORT = 1389;
var SQL_QUERY = 'SELECT %s FROM %s WHERE %s';

// Application Logic   ----------------------------------------------

var connection;
start();

function start() {
	startMysql(startLDAP(function () {
		console.log('Everything up and running.');
	}));
}

// MySQL Handling   -------------------------------------------------

function startMysql(callback) {
	connection = mysql.createConnection({
		host     : config.mysql.host,
		user     : config.mysql.user,
		password : config.mysql.pwd,
		database : config.mysql.db
	});
	connection.connect(callback);
}

function queryMysql(condition, callback) {
	var sql = util.format(SQL_QUERY, computeColumns(), config.mysql.table, condition);
	var query = connection.query(sql, callback);
}

// LDAP Handling   --------------------------------------------------

function startLDAP(callback) {
	var server = ldap.createServer();
	server.bind(config.ldap.dn, ldapBind);
	server.search(config.ldap.dn, ldapSearch);
	server.listen(process.argv[2] || LDAP_PORT, callback);
}

function ldapBind(req, res, next) {
	var user = req.dn.toString();
	var pwd  = req.credentials;

	res.end();
	return next();
}

function ldapSearch(req, res, next) {
	var filter = req.filter;
	var binddn = req.connection.ldap.bindDN.toString();

	var condition = serializeFilter(filter);
	queryMysql(condition, function (err, results) {
		if (err) {
			res.end();
			return;
		}

		results.forEach(function (result) {
			res.send({
				dn : util.format('id=%s, %s', result.id, config.ldap.dn),
				attributes : result
			});
		});

		res.end();
	});
}

// LDAP <> MySQL Serialization Handling   ---------------------------

var columns;
function computeColumns() {
	if (!columns) {
		var cols = [];
		var map = config.ldap.keys;
		for (var key in map) {
			cols.push(map[key] + ' as ' + key);
		}
		columns = cols.join(', ') || '*';
	}
	return columns;
}

function serializeFilter(filter) {
	var key = config.ldap.keys[filter.attribute] || filter.attribute;
	var val = filter.value;

	switch (filter.type) {
	    case 'and':
	    case 'or':
	    	return concatFilters(filter.filters, filter.type);
	    case 'not': 
	    	return util.format('not (%s)', serializeFilter(filter.filter));
	    case 'equal': 
	    	return util.format("lower(%s) = lower('%s')", key, val);
	    case 'substring':
	    	val = [filter.initial, (filter.any || []).join('%'), filter.final].join('%');
	    	return util.format("lower(%s) like lower('%s%')", key, val);
	    case 'ge': 
	    	return util.format('%s >= %s', key, val);
	    case 'le':
	    	return util.format('%s <= %s', key, val);
	    case 'present':
	    	return util.format("%s > ''", key);
	    case 'approx': 
	    case 'ext': 
	    default:
	    	throw Error('Unknown filter!');
	}
}

function concatFilters(filters, glue) {
	var strings = [];
	filters.forEach(function (filter) {
		strings.push(util.format('(%s)', serializeFilter(filter)));
	});
	return strings.join(glue);
}
