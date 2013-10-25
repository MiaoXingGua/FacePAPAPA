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

    console.log('注册');
    register(request,response,10,null);

});

var register = function(request,response,count,error)
{
    if (count<=0) response.error(error);

    var username = newGuid();
    var email = username + "@qq.com";

    if (username && password && email)
    {
        var user = new AV.User();
        user.set("username",username);
        user.set("password", password);
        user.set("email", email);

        user.signUp(null, {
            success: function(user) {
                //注册云通信

                cloopenSignUp(request, response, user);
            },
            error: function(user, error) {

                register(response,--count,error);
            }
        });
    }
}

var password = "qweqwe123";

//登录
AV.Cloud.define('login', function(request, response) {

    console.log('login');
    var username = request.params.username;

    register(username, response);


});

var login = function(username, response)
{
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
}

var currentUser = AV.User.current();

//更新头像
AV.Cloud.define('uploadHeaderView', function(request, response) {

    if (currentUser)
    {
        // 允许用户使用应用
        var base64 = request.params.headView;
        var headViewFile = new AV.File("headView.png", { base64: base64 });
        headViewFile.save().then(function() {
            currentUser.headView = headViewFile;
            return currentUser.save();

        }).then(function(){

                response.success('success');

            }, function(error) {

                response.error(error);
            });
    }
    else
    {
        //缓存用户对象为空时， 可打开用户注册界面…
        response.error('请先登录');
    }
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

//AV.Cloud.define('cloopen', function(request, response)
//{
//    var username = newGuid();
//    console.log('cloopen');
//    cloopenSignUp(request,response,username);
//});

//注册云通讯
var cloopenSignUp = function(request, response, user)
{
    console.log('注册云通讯');

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

    var bodyxml = '<?xml version="1.0" encoding="utf-8"?><SubAccount><appId>aaf98f894032b2370140482ac6dc00a8</appId><friendlyName>' + user.get('username') + '</friendlyName><accountSid>aaf98f894032b237014047963bb9009d</accountSid></SubAccount>';
//    console.log('body:' + bodyxml);

// console.log('url:https://sandboxapp.cloopen.com:8883/2013-03-22/Accounts/aaf98f894032b237014047963bb9009d/SubAccounts?sig='+sig.toUpperCase());
// response.success('body:'+bodyxml);
// response.success('https://sandboxapp.cloopen.com:8883/2013-03-22/Accounts/aaf98f894032b237014047963bb9009d/SubAccounts?sig='+sig.toUpperCase()),
//

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

//            var xml = '<data>'+httpResponse.text+'<guid>'+username+'</guid>'+'</data>';
//            console.log(xml);

            parseString(httpResponse.text, function (error, result) {
                if (result)
                {
//                    console.log( '类型' +typeof (result) );
                    cloopen2avos(request, response, user,result);
                }
                else
                {
                    console.error('Request failed with response code ' + httpResponse.text);
                    response.error('Request failed with response code ' + error);
                }
            });

        },
        error:function(httpResponse) {

            console.error('Request failed with response code ' + httpResponse.text);
            response.error('Request failed with response code ' + httpResponse.status);
        }
    });
}

var cloopen2avos = function(request, response, user, xmppInfo)
{
    console.log();
    var subAccountSid = xmppInfo.Response.SubAccount[0].subAccountSid[0];
    var subToken = xmppInfo.Response.SubAccount[0].subToken[0];
    var voipAccount = xmppInfo.Response.SubAccount[0].voipAccount[0];
    var voipPwd = xmppInfo.Response.SubAccount[0].voipPwd[0];

//    console.log('subAccountSid  :  '+subAccountSid);
//    console.log('subToken  :  '+subToken);
//    console.log('voipAccount  :  '+voipAccount);
//    console.log('voipPwd  :  '+voipPwd);

    if (subAccountSid && subToken && voipAccount && voipPwd)
    {


        var userInfo = new UserInfo();
        userInfo.set("user", user);
        userInfo.set("subAccountSid", subAccountSid);
        userInfo.set("subToken", subToken);
        userInfo.set("voipAccount", voipAccount);
        userInfo.set("voipPwd", voipPwd);
        userInfo.save().then(function() {
            console.log('userInfo成功');
            user.set("userInfo",userInfo);
            return user.save();

            }).then(function() {
                console.log('user成功');
                response.success(user.get('username'));

            }, function(error) {

                console.error('Request failed with response code ' + xmppInfo);
                response.error('Request failed with response code ' + xmppInfo);

            });
    }
    else
    {
        console.error('Request failed with response code ' + xmppInfo);
        response.error('Request failed with response code ' + xmppInfo);
    }

}
