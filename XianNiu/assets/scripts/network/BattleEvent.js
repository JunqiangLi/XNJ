
/**
 * S 后缀代表 发送，R代表接收
 */
export var NetMsgEvent = {

            GAME_READY_S : 120,	//准备游戏
            GAME_READY_R : 121,				//准备响应（发牌）

            RESET_ROOM_S : 122,				//重置房间信息
            RESET_ROOM_R : 123,				//重置响应

            CALL_LAND_S : 124,				//叫地主
            CALL_LAND_RN : 125,				//没有产生地主，下一个叫地主
            CALL_LAND_RO : 126,				//产生地主，叫地主结束

            REPROT_SCORE_S : 128,			//上报分数
            REPROT_SCORE_R : 129,			//上报分数响应

            PLAY_CARDS_S : 130,				//出牌
            PLAY_CARDS_R : 131,

            GAME_OVER_S : 132,				//游戏结束上报
            GAME_OVER_R : 133,				//游戏结束响应

            GAME_IS_OKS : 134,			//回到游戏房间页面，开始倒计时
            GAME_IS_OKR : 135,
            LIFT_CARDS : 142,           //掀牌
            SHUFFLE_CARD : 201,         //洗牌
            HOST_REPLAY_CARD_R:301,     //庄家提出洗牌
            OTHER_REPLAY_CARD_R:302,    //其余玩家提出洗牌，
            OTHER_REPLAY_CARD_OVER_R:303, //玩家胜庄家

            HOST_PUT_CARD_R:250,          //庄家放牌
            PLAYER_DISCARD_R:251,         //玩家扣牌。客户端接收
            PLAYER_DISCARD_S:252,         //玩家扣牌，客户端发送
            ROOM_DETAILS:500,             //玩家信息
            DISPLAY_RESULT:600,           //展示游戏结果
            SHUFFLE_CARD_ERROR:505,       //未满六张牌提出重开
            CANT_REPALY_CARD:601,         //服务器拒绝玩家洗牌
            LIFT_HOST_CARDS:602,
};


export class BattleMsgEvent {
        constructor(){
        }
        //准备游戏
        static GAME_READY = "GameReady";

        //叫地主结束
        static CALL_LANDLORD_OVER = "CallLandLordOver";

        //下一个叫地主
        static CALL_LANDLORD_NEXT = "CallLandLordNext";

        //出牌
        static PLAYER_CARDS = "PlayerCards";

        //上报分数事件
        static REPORT_DATA = "ReportData";

        //游戏结束
        static GAME_OVER = "GameOver";

        // 进入房间，准备倒计时
        static START_THE_COUNTDOWN = "START_THE_COUNTDOWN";

        // 回到游戏大厅
        static GAME_IS_OK = "GAME_IS_OK";
}