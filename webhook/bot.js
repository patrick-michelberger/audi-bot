'use strict'
const EventEmitter = require('events').EventEmitter;
const request = require('request');
const config = require('../config/environment');

const WIT_TOKEN = config.wit.token;
const FACEBOOK_PAGE_ID = config.facebook.pageId;
const FACEBOOK_ACCESS_TOKEN = config.facebook.pageToken;

const sendMessage = (recipient, payload, cb) => {
    if (!cb) cb = Function.prototype
    request({
        method: 'POST',
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: FACEBOOK_ACCESS_TOKEN
        },
        json: {
            recipient: { id: recipient },
            message: payload
        }
    }, (err, res, body) => {
        if (err) return cb(err)
        if (body.error) return cb(body.error)

        cb(null, body)
    })
};

// This will contain all user sessions.
// Each session has an entry:
// sessionId -> {fbid: facebookUserId, context: sessionState}
const sessions = {};

const findOrCreateSession = (fbid) => {
    let sessionId;
    // Let's see if we already have a session for the user fbid
    Object.keys(sessions).forEach(k => {
        if (sessions[k].fbid === fbid) {
            sessionId = k;
        }
    });
    if (!sessionId) {
        // No session found for user fbid, let's create a new one
        sessionId = new Date().toISOString();
        sessions[sessionId] = { fbid: fbid, context: {} };
    }
    return sessionId;
};
/*
const firstEntityValue = (entities, entity) => {
    const val = entities && entities[entity] &&
        Array.isArray(entities[entity]) &&
        entities[entity].length > 0 &&
        entities[entity][0].value;
    if (!val) {
        return null;
    }
    return typeof val === 'object' ? val.value : val;
};
*/

const getEntityValues = (response, entity) => {
    const entities = response && response.outcomes && response.outcomes.length > 0 && response.outcomes[0];
    if (!entities) {
        return null;
    }
    return _.pluck(entities, 'value');
}

// wit bot actions
const actions = {
    say(sessionId, context, message, cb) {
        // Our bot has something to say!
        // Let's retrieve the Facebook user whose session belongs to
        const recipientId = sessions[sessionId].fbid;
        if (recipientId) {
            // Yay, we found our recipient!
            // Let's forward our bot response to her.
            sendMessage(recipientId, {
                "text": message
            }, (err, data) => {
                if (err) {
                    console.log(
                        'Oops! An error occurred while forwarding the response to',
                        recipientId,
                        ':',
                        err
                    );
                }

                // Let's give the wheel back to our bot
                cb();
            });
        } else {
            console.log('Oops! Couldn\'t find user for session:', sessionId);
            // Giving the wheel back to our bot
            cb();
        }
    },
    merge(sessionId, context, entities, message, cb) {
        cb(context);
    },
    error(sessionId, context, error) {
        console.log(error.message);
    },
};

// setting up wit bot
const Wit = require('node-wit').Wit;
const client = new Wit(WIT_TOKEN, actions);

// tablesurfer bot
class Bot extends EventEmitter {
    constructor(opts) {
        super()

        opts = opts || {}
        if (!opts.token) {
            throw new Error('Missing page token. See FB documentation for details: https://developers.facebook.com/docs/messenger-platform/quickstart')
        }
        this.token = opts.token
        this.verify_token = opts.verify || false
    }

    saveUser(id, cb) {
        if (!cb) cb = Function.prototype
        /* TODO
        this.getProfile(id, (err, profile) => {
            var user = new User({
                first_name: profile.first_name,
                last_name: profile.last_name,
                picture: profile.profile_pic,
                messengerId: id
            });
            user.save((err) => {
                cb(err, user);
            });
        });
        */
    }

    getProfile(id, cb) {
        if (!cb) cb = Function.prototype
        request({
            method: 'GET',
            uri: 'https://graph.facebook.com/v2.6/' + id,
            qs: {
                fields: 'first_name,last_name,profile_pic',
                access_token: this.token
            },
            json: true
        }, (err, res, body) => {
            if (err) return cb(err)
            if (body.error) return cb(body.error)
            cb(null, body)
        })
    }

    verify(token) {
        return (req, res) => {
            if (req.method === 'GET') {
                let query = req.query;

                if (query['hub.verify_token'] === token) {
                    return res.send(query['hub.challenge'])
                }

                return res.send('Error, wrong validation token')
            }
        }
    }

    middleware() {
        return (req, res) => {
            var self = this;

            if (this.verify_token && req.method === 'GET') return this.verify(this.verify_token)(req, res)
            if (req.method !== 'POST') return res.end()

            let entries = req.body.entry

            entries.forEach((entry) => {
                let events = entry.messaging

                events.forEach((event) => {

                    if (event.recipient.id == FACEBOOK_PAGE_ID) {
                        // Got a new message!

                        // Retrieve the Facebook user ID of the sender
                        const senderId = event.sender.id;
                        // Retrieve the user's current session, or create one if it doesn't exist
                        // This is needed for the wit bot to figure out the conversation history
                        const sessionId = findOrCreateSession(senderId);

                        if (event.message && event.message.attachments) {
                            // Received an attachment
                            sendMessage(
                                senderId,
                                'Sorry we can only process text messages for now.'
                            );
                        } else if (event.message && event.message.text) {
                            // received a text message
                        } else if (event.payload) {
                            // received payload data
                        } else if (event.delivery) {
                            // received delivery message
                        } else {
                            // don't know the command
                        }

                        // lookup user with provider = facebook and id = sender.id
                        User.findOne({
                            messengerId: senderId
                        }, (err, user) => {
                            if (err) return res.end()

                            // append user object to event
                            event.user = user;

                            if (!user) {
                                event.state = "newUser";
                                // create new user
                            } else if (!user.email) {
                                event.state = "askEmail";
                                // add campusMail to user
                                // create verify code
                                // save user
                                // send verify code message with resend button
                            } else if (!user.verified) {
                                event.state = "askVerifycode";

                            } else if (!user.weekdays || user.weekdays.length === 0) {
                                // send weekday buttons
                                event.state = "askWeekdays";
                            }

                            // handle inbound messages
                            if (event.message) {
                                self._handleEvent('message', event);
                            }

                            // handle postbacks
                            if (event.postback) {
                                self._handleEvent('postback', event);
                            }

                            // handle message delivered
                            if (event.delivery) {
                                self._handleEvent('delivery', event);
                            }
                        });
                    }
                });
            })
            res.json({ status: 'ok' });
        }
    }

    _handleEvent(type, event) {
        this.emit(type, event, sendMessage.bind(this, event.sender.id))
    }

    _request(recipientId, messageData) {
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {
                access_token: config.facebook.pageToken
            },
            method: 'POST',
            json: {
                recipient: { id: recipientId },
                message: messageData,
            }
        }, function(error, response, body) {
            if (error) {
                console.log('Error sending message: ', error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
            }
        });
    }

    askForStatus(recipientId) {
        let messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "button",
                    "text": "Bist du ein Student?",
                    "buttons": [{
                        "type": "postback",
                        "title": "Ja",
                        "payload": "student_status_yes"
                    }, {
                        "type": "postback",
                        "title": "Nein",
                        "payload": "student_status_no"
                    }]
                }
            }
        };
        this._request(recipientId, messageData);
    }

    askForLanguage(recipientId) {
        let messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "button",
                    "text": "Welche Sprache sprichst du?",
                    "buttons": [{
                        "type": "postback",
                        "title": "Deutsch",
                        "payload": "language_german"
                    }, {
                        "type": "postback",
                        "title": "English",
                        "payload": "language_english"
                    }]
                }
            }
        };
        this._request(recipientId, messageData);
    }

    askForVerifycode(recipientId) {
        let messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "button",
                    "text": "Gehe bitte auf den Verifizierungslink, den wir an deine E-Mail Adresse gesendet haben.",
                    "buttons": [{
                        "type": "postback",
                        "title": "Nochmal senden?",
                        "payload": "resend_verifycode"
                    }]
                }
            }
        }
        this._request(recipientId, messageData);
    }

    askPreferredWeekdays(recipientId, cb) {
        if (!cb) cb = Function.prototype
        sendMessage(recipientId, {
            "text": "Deine bevorzugten Wochentage?"
        });
    }

    reply(recipientId, text, cb) {
        if (!cb) cb = Function.prototype
        sendMessage(recipientId, {
            "text": text
        }, (err) => {
          if(err) {
            cb(err);
            return;
          }
          cb(null);
        });
    }

    runWitActions(sessionId, msg) {
        // Let's forward the message to the Wit.ai Bot Engine
        // This will run all actions until our bot has nothing left to do
        client.runActions(
            sessionId, // the user's current session
            msg, // the user's message
            sessions[sessionId].context, // the user's current session state
            (error, context) => {
                if (error) {
                    console.log('Oops! Got an error from Wit:', error);
                } else {
                    // Our bot did everything it has to do.
                    // Now it's waiting for further messages to proceed.
                    console.log('Waiting for futher messages.');

                    // Based on the session state, you might want to reset the session.
                    // This depends heavily on the business logic of your bot.
                    // Example:
                    // if (context['done']) {
                    //   delete sessions[sessionId];
                    // }

                    // Updating the user's current session state
                    sessions[sessionId].context = context;
                }
            }
        );
    }

    askWit(message, cb) {
        if (!cb) cb = Function.prototype
        client.message(message, (error, data) => {
            console.log("cb");
            cb(error, data);
        });
    }
}

module.exports = Bot
