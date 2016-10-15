'use strict'
const EventEmitter = require('events').EventEmitter;
const request = require('request');
const rp = require('request-promise');
const config = require('../config/environment');

const WIT_TOKEN = config.wit.token;
const FACEBOOK_PAGE_ID = config.facebook.pageId;
const FACEBOOK_ACCESS_TOKEN = config.facebook.pageToken;


const GOOGLE_TREND_REQUESTS = [
  //E-antrieb (0.Elektroantrieb)
  "https://www.google.com/trends/api/widgetdata/comparedgeo?hl=de&tz=-120&req=%7B%22geo%22:%7B%22country%22:%22DE%22%7D,%22comparisonItem%22:%5B%7B%22time%22:%222015-10-14+2016-10-14%22,%22complexKeywordsRestriction%22:%7B%22keyword%22:%5B%7B%22type%22:%22BROAD%22,%22value%22:%22Elektroantrieb%22%7D%5D%7D%7D%5D,%22resolution%22:%22REGION%22,%22locale%22:%22de%22,%22requestOptions%22:%7B%22property%22:%22%22,%22backend%22:%22IZG%22,%22category%22:0%7D%7D&token=APP6_UEAAAAAWAKk4DV0ELeIE2D6OiIcpz-WYP8nTtlg",

  //Modell (0.Audi A3,1. Audi A4,2. Audi A5,3. Audi A6,4. Audi A8)
  "https://www.google.com/trends/api/widgetdata/comparedgeo?hl=de&tz=-120&req=%7B%22geo%22:%7B%22country%22:%22DE%22%7D,%22comparisonItem%22:%5B%7B%22time%22:%222015-10-14+2016-10-14%22,%22complexKeywordsRestriction%22:%7B%22keyword%22:%5B%7B%22type%22:%22BROAD%22,%22value%22:%22Audi+A3%22%7D%5D%7D%7D,%7B%22time%22:%222015-10-14+2016-10-14%22,%22complexKeywordsRestriction%22:%7B%22keyword%22:%5B%7B%22type%22:%22BROAD%22,%22value%22:%22Audi+A4%22%7D%5D%7D%7D,%7B%22time%22:%222015-10-14+2016-10-14%22,%22complexKeywordsRestriction%22:%7B%22keyword%22:%5B%7B%22type%22:%22BROAD%22,%22value%22:%22Audi+A5%22%7D%5D%7D%7D,%7B%22time%22:%222015-10-14+2016-10-14%22,%22complexKeywordsRestriction%22:%7B%22keyword%22:%5B%7B%22type%22:%22BROAD%22,%22value%22:%22Audi+A6%22%7D%5D%7D%7D,%7B%22time%22:%222015-10-14+2016-10-14%22,%22complexKeywordsRestriction%22:%7B%22keyword%22:%5B%7B%22type%22:%22BROAD%22,%22value%22:%22Audi+A8%22%7D%5D%7D%7D%5D,%22resolution%22:%22REGION%22,%22locale%22:%22de%22,%22requestOptions%22:%7B%22property%22:%22%22,%22backend%22:%22IZG%22,%22category%22:0%7D%7D&token=APP6_UEAAAAAWAKCEKtXGLXQUxUCNDsWZ6Ckg1ycXtwY",

  //Color (0.grau,1.schwarz,2.silber,3.weiß,4.blau)
  "https://www.google.com/trends/api/widgetdata/comparedgeo?hl=de&tz=-120&req=%7B%22geo%22:%7B%22country%22:%22DE%22%7D,%22comparisonItem%22:%5B%7B%22time%22:%222015-10-14+2016-10-14%22,%22complexKeywordsRestriction%22:%7B%22keyword%22:%5B%7B%22type%22:%22BROAD%22,%22value%22:%22grau%22%7D%5D%7D%7D,%7B%22time%22:%222015-10-14+2016-10-14%22,%22complexKeywordsRestriction%22:%7B%22keyword%22:%5B%7B%22type%22:%22BROAD%22,%22value%22:%22schwarz%22%7D%5D%7D%7D,%7B%22time%22:%222015-10-14+2016-10-14%22,%22complexKeywordsRestriction%22:%7B%22keyword%22:%5B%7B%22type%22:%22BROAD%22,%22value%22:%22silber%22%7D%5D%7D%7D,%7B%22time%22:%222015-10-14+2016-10-14%22,%22complexKeywordsRestriction%22:%7B%22keyword%22:%5B%7B%22type%22:%22BROAD%22,%22value%22:%22wei%C3%9F%22%7D%5D%7D%7D,%7B%22time%22:%222015-10-14+2016-10-14%22,%22complexKeywordsRestriction%22:%7B%22keyword%22:%5B%7B%22type%22:%22BROAD%22,%22value%22:%22blau%22%7D%5D%7D%7D%5D,%22resolution%22:%22REGION%22,%22locale%22:%22de%22,%22requestOptions%22:%7B%22property%22:%22%22,%22backend%22:%22IZG%22,%22category%22:0%7D%7D&token=APP6_UEAAAAAWAKCSYGsUt0IubnDQ9dnr5xaN13xpUSU",

  //Getriebe (0.Schaltgetriebe, 1.Automatik)
  "https://www.google.com/trends/api/widgetdata/comparedgeo?hl=de&tz=-120&req=%7B%22geo%22:%7B%22country%22:%22DE%22%7D,%22comparisonItem%22:%5B%7B%22time%22:%222015-10-14+2016-10-14%22,%22complexKeywordsRestriction%22:%7B%22keyword%22:%5B%7B%22type%22:%22BROAD%22,%22value%22:%22Schaltgetriebe%22%7D%5D%7D%7D,%7B%22time%22:%222015-10-14+2016-10-14%22,%22complexKeywordsRestriction%22:%7B%22keyword%22:%5B%7B%22type%22:%22BROAD%22,%22value%22:%22Automatikgetriebe%22%7D%5D%7D%7D%5D,%22resolution%22:%22REGION%22,%22locale%22:%22de%22,%22requestOptions%22:%7B%22property%22:%22%22,%22backend%22:%22IZG%22,%22category%22:0%7D%7D&token=APP6_UEAAAAAWAKCbziAm-Y3yAkfs2ahCv3_Wc_kXKtv",

  //Sitzheizung
  "https://www.google.com/trends/api/widgetdata/comparedgeo?hl=de&tz=-120&req=%7B%22geo%22:%7B%22country%22:%22DE%22%7D,%22comparisonItem%22:%5B%7B%22time%22:%222015-10-14+2016-10-14%22,%22complexKeywordsRestriction%22:%7B%22keyword%22:%5B%7B%22type%22:%22BROAD%22,%22value%22:%22sitzheizung%22%7D%5D%7D%7D%5D,%22resolution%22:%22REGION%22,%22locale%22:%22de%22,%22requestOptions%22:%7B%22property%22:%22%22,%22backend%22:%22IZG%22,%22category%22:0%7D%7D&token=APP6_UEAAAAAWAKCsn0ZoHRGJwNIrUKE86ogzm3zvXhd",

  //Navigation
  "https://www.google.com/trends/api/widgetdata/comparedgeo?hl=de&tz=-120&req=%7B%22geo%22:%7B%22country%22:%22DE%22%7D,%22comparisonItem%22:%5B%7B%22time%22:%222015-10-14+2016-10-14%22,%22complexKeywordsRestriction%22:%7B%22keyword%22:%5B%7B%22type%22:%22BROAD%22,%22value%22:%22Navigationssystem%22%7D%5D%7D%7D%5D,%22resolution%22:%22REGION%22,%22locale%22:%22de%22,%22requestOptions%22:%7B%22property%22:%22%22,%22backend%22:%22IZG%22,%22category%22:0%7D%7D&token=APP6_UEAAAAAWAKC4zeaeH97XxREV2C-IqQe3KNxlIgO",

  //Allrad
  "https://www.google.com/trends/api/widgetdata/comparedgeo?hl=de&tz=-120&req=%7B%22geo%22:%7B%22country%22:%22DE%22%7D,%22comparisonItem%22:%5B%7B%22time%22:%222015-10-14+2016-10-14%22,%22complexKeywordsRestriction%22:%7B%22keyword%22:%5B%7B%22type%22:%22BROAD%22,%22value%22:%22Allrad%22%7D%5D%7D%7D%5D,%22resolution%22:%22REGION%22,%22locale%22:%22de%22,%22requestOptions%22:%7B%22property%22:%22%22,%22backend%22:%22IZG%22,%22category%22:0%7D%7D&token=APP6_UEAAAAAWAKC-VDBk6nfg5qGb8zHoiyNa7kk0lz_"
];

const ML_ENDPOINTS = [{
  "name": "Elektroantrieb",
  "url": "https://europewest.services.azureml.net/workspaces/ae27c32fe7da4c589892bda2373629c3/services/2cd88bb71cd84474b26bcc319fab5c80/execute?api-version=2.0&details=true",
  "token": "jpILvYxeXOf9iy0LvHoIgJkKoYq+4nT8TVGf6nwBmrsFKNQUh+q1Q+NjueQBGlBHifV1d/ueIoWtlEdNeEfdzg=="
}, {
  "name": "Farbe",
  "url": "https://europewest.services.azureml.net/workspaces/ae27c32fe7da4c589892bda2373629c3/services/1b21057fa8fa466d9f3a299734e977d7/execute?api-version=2.0&details=true",
  "token": "/G02jlz+6eOPytDAzUkf7aqIhAjme1XODIByEoGgvvaWXHOiU2C4KD5MhQpEaO6tdH+5bLtMhQ0y+KTKDX3CiA==",
}, {
  "name": "Sitzheizung",
  "url": "https://europewest.services.azureml.net/workspaces/ae27c32fe7da4c589892bda2373629c3/services/9ebbecbd3b9c4ed5a91abb705d8d7ee5/execute?api-version=2.0&details=true",
  "token": "TA/H56aqCju447kv7pjVosZi7/Xz8WkAnP3py+IgyIcpT4dBVWDdgwLL1x1UB1HFWvvz9ICNVsZzWXf5j/i+Mw=="
}, {
  "name": "Getriebe",
  "url": "https://europewest.services.azureml.net/workspaces/ae27c32fe7da4c589892bda2373629c3/services/19d165b2e6dc43f886ac75c161fb523f/execute?api-version=2.0&details=true",
  "token": "vajOo8+fd8y6yI5kADEqmRCiwDgSw+YDncek3m3K7QvdCGvyzvOZDXTY7i9T1szhenECzbHl1BCcFoo7lGjEPA=="
}, {
  "name": "Audi Connect",
  "url": "https://europewest.services.azureml.net/workspaces/ae27c32fe7da4c589892bda2373629c3/services/da4f84e9e98a469f9f3d38585a1fdd30/execute?api-version=2.0&details=true",
  "token": "13t2N7fM1/GgDKqor1IVcYdZj/qnt5r+dIukxZQYsHpV1Ol61oP9/Hloo+dukyo2smP9PRnXdI0cvPhioUCaSg==",
}, {
  "name": "Quattro",
  "url": "https://europewest.services.azureml.net/workspaces/ae27c32fe7da4c589892bda2373629c3/services/bd75f7d9da9c4759be2c423b31e0b6e2/execute?api-version=2.0&details=true",
  "token": "yW8DGGs6JqA8zVQon6dqUoT4B24UBIe/Z0CG3oh7mYH1Ys+Kboo3CnBKXTahdyaPkyu/WyD8VrlDbBUw5duryA==",
}, ];

const sendMessage = (recipient, payload, cb) => {
  const data = {
    recipient: {
      id: recipient
    },
    message: {
      text: payload
    }
  };
  console.log("sendMessage...: ", data);
  if (!cb) cb = Function.prototype
  request({
    method: 'POST',
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: FACEBOOK_ACCESS_TOKEN
    },
    json: data
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
    sessions[sessionId] = {
      fbid: fbid,
      context: {}
    };
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
        console.log("query['hub.verify_token']: ", query['hub.verify_token']);
        console.log("Token: ", token);
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
              const location = event.message.attachments[0].payload.coordinates;
              const url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + location.lat + ',' + location.long + '&key=AIzaSyAP9LtK43pDNnsUfs4AlOSeryHjpCTbZKw';

              sendMessage(
                senderId,
                'Danke, dein Standort wird gespeichert ...'
              );

              request({
                url: url,
                method: 'GET'
              }, function(error, response, body) {
                if (error) {
                  console.log('Error sending message: ', error);
                } else {
                  const data = JSON.parse(body);
                  var state = "";
                  data.results[0].address_components.forEach(function(component)  {
                    if (component.types.includes('administrative_area_level_1')) {
                      state = component.long_name;
                    }
                  });
                  // Received an attachment
                  sendMessage(
                    senderId,
                    'Du bist in ' + state + '. Für welches Model interessierst du dich?'
                  );
                  sessions[sessionId].context.state = state;
                }
              });

            } else if (event.message && event.message.text) {
              var commands = [{
                name: 'A3',
                alternatives: ['a3', 'Audi A3', 'AUDI A3'],
                fn: function(term) {
                  if (sessions[sessionId] && sessions[sessionId].context && sessions[sessionId].context.state) {
                    self.predict(sessions[sessionId].context.state, term).then((response) => {
                      sendMessage(
                        senderId,
                        JSON.stringify(response)
                      );
                    });
                  }
                }
              }];

              var cases = {};
              commands.forEach(function(c, index) {
                cases[c.name] = c.fn;
                c.alternatives.forEach(function(a, index) {
                  cases[a] = c.fn;
                });
              });

              if (cases[event.message.text]) {
                cases[event.message.text](event.message.text);
              }

              // received a text message
              sendMessage(
                senderId,
                JSON.stringify(sessions[sessionId].context)
              );
            } else if (event.payload) {
              // received payload data
            } else if (event.delivery) {
              // received delivery message
            } else {
              // don't know the command
            }
          }
        });
      })
      res.json({
        status: 'ok'
      });
    }
  }

  predict(state, model) {
    var self = this;
    var columnNames = ["id", "date", "year", "color", "getriebe", "Sitzheizung", "audiconnect", "allrad", "E-antrieb"];
    var values = ["0", "value", "0", "value", "value", "0", "0", "0", "0"];

    return this._fetchGoogleTrends().then(function(trends) {
      trends.forEach(function(trend) {
        var index = 0;
        trend.default.geoMapData.forEach(function(entry, i)  {
          if (entry.geoName === state) {
            index = i;
          }
        });

        values = values.concat(trend.default.geoMapData[index].value);

      });

      values.push(state);
      values.push(model);

      columnNames.push("t_antrieb_e", "t_m_a3", "t_m_a4", "t_m_a5", "t_m_a6", "t_m_a8", "t_color_gray", "t_color_black", "t_color_silver", "t_color_white", "t_color_blue", "t_g_schalt", "t_g_auto", "t_sitzheizung", "t_connect", "t_allrad", "location", "modell");

      const input = {
        "Inputs": {
          "input1": {
            "ColumnNames": columnNames,
            "Values": [values]
          }
        },
        "GlobalParameters": {}
      };

      return self._fetchPrediction(input);
    });
  }

  _fetchGoogleTrends() {
    const promises = GOOGLE_TREND_REQUESTS.map(function(URL) {
      const options = {
        uri: URL,
        json: true
      };
      return rp(options);
    });
    return Promise.all(promises).then(function(responses) {
      return responses = responses.map(function(response) {
        return JSON.parse(response.substring(6));
      });
    });
  }

  _fetchPrediction(trends) {
    const promises = ML_ENDPOINTS.map(function(endpoint) {
      const options = {
        uri: endpoint.url,
        method: 'POST',
        body: trends,
        json: true,
        headers: {
          'Authorization': 'Bearer ' + endpoint.token,
          'content-type': 'application/json'
        }
      };
      return rp(options);
    });
    return Promise.all(promises).then(function(responses) {
      return responses.map((response, index) => {
        return {
          "key": ML_ENDPOINTS[index].name,
          "value": response.Results.output1.value.Values[0].pop()
        };
      });
    });
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
        recipient: {
          id: recipientId
        },
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
      if (err) {
        cb(err);
        return;
      }
      cb(null);
    });
  }
}

module.exports = Bot
