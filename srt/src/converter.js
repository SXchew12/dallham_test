'use strict';

var ass = require('./ass');

function defaultCallback(error) {
	if (error) throw error;
}

exports.convert = function (_in, _out, _options, callback = defaultCallback)
{
	_options = _options || {};

	ass.parse(_in, _out, _options, callback);
};
