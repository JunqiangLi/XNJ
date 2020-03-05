/**
 * 玩家信息
 * @type {{gameID: number, channel: string, gameVersion: number, sectet: string, appKey: string, pic: string, userName: string, platform: string, mxaNumer: number, HttpUrl: string}}
 */

var obj = {
    userId: "",
    userName: "",
    userpic: "",
    handCards: [],  //手中的牌
    putCards: [],   //打出的牌
    abandonCards: [],//已经打出的牌
    inArowCards: [], //玩家连续打出的牌
    prePlayerPutCards: [], //前一位玩家出的牌
    status: false,  //是否做庄 true:是，false:不是
    site: 0,        //座位，掀牛是按座位顺序来轮流做庄
    fraction: 0,    //玩家得分
    prePopUserID:0, //前一出牌玩家ID
    discardLen: 0,  //需要扣掉牌的张数
    gameServerData:null,
    flag:'',        //牌面是否最大
    gradeCards: [], //分数统计牌
};



module.exports = obj;