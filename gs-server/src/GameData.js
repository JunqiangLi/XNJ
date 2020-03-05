var GameData = {
    MSG_EVENT:{
        READY:120,                  //准备游戏
        RESET_ROOM:140,             //重置房间
        SEND_CARD:177,              //发牌
        REPROT_SCORE:128,
        CLEAR_SCROE:183,
        PLAY_CARDS:130,             //出牌
        GAME_OVER_S:132,            //游戏结束
        INROOM_ISOK_S:134,          //加入指定房间的时候，确认OK了
        LIFT_CARDS:142,             //掀牌
        SHUFFLE_CARD:201,           //洗牌
        PLAYER_DISCARD:252,         //玩家扣牌
        SHUFFLE_CARD_ERROR:505,     //未满六张牌提出重开。

    },

    RSP_EVENT:{
        SEND_CARD:121,              //发牌
        REPROT_RESULT:129,          //上报分数
        RESET_OK:141,               //重置OK
        PLAY_CARDS_R:131,
        GAME_OVER_R:133,            //游戏结束
        INROOM_ISOK_R:135,          //加入指定房间时，确认OK回复，可以开始游戏。
        HOST_PUT_CARD:250,          //庄家放牌
        PLAYER_DISCARD:251,         //玩家扣牌
        HOST_REPLAY_CARD:301,       //庄家提出重新发牌
        OTHER_REPLAY_CARD:302,      //其余玩家提出洗牌，
        OTHER_REPLAY_CARD_OVER:303, //玩家胜庄家
        ROOM_DETAIL:500,            //发送玩家信息
        DISPLAY_RESULT:600,         //展示游戏结果
        CANT_REPALY_CARD:601,       //服务器拒绝玩家提出洗牌
        LIFT_HOST_CARDS:602,        //乱了（具体什么我也不清楚，掀牌之后下一玩家出牌）
    },

    Conf:{
        MAX_PLAYER_NUM : 3,//一个房间的最大人数
        MAX_LAND_SCORE:3,  //叫地主的最大分数
        DATA_STORAGE_ENV:1, //0-alpha 1-release
        RANK_NUM:10,        //保存排行榜数据人数
        APPKEY:"de7c4a439d2948d880451c25c910b239",
        SECRET:"5667067032b644c687c0a86ca9faa2d6",
        GAMEID:200787,
    },

    HttpApi:{
        RELEASE_HOST:"http://vsopen.matchvs.com",
        ALPHA_HOST:"http://alphavsopen.matchvs.com",
        SET_GAMEDATA:"/wc5/setGameData.do?",
        GET_GAMEDATA:"/wc5/getGameData.do?",
        DELETE_GAMEDATA:"/wc5/delGameData.do?",
    }
};

module.exports = GameData;