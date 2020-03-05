/**
 * 体验地址的游戏信息
 * @type {{gameID: number, channel: string, platform: string, gameVersion: number, appKey: string, secret: string, userName: string, mxaNumer: number}}
 */
var obj = {

    gameID: 217235,
    channel: 'Matchvs',
    platform: 'alpha',//  'platform' 本地调试,
    gameVersion: 1,
    appKey: '33f92f5f7f9d43e898e95adbed5d08a4#C',
    sectet: "0b6213572fbf4eaf8338366fad2fb6b8",
    mxaNumer:3,
    //password:0jBm9#sh
    HttpUrl:  "https://vsopen.matchvs.com/wc5/getGameData.do?",
};

module.exports = obj;