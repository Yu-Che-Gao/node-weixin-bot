const request = require('request');
const queryString = require('querystring');
const fs = require('fs');
const xml2js = require('xml2js');
const parseXML = xml2js.parseString;
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

var timeStamp = Math.round(new Date().getTime() / 1000);
var uuid = '';

function getRandom(minNum, maxNum) {	//取得 minNum(最小值) ~ maxNum(最大值) 之間的亂數
    return Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
}

app.set('view engine', 'pug');
app.get('/login', (req, res) => {
    request.post({ url: 'https://login.weixin.qq.com/jslogin', form: { appid: 'wx782c26e4c19acffb', fun: 'new', lang: 'zh_CN', _: timeStamp } }, function (err, httpResponse, body) {
        // console.log(body);
        uuid = body.split('"')[1].trim();
        // console.log(uuid);
        res.render('login', { qrcodeURL: 'https://login.weixin.qq.com/qrcode/' + uuid + '?t=webwx' });
    });
});

app.get('/correct_login', (req, res) => {
    timeStamp = Math.round(new Date().getTime() / 1000);
    request('https://login.weixin.qq.com/cgi-bin/mmwebwx-bin/login?tip=0&uuid=' + uuid + '&r=' + Date.now(), (error, response, body) => {
        console.log('body: ' + body);
        let redirectUri = body.split('"')[1].trim();
        console.log('dddddd: ' + redirectUri);

        let query = redirectUri.split('?')[1];
        console.log('query: ' + query);
        let ticket = queryString.parse(query).ticket;
        let uuid = queryString.parse(query).uuid;
        let lang = queryString.parse(query).lang;
        let scan = queryString.parse(query).scan;

        request(redirectUri + '&fun=new', (error, response, body) => {
            // console.log(body);
            parseXML(body, (err, result) => {
                let baseRequest = {
                    'BaseRequest': {
                        'Uin': result.error.wxuin[0],
                        'Sid': result.error.wxsid[0],
                        'Skey': result.error.skey[0],
                        'DeviceID': 'e' + ('' + Math.random().toFixed(15)).substring(2, 17)
                    }
                }

                request({
                    url: 'https://web.wechat.com/cgi-bin/mmwebwx-bin/webwxinit?r=' + Date.now() + '&lang=en_US&pass_ticket=' + result.error.pass_ticket[0],
                    method: 'POST',
                    json:baseRequest
                }, (error, response, body) => {
                    res.send(body);
                });
            });
        });
    });
});

app.listen(port, () => { console.log('listening on port ' + port) });


