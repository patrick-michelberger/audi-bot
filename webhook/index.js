'use strict'

const express = require('express');
const request = require('request');
const _ = require('lodash');

const config = require('../config/environment');

const router = express.Router();
const Bot = require('./bot.js');

console.log("config: ", config);

let bot = new Bot({
  token: config.facebook.pageToken,
  verify: config.facebook.verifyToken
});

/**
 * INCOMING MESSAGES FROM FB MESSENGER
 */
bot.on('message', (payload, reply) => {
  console.log("incoming message from FB: ", payload);
});

/**
 * INCOMING ACTIONS FROM FB MESSENGER
 */
bot.on('postback', (payload, reply) => {
  console.log("incoming action from FB: ", payload);
});

router.all('/', bot.middleware());

module.exports = router;
