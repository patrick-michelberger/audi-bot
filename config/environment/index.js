'use strict';

var path = require('path');
var _ = require('lodash');

if(!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

// All configurations will extend these options
// ============================================
var all = {
    env: process.env.NODE_ENV,

    domain: process.env.DOMAIN,

    // Root path of server
    root: path.normalize(__dirname + '/../../..'),

    // Server port
    port: process.env.PORT || 9000,

    // Server IP
    ip: process.env.IP || '0.0.0.0',

    facebook: {
        clientID: process.env.FACEBOOK_ID || 'id',
        pageId: process.env.FACEBOOK_PAGE_ID || 'page id',
        clientSecret: process.env.FACEBOOK_SECRET || 'secret',
        pageToken: process.env.FACEBOOK_PAGE_TOKEN || 'page token',
        verifyToken: process.env.FACEBOOK_VERIFY_TOKEN || 'verify token',
        callbackURL: (process.env.DOMAIN || '') + '/auth/facebook/callback'
    },

    wit: {
        token: process.env.WIT_TOKEN || 'token'
    }
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
    all);
