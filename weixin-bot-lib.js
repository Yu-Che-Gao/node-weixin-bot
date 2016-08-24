const request = require('request');
const queryString = require('querystring');
const xml2js = require('xml2js');
const parseXML = xml2js.parseString;

function wxLogin(uuid, callback) {
    request({
        url:'https://login.web.wechat.com/cgi-bin/mmwebwx-bin/login?tip=0&uuid=' + uuid + '&r=' + Date.now(),
        headers: {
            'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'
        }
    }, (error, response, body) => {
        callback(body);
    });
}

function wxLoginRedirect(redirectBody, callback) {
    let redirectUri = redirectBody.split('"')[1].trim();
    console.log(redirectUri)
    request({
        url:redirectUri,
        headers:{
            'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'
        }
    }, (error, response, body) => {
        // console.log(response);
        callback(body);
    });
}

function xmlParser(xml, callback) {
    parseXML(xml, (err, result) => {
        if (err) {
            console.log(err);
            return;
        }
        callback(result);
    });
}

function wxInit(baseRequest, passTicket, callback) {
    request({
        url: 'https://web.wechat.com/cgi-bin/mmwebwx-bin/webwxinit?r=' + Date.now() + '&lang=en_US&pass_ticket=' + passTicket,
        method: 'POST',
        json: baseRequest
    }, (error, response, body) => {
        callback(body);
    });
}

function wxGetContact(baseRequest, passTicket, skey, callback) {
    request({
        url: 'https://web.wechat.com/cgi-bin/mmwebwx-bin/webwxgetcontact?pass_ticket=' + passTicket + '&skey=' + skey + '&r=' + Date.now(),
        method: 'POST',
        json: baseRequest
    }, (error, response, body) => {
        callback(body);
    })
}

exports.wxLogin = wxLogin;
exports.wxLoginRedirect = wxLoginRedirect;
exports.wxInit = wxInit;
exports.xmlParser = xmlParser;
exports.wxGetContact = wxGetContact;