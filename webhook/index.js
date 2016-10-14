'use strict'

import express from 'express';
import request from 'request';
import _ from 'lodash';

import config from '../config/environment';

const router = express.Router();
const Bot = require('./bot.js');

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

export default router;
