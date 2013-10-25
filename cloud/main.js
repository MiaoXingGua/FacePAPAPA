// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
//var user = require(cloud/user.js);

// 创建AV.Object子类.
var UserInfo = AV.Object.extend("UserInfo");

AV.Cloud.define("hello", function(request, response) {
    console.log('hello');
    response.success("Hello world!");
});

//生成guid
function newGuid()
{
    var guid = "";
    for (var i = 1; i <= 32; i++){
        var n = Math.floor(Math.random()*16.0).toString(16);
        guid += n;
        if((i==8)||(i==12)||(i==16)||(i==20))
            guid += "-";
    }
    return guid;
}

//全新注册
AV.Cloud.define('register', function(request, response) {

    console.log('register');
    register(response,10,null);

});

//

var register = function(response,count,error)
{
    if (count<=0) response.error(error);

    var username = newGuid();
    var password = "qweqwe123";
    var email = username + "@qq.com";

    if (username && password && email)
    {
        var user = new AV.User();
        user.set("username",username);
        user.set("password", password);
        user.set("email", email);

        user.signUp(null, {
            success: function(user) {
//                success = true;
                console.log(username);
                response.success(username);
//                testCloopen() ;
            },
            error: function(user, error) {
//                success = false;
                console.log(error);
                register(response,--count,error);
            }
        });
    }
}

//登录
AV.Cloud.define('login', function(request, response) {

    var username = request.params.username;
    var password = "qweqwe123";

    AV.User.logIn(username, password, {
                  success: function(user) {
                  // Do stuff after successful login.

                      response.success(user);
                  },
                  error: function(user, error) {
                  // The login failed. Check error to see why.
                      response.error(error);
                  }
    });
});

//更新头像
AV.Cloud.define('uploadHeaderView', function(request, response) {

    var base64 = request.params.headView;
    var headViewFile = new AV.File("headView.png", { base64: base64 });
    headViewFile.save().then(function() {
                         // The file has been saved to AV.

                     }).then(function(){


                        response.success('success');

                     }, function(error) {
                         // The file either could not be read, or could not be saved to AV.
                         response.error(error);
    });
});

//云通讯
var crypto = require('crypto');
var moment = require('moment');
var Buffer = require('buffer').Buffer;

function md5 (text) {

    return crypto.createHash('md5').update(text).digest('hex');
};

function base64 (text)
{
    return new Buffer(text).toString('base64');
}

var parseString = require('xml2js').parseString;
var parse = require('xml2js').Parser();

AV.Cloud.define('cloopen', function(request, response)
{
    var username = newGuid();
    console.log('cloopen');
    cloopen(request,response,username);
});


var cloopen = function(request, response, username)
{
    var timeStr = moment().format('YYYYMMDDHHmmss');
//    console.log('timestr:' + timeStr);

    var authorizationStr = 'aaf98f894032b237014047963bb9009d'+':'+timeStr;
//    console.log('authorizationStr:' + authorizationStr);

    var authorization64 = base64(authorizationStr);
//    console.log('authorization64:' + authorization64);

    var sigstr = 'aaf98f894032b237014047963bb9009d'+'bbc381b9a024443da462307cec93ce0b'+timeStr;
//    console.log('sigstr:' + sigstr);

    var sig = md5(sigstr);
//    console.log('sig:' + sig    );

    var bodyxml = '<?xml version="1.0" encoding="utf-8"?><SubAccount><appId>aaf98f894032b2370140482ac6dc00a8</appId><friendlyName>' + username + '</friendlyName><accountSid>aaf98f894032b237014047963bb9009d</accountSid></SubAccount>';
//    console.log('body:' + bodyxml);

// console.log('url:https://sandboxapp.cloopen.com:8883/2013-03-22/Accounts/aaf98f894032b237014047963bb9009d/SubAccounts?sig='+sig.toUpperCase());
// response.success('body:'+bodyxml);
// response.success('https://sandboxapp.cloopen.com:8883/2013-03-22/Accounts/aaf98f894032b237014047963bb9009d/SubAccounts?sig='+sig.toUpperCase()),

    AV.Cloud.httpRequest({
        method: 'POST',
        url: 'https://sandboxapp.cloopen.com:8883/2013-03-22/Accounts/aaf98f894032b237014047963bb9009d/SubAccounts?sig='+sig.toUpperCase(),
        headers: {
            'Content-Type': 'application/xml;charset=utf-8',
            'Accept': 'application/xml',
            'Authorization': authorization64
        },
        body: bodyxml,
        success:function(httpResponse) {

//            console.log(httpResponse.text);
//            console.log(username);

            var xml = httpResponse.text+'<AVOS><guid>'+username+'</guid></AVOS>';

            console.log(xml);

            parseString(xml, function (error, result) {

                response.success(result);
            });

        },
        error:function(httpResponse) {

            console.error('Request failed with response code ' + httpResponse.text);
            response.error('Request failed with response code ' + httpResponse.status);
        }
    });
}