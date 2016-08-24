const request = require('request');
const express = require('express');
const app = express();
const wxBotLib = require('./weixin-bot-lib.js');
const port = process.env.PORT || 3000;

var uuid = '';

app.set('view engine', 'pug');
app.get('/login', (req, res) => {
    request.post({ url: 'https://login.weixin.qq.com/jslogin', form: { appid: 'wx782c26e4c19acffb', fun: 'new', lang: 'zh_TW', _: Date.now() } }, function (err, httpResponse, body) {
        uuid = body.split('"')[1].trim();
        res.render('login', { qrcodeURL: 'https://login.weixin.qq.com/qrcode/' + uuid + '?t=webwx' });
    });
});

app.get('/correct_login', (req, res) => {
    wxBotLib.wxLogin(uuid, (loginResponse) => {
        wxBotLib.wxLoginRedirect(loginResponse, (redirectResponse) => {
            console.log(redirectResponse);
            wxBotLib.xmlParser(redirectResponse, (xmlParse) => {
                let baseRequest = {
                    'BaseRequest': {
                        'Uin': xmlParse.error.wxuin[0],
                        'Sid': xmlParse.error.wxsid[0],
                        'Skey': xmlParse.error.skey[0],
                        'DeviceID': 'e' + ('' + Math.random().toFixed(15)).substring(2, 17)
                    }
                };

                let passTicket = xmlParse.error.pass_ticket[0];
                wxBotLib.wxInit(baseRequest, passTicket, (initResponse) => {
                    wxBotLib.wxGetContact(baseRequest, passTicket, baseRequest.Skey, (contactData) => {
                        let memberList = contactData.MemberList;
                        let groupList = memberList.filter((obj) => {
                            if (obj.NickName == 'testgood') return true;
                            else return false;
                        })

                        // res.send(groupList[0].UserName);
                        let userName = groupList[0].UserName;
                        
                        console.log('userName: ' + userName);

                        let sendMsgRequest = {
                            baseRequest,
                            'Msg': {
                                'Type': 1,
                                'Content': 'hihi, 我是高宇哲',
                                'FromUserName': initResponse.User.UserName,
                                'ToUserName': userName,
                                'LocalID': (Date.now() + Math.random().toFixed(3)).replace('.', ''),
                                'ClienMsgID': (Date.now() + Math.random().toFixed(3)).replace('.', '')
                            }
                        };

                        request({
                            url: 'https://web.wechat.com/cgi-bin/mmwebwx-bin/webwxsendmsg?pass_ticket=' + passTicket,
                            method: 'POST',
                            json: sendMsgRequest
                        }, (error, response, body) => {
                            res.send(body);
                        })
                    })
                })
            })
        })
    })
});

app.listen(port, () => { console.log('listening on port ' + port) });
