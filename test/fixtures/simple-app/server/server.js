'use strict';

const loopback = require('loopback');
const boot = require('loopback-boot');
const app = module.exports = loopback();

boot(app, __dirname, function(err) {
	if (err) return console.error(err);
});
