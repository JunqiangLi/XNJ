/**
 * Matchvs所有的回调事件绑定
 */
import Game from "../interacte/Game";
import GameButton from "../interacte/GameButton";
import {NetMsgEvent} from "../network/BattleEvent";
import result from "../interacte/result";

var engine = require('../meMatchvs/MatchvsEngine');
var response = require("../meMatchvs/MatchvsResponse");
var msg = require("../meMatchvs/MatvhsvsMessage");
var examplesData = require('../meMatchvs/ExamplesData');
let RoomInfo = require('../data/RoomInfo');
let playerInfo = require('../data/PlayerInfo');


export class MatchvsRsp{
    constructor(){

    }

    /**
     * 登陆回调
     * @param MsLoginRsp
     */
    loginResponse(MsLoginRsp) {
        //console.log(userInfo);
        if (MsLoginRsp.status === 200) {
            console.log('loginResponse: 登录成功');
            console.log("success");
            cc.director.loadScene("hall");
        } else if (MsLoginRsp.status === 402){
            console.log('loginResponse: 应用校验失败，确认是否在未上线时用了release环境，并检查gameID、appkey 和 secret');
        } else if (MsLoginRsp.status === 403) {
            console.log('loginResponse：检测到该账号已在其他设备登录');
        } else if (MsLoginRsp.status === 404) {
            console.log('loginResponse：无效用户 ');
        } else if (MsLoginRsp.status === 500) {
            console.log('loginResponse：服务器内部错误');
        }
    }

    /**
     * 初始化回调
     * @param info
     */
    initResponse(status) {
        if(status == 200) {
            console.log('initResponse：初始化成功，status：'+status);
        } else {
            console.log('initResponse：初始化失败，status：'+status)
        }
    }

    /**
     * 注册回调
     * @param userInfo
     */
    registerUserResponse(userInfo) {
        if (userInfo.status ===0) {
            console.log('registerUserResponse：注册用户成功,id = '+userInfo.id+'token = '+userInfo.token+'name:'+userInfo.name+
                'avatar:'+userInfo.avatar);
            this.userID = userInfo.id;
            this.token = userInfo.token;
            //examplesData.userName = userInfo.name;
            playerInfo.userName = userInfo.name;
            playerInfo.userId = userInfo.id;
            playerInfo.userpic = userInfo.avatar;
        } else {
            console.log('registerUserResponse: 注册用户失败');
        }
    }

    /**
     * 进入房间回调
     * @param status
     * @param userInfoList
     * @param roomInfo
     */
    joinRoomResponse(status, userInfoList, roomInfo) {
        console.log("join room rsp");
        if (status === 200) {
            console.log('joinRoomResponse: 进入房间成功：房间ID为：'+roomInfo.roomID+'房主ID：'+roomInfo.ownerId+'房间属性为：'+roomInfo.roomProperty);

            console.log(roomInfo);
            //存储房间信息。
            RoomInfo.roomId = roomInfo.roomID;
            RoomInfo.roomHost = roomInfo.ownerId;

            RoomInfo.playerLength = userInfoList.length+1;
            for(let i = 0; i < userInfoList.length;i++) {
                console.log('joinRoomResponse：房间的玩家ID是'+userInfoList[i].userID);
            }
            if (userInfoList.length === 0) {
                console.log('joinRoomResponse：房间暂时无其他玩家');
            }
            cc.director.loadScene("game");
        } else {
            console.log('joinRoomResponse：进入房间失败');
        }
    }


    /**
     * 创建房间成功回调
     * @param status
     */
    createRoomResponse(status){
        console.log("create room rsp");
        if(status === 200){//创建房间成功
            cc.director.loadScene("room");
        }else{
            console.log("fail");
        }
    }


    /**
     * 注销回调
     * @param status
     */
    logoutResponse(status) {
        if (status === 200) {
            console.log('logoutResponse：注销成功');
            cc.director.loadScene("login");
        } else if (status === 500) {
            console.log('logoutResponse：注销失败，服务器错误');
        }

    }

    /**
     * 获取房间详情回调
     * @param MsGetRoomDetailRsp
     */
    getRoomDetailResponse(MsGetRoomDetailRsp){
        if(MsGetRoomDetailRsp.status === 200){
            RoomInfo.msGetRoomDetailRsp = MsGetRoomDetailRsp;
            //RoomInfo.roomHost = MsGetRoomDetailRsp.owner;
            RoomInfo.players = MsGetRoomDetailRsp.userInfos;
            RoomInfo.playerLength = MsGetRoomDetailRsp.userInfos.length;
        }else{
            console.log("fail!");
        }

    }

    /**
     * 其他玩家加入房间通知
     * @param roomUserInfo
     */
    joinRoomNotify(roomUserInfo) {
        this.game = Game.ins;
        console.log('joinRoomNotify：加入房间的玩家ID是'+roomUserInfo.userID);
        this.game.joinRoomNotify(roomUserInfo);  //添加其他玩家信息
    }

    /**
     * 关闭房间成功
     * @param joinOverRsp
     */
    joinOverResponse(joinOverRsp) {
        if (joinOverRsp.status === 200) {
            console.log('joinOverResponse: 关闭房间成功');
        } else if (joinOverRsp.status === 400){
            console.log('joinOverResponse: 客户端参数错误 ');
        } else if (joinOverRsp.status === 403) {
            console.log('joinOverResponse: 该用户不在房间 ');
        } else if (joinOverRsp.status === 404) {
            console.log('joinOverResponse: 用户或房间不存在');
        } else if (joinOverRsp.status === 500) {
            console.log('joinOverResponse: 服务器内部错误');
        }
    }

    /**
     * 关闭房间通知
     * @param notifyInfo
     */
    joinOverNotify(notifyInfo) {
        console.log('joinOverNotify：用户'+notifyInfo.srcUserID+'关闭了房间，房间ID为：'+notifyInfo.roomID);
    }

    /**
     * 发送消息回调
     * @param sendEventRsp
     */
    sendEventResponse(sendEventRsp) {
        if (sendEventRsp.status === 200) {
            console.log('sendEventResponse：发送消息成功');
        } else {
            console.log('sendEventResponse：发送消息失败');
        }
    }

    /**
     * 接收到其他用户消息通知
     * @param eventInfo
     */
    sendEventNotify(eventInfo) {
        let gameButton = GameButton.ins;
        console.log("收到其他客户端消息");
        console.log(eventInfo);
        let data = JSON.parse(eventInfo.cpProto);
        console.log(data);
        let action = data.action;
        switch (action) {
            case NetMsgEvent.PLAY_CARDS_S:
                gameButton.putCardForOtherPlayer(data.data.cards);
                break;
            case NetMsgEvent.PLAYER_DISCARD_S:
                gameButton.putCardForOtherPlayer(data.data.cards);
                break;
            default:
                break;
        }
    }

    /**
     * 离开房间回调
     * @param leaveRoomRsp
     */
    leaveRoomResponse(leaveRoomRsp) {
        if (leaveRoomRsp.status === 200) {
            console.log('leaveRoomResponse：离开房间成功，房间ID是'+leaveRoomRsp.roomID);
            cc.director.loadScene("hall");
        } else if (leaveRoomRsp.status === 400) {
            console.log('leaveRoomResponse：客户端参数错误,请检查参数');
        } else if (leaveRoomRsp.status === 404) {
            console.log('leaveRoomResponse：房间不存在')
        } else if (leaveRoomRsp.status === 500) {
            console.log('leaveRoomResponse：服务器错误');
        }
    }

    /**
     * 其他离开房间通知
     * @param leaveRoomInfo
     */
    leaveRoomNotify(leaveRoomInfo) {
        console.log('leaveRoomNotify：'+leaveRoomInfo.userID+'离开房间，房间ID是'+leaveRoomInfo.roomID);
        //有玩家离开房间，要么托管（不想写了），粗暴点退出大厅
        cc.director.loadScene("hall");
    }


    /**
     * gameServer发送消息通知
     */
    gameServerNotify(eventInfo){
        let gameButton = GameButton.ins;
        console.log("收到gameServer消息！")
        console.log(eventInfo);
        let data = JSON.parse(eventInfo.cpProto);
        playerInfo.gameServerData = data.data;   //将数据存放在对象playerInfo中，在掀牌时调用。每次收到gameServer消息时更新
        let action = data.action;
        playerInfo.flag = data.data.flag;   //牌型
        console.log(data);
        switch (action) {
            case NetMsgEvent.GAME_READY_R://发牌，隐藏提示
                gameButton.gameServerNotify(eventInfo);
                break;
            case NetMsgEvent.PLAY_CARDS_R://根据服务器的消息显示按钮
                gameButton.displayGameBuuton(data);
                break;
            case NetMsgEvent.HOST_REPLAY_CARD_R://庄家提出洗牌响应
                gameButton.displayLiftCardButton(data);
                break;
            case NetMsgEvent.OTHER_REPLAY_CARD_R://玩家同意庄家请求响应
                gameButton.displayLiftCardButton(data);
                break;
            case NetMsgEvent.OTHER_REPLAY_CARD_OVER_R://玩家提出洗牌响应
                //展示得分面板。
                gameButton.displayResult(data.data);
                break;
            case NetMsgEvent.PLAYER_DISCARD_R://玩家扣牌
                gameButton.displayDiscardButton(data.data);
                break;
            case NetMsgEvent.HOST_PUT_CARD_R://庄家放牌
                gameButton.hostPutCard(data.data);
                break;
            case NetMsgEvent.ROOM_DETAILS://准备后，gameServer发送房间玩家信息，更新UI
                gameButton.updataPlayerUI(data.data);
                break;
            case NetMsgEvent.DISPLAY_RESULT://展示分数面板。
                gameButton.displayResult(data.data);
                break;
            case NetMsgEvent.CANT_REPALY_CARD:
                gameButton.displayMessage(data.data);
                break;
            case NetMsgEvent.LIFT_HOST_CARDS:
                gameButton.displayGameBuuton(data);
            default:
                break;
        }
    }

    errorResponse(errorCode,errorMsg){
        console.log("发生错误了！！！");
        console.log(errorCode, errorMsg);
    }

}