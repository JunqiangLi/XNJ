import {MatchvsRsp} from "../meMatchvs/MatchvsRsp";

var engine = require('../meMatchvs/MatchvsEngine');
var response = require("../meMatchvs/MatchvsResponse");
var msg = require("../meMatchvs/MatvhsvsMessage");
var examplesData = require('../meMatchvs/ExamplesData');

const {ccclass, property} = cc._decorator;
@ccclass

export default class login extends cc.Component {
    @property({
        type: cc.Button
    })
    loginButton = null;

    constructor(){
        super();
        this.matchvsRsp = new MatchvsRsp();
    }

    start() {

        login._instance = this;
        this.initMatchvsEvent(this);
        this.init();
        this.loginButton.node.on('click',this.login, this);
    }

    restart() {


    }

    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     * @param self this
     */
    initMatchvsEvent(self) {
        //在应用开始时手动绑定一下所有的回调事件
        response.prototype.bind();

        response.prototype.init(self);

        this.node.on(msg.MATCHVS_INIT, this.matchvsRsp.initResponse, this);
        this.node.on(msg.MATCHVS_REGISTER_USER,this.matchvsRsp.registerUserResponse,this);
        this.node.on(msg.MATCHVS_LOGIN,this.matchvsRsp.loginResponse,this);
    }


    /**
     * 移除监听
     */
    removeEvent() {
        this.node.off(msg.MATCHVS_INIT, this.matchvsRsp.initResponse, this);
        this.node.off(msg.MATCHVS_REGISTER_USER,this.matchvsRsp.registerUserResponse,this);
        this.node.off(msg.MATCHVS_LOGIN,this.matchvsRsp.loginResponse,this);
    }

    /**
     * 登录
     */
    login() {

        engine.prototype.registerUser();
        let result = engine.prototype.login(this.userID, this.token);
        console.log("-------");
        console.log(result);
        if (result === -6) {
            console.log('已登录，请勿重新登录');
        } else if (result === -26){
            console.log('[游戏账户与渠道不匹配，请使用cocos账号登录Matchvs官网创建游戏]：(https://www.matchvs.com/cocos)');
        } else {
            console.log("fail")
        }
    }

    /**
     * 初始化
     */
    init() {
        engine.prototype.init(examplesData.channel,examplesData.platform,examplesData.gameID);
        console.log('初始化使用的gameID是:'+examplesData.gameID,'如需更换为自己SDK，修改NetworkFlow.js 114行即可');
    }

    /**
     * 注册
     */
    register() {
        var result =  engine.prototype.registerUser();
        this.engineCode(result,'registerUser');
    }

    onDestroy() {
        this.removeEvent();
    }
    //返回场景信息
    static get ins() {
        return login._instance
    }
}
