module.exports = MysqlBackend;

var util  = require('util');
var mysql = require('mysql');

var SQL_QUERY = 'SELECT %s FROM %s WHERE %s';

function MysqlBackend(config, attributes) {
	this._config = config;
	this._map = attributes;
	this._connection = null;
	this._columns = null;
}

MysqlBackend.prototype.connect = function (callback) {
	if (this._connection) {
		callback(null);
		return;
	}

	var config = this._config;
	this._connection = mysql.createConnection({
		host     : config.host,
		user     : config.user,
		password : config.pwd,
		database : config.db
	});

	this._connection.connect(function (err) {
		if (err) {
			throw Error(util.format('The MySQL backend is not available (%s).', err));
		} else {
			callback && callback();
		}
	});
};

MysqlBackend.prototype.query = function (filter, callback) {
	var columns = this._getColumns();
	var condition = this._serializeFilter(filter);
	var sql = util.format(SQL_QUERY, columns, this._config.table, condition);

	this._connection.query(sql, callback);
};

MysqlBackend.prototype._convertAttribute = function (attribute) {
	return this._map[attribute] || attribute;
};

MysqlBackend.prototype._getColumns = function () {
	if (!this._columns) {
		var columns = [];
		var map = this._map;
		for (var key in map) {
			columns.push(map[key] + ' as ' + key);
		}
		this._columns = columns.join(', ') || '*';
	}
	return this._columns;
};

MysqlBackend.prototype._serializeFilter = function (filter) {
	var key = this._convertAttribute(filter.attribute);
	var val = filter.value;

	switch (filter.type) {
	    case 'and':
	    case 'or':
	    	return this._concatFilters(filter.filters, filter.type);
	    case 'not':
	    	return util.format('not (%s)', this._serializeFilter(filter.filter));
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
};

MysqlBackend.prototype._concatFilters = function (filters, glue) {
	var strings = [];
	filters.forEach(function (filter) {
		strings.push(util.format('(%s)', this._serializeFilter(filter)));
	}, this);
	return strings.join(glue);
};
