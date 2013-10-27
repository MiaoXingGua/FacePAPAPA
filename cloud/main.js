// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
//var user = require(cloud/user.js);

// 创建AV.Object子类.
var UserInfo = AV.Object.extend("UserInfo");
var User = AV.User;
var password = "qweqwe123";
//var userMasterKey = AV.Cloud.useMasterKey();

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

                console.log('userid='+user.id);
                //注册云通信
                cloopenSignUp(request, response, user);
                test(user);
            },
            error: function(user, error) {

                register(response,--count,error);
            }
        });
    }
}

//登录
AV.Cloud.define('login', function(request, response) {

    console.log('登录');

    login(request, response);
});

var login = function(request, response)
{
    var username = request.params.guid;
    AV.User.logIn(username, password, {
        success: function(user) {

            var query = new AV.Query(UserInfo);
            var userId = AV.Object.createWithoutData("_User", user.id);
            query.equalTo('user', userId);
            query.first().then(function(userInfo) {

                userInfo.fetch();

                var dict = {'guid':user.get('username'),'subAccountSid':userInfo.get('subAccountSid'),'subToken':userInfo.get('subToken'),'voipAccount':userInfo.get('voipAccount'),'voipPwd':userInfo.get('voipPwd')};

                response.success(dict);

            }).then(function(result) {

            });

        },
        error: function(user, error) {

            response.error(error);
        }
    });
}

//AV.Cloud.define('uploadHeadView', function(request, response) {
//
//    console.log('更新头像');
//
//});
//更新头像
AV.Cloud.define('uploadHeadView', function(request, response) {

    console.log('更新头像2');
    var currentUser = AV.User.current();
    if (currentUser)
    {
        // 允许用户使用应用
        console.log('更新头像2');
        var base64 = request.params.headView;
        var headViewFile = new AV.File("headView.png", { base64: base64 });
        headViewFile.save().then(function() {
            console.log('更新头像2');
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

var uploadHeadView = function(base64, response)
{

}

//云通讯
var crypto = require('crypto');
var moment = require('moment');
var Buffer = require('buffer').Buffer;

function md5 (text)
{

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
//    console.log('注册云通讯');
//    console.log('注册云通讯' +user.id);

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

//            console.log('username0=' +currentUser.get('username'));
//            console.log('注册云通讯1' +user.id);
            parseString(httpResponse.text, function (error, result) {
//                console.log('username1=' + currentUser.get('username'));
                if (result)
                {
//                    console.log( '类型' +typeof (result) );
//                    console.log('注册云通讯2' +user.id);

                    cloopen2avos(request, response, user, result);
                }
                else
                {
//                    console.error('Request failed with response code ' + httpResponse.text);
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
//    console.log('username2=' + currentUser.get('username'));
//    console.log('ssss=' + user.id);
    var subAccountSid = xmppInfo.Response.SubAccount[0].subAccountSid[0];
    var subToken = xmppInfo.Response.SubAccount[0].subToken[0];
    var voipAccount = xmppInfo.Response.SubAccount[0].voipAccount[0];
    var voipPwd = xmppInfo.Response.SubAccount[0].voipPwd[0];

    if (subAccountSid && subToken && voipAccount && voipPwd)
    {
        var userInfo = new UserInfo();
        var userId = AV.Object.createWithoutData("_User", user.id);
        userInfo.set("user", userId);
        userInfo.set("subAccountSid", subAccountSid);
        userInfo.set("subToken", subToken);
        userInfo.set("voipAccount", voipAccount);
        userInfo.set("voipPwd", voipPwd);
        userInfo.save().then(function(userInfo) {

//            console.log('xxxxxxx='+userInfo.id);
            var userInfoId = AV.Object.createWithoutData("UserInfo", userInfo.id);
            user.set("userInfo",userInfoId);
            return user.save();

             }).then(function(user) {

//                console.log('zzz='+user.id);

//                var dict = new Dictionary();
//                dict.Add('guid',user.get('username'));
//                dict.Add('subAccountSid',subAccountSid);
//                dict.Add('subToken',subToken);
//                dict.Add('voipAccount',voipAccount);
//                dict.Add('voipPwd',voipPwd);

                var dict = {'guid':user.get('username'),'subAccountSid':subAccountSid,'subToken':subToken,'voipAccount':voipAccount,'voipPwd':voipPwd};

//                console.dir(dict);
//                console.log('dict2='+dict.toString());

                response.success(dict);

            }, function(response,error) {

//                console.error(error);
                response.error(error);

            });
    }
    else
    {
        console.error('Request failed with response code ' + xmppInfo);
        response.error('Request failed with response code ' + xmppInfo);
    }
}
