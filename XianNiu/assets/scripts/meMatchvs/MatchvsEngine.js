var mvs = require("Matchvs");
var examplesData = require('ExamplesData');
let playerInfo = require('../data/PlayerInfo');

function MatchvsEngine() {
}

/**
 * 初始化
 * @param channel 渠道 例如Matchvs
 * @param platform 平台 例如'alpha ,release'
 * @param gameID 游戏ID
 */
MatchvsEngine.prototype.init = function (channel, platform, gameID) {
    var result = mvs.engine.init(mvs.response,channel,platform,gameID,examplesData.appKey,examplesData.gameVersion);
    console.log("初始化result"+result);
    return result;
}

/**
 * 注册
 * @returns {number|*}
 */
MatchvsEngine.prototype.registerUser = function() {
    var result = mvs.engine.registerUser();
    console.log("注册result"+result);
    return result;
};

/**
 * 注册
 * @param userID
 * @param token
 * @returns {DataView|*|number|void}
 */
MatchvsEngine.prototype.login = function(userID,token){
    var DeviceID = 'matchvs';
    var result = mvs.engine.login(userID,token,examplesData.gameID,DeviceID,);
    console.log("登录result"+result);
    return result;
};

/**
 * 随机匹配
 * @param mxaNumer 房间最大人数
 * @returns {number}
 */
MatchvsEngine.prototype.joinRandomRoom = function(mxaNumer, userProfile){
    var result = mvs.engine.joinRandomRoom(mxaNumer,JSON.stringify(userProfile));
    console.log("---------------------------------------------");
    console.log("随机匹配result"+result);
    return result;
};

/**
 * 关闭房间
 * @returns {number}
 */
MatchvsEngine.prototype.joinOver = function(){
    var result = mvs.engine.joinOver("关闭房间");
    console.log("joinOver result"+result);
    return result;
};

/**
 * 发送消息
 * @param msg
 * @returns {*}
 */
MatchvsEngine.prototype.sendEvent = function (msg) {
    let data =  mvs.engine.sendEvent(msg);
    return data.result;
};


/**
 * 离开房间
 * @returns {*|void|number}
 */
MatchvsEngine.prototype.leaveRoom = function () {
    // var obj = {name:Glb.name,profile:'主动离开了房间'};
    var result = mvs.engine.leaveRoom('离开房间');
    // console.log(Glb.name+"主动离开房间result"+result);
    return result;
};

MatchvsEngine.prototype.logout = function () {
    var result = mvs.engine.logout('注销');
    return result;
};


/**
 * 离开房间
 * @returns {*|void|number}
 */
MatchvsEngine.prototype.unInit = function () {
    // var obj = {name:Glb.name,profile:'主动离开了房间'};
    var result = mvs.engine.uninit();
    // console.log(Glb.name+"主动离开房间result"+result);
    return result;
};

/**
 * 创建房间
 * @param roomName
 * @param roomPropety
 * @param maxPlayer
 * @param userProfile
 */
MatchvsEngine.prototype.creatRoom = function(roomName, roomPropety, maxPlayer, userProfile){
    let defaultRoomInfo = new MsCreateRoomInfo(roomName,3,maxPlayer,1,1,roomPropety);
    let result = mvs.engine.createRoom(defaultRoomInfo, userProfile);
    console.log("创建房间"+result);
    return result;
};

/**
 * 获取房间详细信息
 * @param roomID
 */
MatchvsEngine.prototype.getRoomDetail = function(roomID){
    let result = mvs.engine.getRoomDetail(roomID);
    return result;
};

/**
 * 发送消息
 * msgType	number	消息发送类型：0表示转发给其他玩家；1表示转发给game server；2表示转发给其他玩家及game server	2
 * data	    string	发送内容	"hello"
 * destType	number	发送目标类型：0表示发送目标为userIDs；1表示发送目标为除userIDs以外的房间其他人	0
 * userIDs	Array	发送目标	[12345]
 * @param msg
 * @returns {*}
 */
MatchvsEngine.prototype.sendEventEx = function (msgType,msg,destType) {
    let data =  mvs.engine.sendEventEx(msgType,JSON.stringify(msg),destType,[playerInfo.userId]);
    return data.result;
};




module.exports = MatchvsEngine;