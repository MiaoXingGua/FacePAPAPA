// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:

// 创建AV.Object子类.
var UserInfo = AV.Object.extend("UserInfo");

//全新注册
//AV.Cloud.define('register', function(request, response) {
//
//    var username = request.params.username;
////    var password = request.params.password;
//    var password = "qweqwe123";
//    var email = request.params.username + "@qq.com";
//    var base64 = request.params.headView;
//
//    if (username && password && email && base64)
//    {
//
//        var file = new AV.File("headView.png", { base64: base64 });
//        file.save().then(function(file) {
//
//            // 创建该类的一个实例
//            var userInfo = new UserInfo();
//            userInfo.set("headView", file);
//            return userInfo.save();
//
//            }).then(function(userInfo) {
//
//                var user = new AV.User();
//                user.set("username", username);
//                user.set("password", password);
//                user.set("email", email);
//                return user.signUp();
//
//            }).then(function(user) {
//
//                // Everything is done!
//                response.success(user,user.get(location));
//
//            }, function(error) {
//                // This isn't called because the error was already handled.
//                alert("Error: " + error.code + " " + error.message);
//                response.error(error);
//            });
//
//    }
//});

//关联新设备

//登录
//AV.Cloud.define('login', function(request, response) {
//
//    var username = request.params.username;
//    var password = "qweqwe123";
//
//    AV.User.logIn(username, password, {
//                  success: function(user) {
//                  // Do stuff after successful login.
//                  },
//                  error: function(user, error) {
//                  // The login failed. Check error to see why.
//                  }
//    });
//});



