import {MatchvsRsp} from "../meMatchvs/MatchvsRsp";

/**
 * 游戏界面
 * @type {MatchvsEngine}
 */
let engine = require('../meMatchvs/MatchvsEngine');
let response = require("../meMatchvs/MatchvsResponse");
let msg = require("../meMatchvs/MatvhsvsMessage");
let examplesData = require('../meMatchvs/ExamplesData');
let playerInfo = require('../data/PlayerInfo');
let roomInfo = require('../data/RoomInfo');


const {ccclass, property} = cc._decorator;
@ccclass

export default class Game extends cc.Component {

    constructor(){
        super();
        this.matchvsRsp = new MatchvsRsp();
        this.playersLenth = 0;
    }

    @property({
        type: cc.Label
    })
    roomId = null;

    @property({
        type: cc.Label
    })
    hostName = null;

    @property({
        type: cc.Sprite
    })
    head = null;

    @property({
        type: cc.Label
    })
    userName = null;

    @property({
        type: cc.Prefab
    })
    player2 = null;

    @property({
        type: cc.Prefab
    })
    player3 = null;

    @property({
        type: cc.Prefab
    })
    message = null;

    @property({
        type: cc.Prefab
    })
    startButton = null;

    start() {
        Game._instance = this;
        this.initMatchvsEvent(this);
        this.getRoomDetails();
        this.init();
        this.loadOtherUserInfo(roomInfo.playerLength);
    }

    update(dt) {
        //更新房间中玩家的个数
        if(this.playersLenth < 3){
            //this.getRoomDetails();
            if(this.playersLenth !== roomInfo.playerLength){
                this.playersLenth = roomInfo.playerLength;
                this.loadOtherUserInfo(this.playersLenth);
            }
        }else if(this.playersLenth === 3){ //显示开始游戏按钮 测试用，后期根据房主显示
            this.addPrefab(this.startButton); //准备按钮
            this.playersLenth++;
        }
    }


    /**
     * 初始化
     */
    init(){
        this.loadRoomInfo();
        //初始化时向其他玩家广播发送房间信息
        //this.sendEvent(roomInfo);
    }

    /**
     * 判断是不是房主
     */
    isHost(){
        console.log("========================");
        console.log(roomInfo.roomHost);
        console.log(playerInfo.userId);
        if(playerInfo.userId === roomInfo.roomHost)
            return true;
        return false;
    }
    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     * @param self this
     */
    initMatchvsEvent(self) {
        //在应用开始时手动绑定一下所有的回调事件
        response.prototype.init(self);
        response.prototype.bind();

        this.node.on(msg.MATCHVS_ROOM_DETAIL, this.matchvsRsp.getRoomDetailResponse, this);
        this.node.on(msg.MATCHVS_JOIN_ROOM_NOTIFY,this.matchvsRsp.joinRoomNotify,this);
        this.node.on(msg.MATCHVS_JOIN_OVER_RSP,this.matchvsRsp.joinOverResponse,this);
        this.node.on(msg.MATCHVS_JOIN_OVER_NOTIFY,this.matchvsRsp.joinOverNotify,this);
        this.node.on(msg.MATCHVS_SEND_EVENT_RSP,this.matchvsRsp.sendEventResponse,this);
        this.node.on(msg.MATCHVS_SEND_EVENT_NOTIFY,this.matchvsRsp.sendEventNotify,this);
        this.node.on(msg.MATCHVS_LEAVE_ROOM,this.matchvsRsp.leaveRoomResponse,this);
        this.node.on(msg.MATCHVS_LEAVE_ROOM_NOTIFY,this.matchvsRsp.leaveRoomNotify,this);
        this.node.on(msg.MATCHVS_LOGOUT,this.matchvsRsp.logoutResponse,this);
        this.node.on(msg.MATCHVS_ERROE_MSG,this.matchvsRsp.errorResponse,this);

        this.node.on(msg.MATCHV_GANESERVER_NOTIFY,this.matchvsRsp.gameServerNotify,this);
        //注册网络监听
        this.node.on(msg.MATCHVS_NETWORK_STATE_NOTIFY, this.matchvsRsp.gameServerNotify, this);

    }
    /**
     * 移除监听
     */
    removeEvent() {
        this.node.off(msg.MATCHVS_JOIN_ROOM_NOTIFY,this.matchvsRsp.joinRoomNotify,this);
        this.node.off(msg.MATCHVS_JOIN_OVER_RSP,this.matchvsRsp.joinOverResponse,this);
        this.node.off(msg.MATCHVS_JOIN_OVER_NOTIFY,this.matchvsRsp.joinOverNotify,this);
        this.node.off(msg.MATCHVS_SEND_EVENT_RSP,this.matchvsRsp.sendEventResponse,this);
        this.node.off(msg.MATCHVS_SEND_EVENT_NOTIFY,this.matchvsRsp.sendEventNotify,this);
        this.node.off(msg.MATCHVS_LEAVE_ROOM,this.matchvsRsp.leaveRoomResponse,this);
        this.node.off(msg.MATCHVS_LEAVE_ROOM_NOTIFY,this.matchvsRsp.leaveRoomNotify,this);
        this.node.off(msg.MATCHVS_ERROE_MSG,this.matchvsRsp.errorResponse,this);
        this.node.off(msg.MATCHVS_SEND_EVENT_RSP,this.matchvsRsp.sendEventResponse,this);
        this.node.off(msg.MATCHVS_SEND_EVENT_NOTIFY,this.matchvsRsp.sendEventNotify,this);
        this.node.off(msg.MATCHV_GANESERVER_NOTIFY,this.matchvsRsp.gameServerNotify,this);

        this.node.off(msg.MATCHVS_NETWORK_STATE_NOTIFY, this.matchvsRsp.gameServerNotify, this);
    }
    /**
     * 获取房间详情，更新房间信息
     */
    getRoomDetails(){
        engine.prototype.getRoomDetail(roomInfo.roomId); //获取房间详情
    }

    /**
     * 向房间其他玩家广播发送房间信息。
     * @param msg
     */
    sendEvent(msg){
        engine.prototype.sendEvent(msg);
    }
    /**
     * 加载用户信息
     */
    loadOtherUserInfo(userSite){

        let userInfos = roomInfo.msGetRoomDetailRsp.userInfos;
        if(userSite === 2){
            this.addPrefab(this.player2);
            let name2 = this.node.getChildByName("head2").getChildByName("username");
            for(let i = 0; i < userInfos.length; i++){
                if(userInfos[i].userId !== playerInfo.userId)
                   name2.string = userInfos[i].userId;
            }
        }else if(userSite === 3){
            this.addPrefab(this.player2);
            let name2 = this.node.getChildByName("head2").getChildByName("username");
            this.addPrefab(this.player3);
            let name3 = this.node.getChildByName("head3").getChildByName("username");
        }

    }
    /**
     * 加载房间基本信息
     */
    loadRoomInfo(){
        //加载房间基本信息
        this.roomId.string = "房间号："+roomInfo.roomId;
        this.hostName.string = "房主："+roomInfo.roomHost;

        //加载房间中的玩家信息
        this.userName.string = playerInfo.userName;//加载用户名
        this.loadImg(this.head, playerInfo.userpic);//加载头像

    }
    /**
     * 动态加载图片的方法
     */
    loadImg(container,url){
        console.log(container);
        console.log("加载头像！"+url);
        cc.loader.load(url, function (err, texture) {
            let sprite  = new cc.SpriteFrame(texture);
            container.spriteFrame = sprite;
        });
    }
    /**
     * 添加预制文件
     */
    addPrefab(prefab){
        let node = cc.instantiate(prefab);
        this.node.addChild(node)
    }

    /**
     * 返回场景信息
     */
    static get ins() {
        return Game._instance;
    }

    /**
     * 有其他玩家进入房间时调用
     */
    joinRoomNotify(roomUserInfo){

        this.getRoomDetails();
    }

    updataPlayerUI(playerData){
        let name2 = this.node.getChildByName("head2").getChildByName("username");
        let img2 = this.node.getChildByName("head2").getChildByName("img");
        let name3 = this.node.getChildByName("head3").getChildByName("username");
        let img3 = this.node.getChildByName("head2").getChildByName("img");
        name2.getComponent(cc.Label).string = ""+playerData.get(2).nickName;
        name3.getComponent(cc.Label).string = ""+playerData.get(3).nickName;
        img2.getComponent(cc.Sprite).spriteFrame = null;
        img3.getComponent(cc.Sprite).spriteFrame = null;
        this.loadImg(img2.getComponent(cc.Sprite), playerData.get(2).avator);
        this.loadImg(img3.getComponent(cc.Sprite),playerData.get(3).avator);
    }

    leaveRoom(){
        engine.prototype.leaveRoom();
    }

}