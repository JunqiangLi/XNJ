import {MatchvsRsp} from "../meMatchvs/MatchvsRsp";

let engine = require('../meMatchvs/MatchvsEngine');
let response = require("../meMatchvs/MatchvsResponse");
let msg = require("../meMatchvs/MatvhsvsMessage");
let examplesData = require('../meMatchvs/ExamplesData');
let playerInfo = require('../data/PlayerInfo');


const {ccclass, property} = cc._decorator;
@ccclass

export default class hall extends cc.Component {

    constructor(){
        super();
        this.matchvsRsp = new MatchvsRsp();
    }
    @property({
        type:cc.Sprite
    })
    userPic = null; //头像

    @property({
        type: cc.Label
    })
    userName = null; //用户姓名

    @property({
        type: cc.Button
    })
    matchButton = null; //匹配按钮

    @property({
        type: cc.Button
    })
    creatRoomButton = null;  //创建房间按钮

    @property({
        type: cc.Button
    })
    backButton = null;     //退出登录按钮



    start() {
        this.initMatchvsEvent(this);
        this.userName.string = playerInfo.userName;
        this.loadImg(this.userPic, playerInfo.userpic);

    }


    //动态加载图片的方法
    loadImg(container,url){
        cc.loader.load(url, function (err, texture) {
            let sprite  = new cc.SpriteFrame(texture);
            container.spriteFrame = sprite;
        });
    }



    match(){
        engine.prototype.joinRandomRoom(examplesData.mxaNumer, {
            nickName:playerInfo.userName,
            avator:playerInfo.userpic,
        });
    }

    creatRoom(){
        engine.prototype.creatRoom("掀牛", "", examplesData.mxaNumer, "");

    }

    back(){
        engine.prototype.logout();
    }

    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     * @param self this
     */
    initMatchvsEvent(self) {
        //在应用开始时手动绑定一下所有的回调事件
        response.prototype.bind();

        response.prototype.init(self);
        this.node.on(msg.MATCHVS_JOIN_ROOM_RSP, this.matchvsRsp.joinRoomResponse, this);
        this.node.on(msg.MATCHVS_CREATE_ROOM,this.matchvsRsp.createRoomResponse,this);
        this.node.on(msg.MATCHVS_LOGOUT,this.matchvsRsp.logoutResponse,this);
    }


    /**
     * 移除监听
     */
    removeEvent() {
        this.node.off(msg.MATCHVS_JOIN_ROOM_RSP, this.matchvsRsp.joinRoomResponse, this);
        this.node.off(msg.MATCHVS_CREATE_ROOM,this.matchvsRsp.createRoomResponse,this);
        this.node.off(msg.MATCHVS_LOGOUT,this.matchvsRsp.logoutResponse,this);
    }

    onDestroy() {
        this.removeEvent();
    }

}