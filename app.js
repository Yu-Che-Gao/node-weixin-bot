const request = require('request');
const queryString = require('querystring');
const fs = require('fs');
const xml2js = require('xml2js');
const parseXML = xml2js.parseString;
const express = require('express');
const app = express();
const wxBotLib = require('./weixin-bot-lib.js');
const port = process.env.PORT || 3000;

var uuid = '';

app.set('view engine', 'pug');
app.get('/login', (req, res) => {
    request.post({ url: 'https://login.weixin.qq.com/jslogin', form: { appid: 'wx782c26e4c19acffb', fun: 'new', lang: 'zh_CN', _: timeStamp } }, function (err, httpResponse, body) {
        uuid = body.split('"')[1].trim();
        res.render('login', { qrcodeURL: 'https://login.weixin.qq.com/qrcode/' + uuid + '?t=webwx' });
    });
});

app.get('/correct_login', (req, res) => {
    wxBotLib.wxLogin(uuid, (loginResponse) => {
        wxBotLib.wxLoginRedirect(loginResponse, (redirectResponse) => {
            wxBotLib.xmlParser(redirectResponse, (xmlParse) => {
                let baseRequest = {
                    'BaseRequest': {
                        'Uin': xmlParse.error.wxuin[0],
                        'Sid': xmlParse.error.wxsid[0],
                        'Skey': xmlParse.error.skey[0],
                        'DeviceID': 'e' + ('' + Math.random().toFixed(15)).substring(2, 17)
                    }
                };

                wxBotLib.wxInit(baseRequest, xmlParse, (initResponse) => {
                    res.send(initResponse);
                })
            })
        })
    })
});

app.listen(port, () => { console.log('listening on port ' + port) });
