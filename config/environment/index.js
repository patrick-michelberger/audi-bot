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
        pageId: process.env.FACEBOOK_PAGE_ID || '1759331254328359',
        clientSecret: process.env.FACEBOOK_SECRET || 'secret',
        pageToken: process.env.FACEBOOK_PAGE_TOKEN || 'EAACgKvqQdxcBACFKB5bjDEb4wt5YZBRZCbPL09h32eREJPYhTJKJ1vwniqcpS0I5jb97hBsRI1JDkRvylPDIBGP4qVORtKIE8wC3b1upZBSrv1fmjb2oG1uTXParOtmEhXJUVMVnCkoeeuB73y4msv7xZBWl9Fr8hyPXlvBZBfQZDZD',
        verifyToken: process.env.FACEBOOK_VERIFY_TOKEN || 'my_super_secret',
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
