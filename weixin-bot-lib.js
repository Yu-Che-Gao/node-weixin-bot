const request = require('request');
const queryString = require('querystring');
const xml2js = require('xml2js');
const parseXML = xml2js.parseString;

function wxLogin(uuid, callback) {
    request('https://login.weixin.qq.com/cgi-bin/mmwebwx-bin/login?tip=0&uuid=' + uuid + '&r=' + Date.now(), (error, response, body) => {
        callback(body);
    });
}

function wxLoginRedirect(redirectBody, callback) {
    let redirectUri = redirectBody.split('"')[1].trim();
    request(redirectUri + '&fun=new', (error, response, body) => {
        callback(body);
    });
}

function xmlParser(xml, callback) {
    parseXML(xml, (err, result) => {
        callback(result);
    });
}

function wxInit(baseRequest, xmlParse, callback) {
    request({
        url: 'https://web.wechat.com/cgi-bin/mmwebwx-bin/webwxinit?r=' + Date.now() + '&lang=en_US&pass_ticket=' + xmlParse.error.pass_ticket[0],
        method: 'POST',
        json: baseRequest
    }, (error, response, body) => {
        callback(body);
    });
}

exports.wxLogin = wxLogin;
exports.wxLoginRedirect = wxLoginRedirect;
exports.wxInit = wxInit;
exports.xmlParser = xmlParser;