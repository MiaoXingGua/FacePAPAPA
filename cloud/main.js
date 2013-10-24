// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
//var user = require(cloud/user.js);

// 创建AV.Object子类.
var UserInfo = AV.Object.extend("UserInfo");

AV.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

//生成guid
function newGuid()
{
    var guid = "";
    for (var i = 1; i <= 32; i++){
        var n = Math.floor(Math.random()*16.0).toString(16);
        guid +=   n;
        if((i==8)||(i==12)||(i==16)||(i==20))
            guid += "-";
    }
    return guid;
}


//全新注册
AV.Cloud.define('register', function(request, response) {

    register(response,10,null);

});

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
                response.success(username);
            },
            error: function(user, error) {
//                success = false;
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
        response.success('success');
    }, function(error) {
        // The file either could not be read, or could not be saved to AV.
        response.error(error);
    });
});