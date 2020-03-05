/**
 * 游戏界面  按钮处理类
 * @type {MatchvsEngine}
 */
import pokerClick from "../utils/pokerClick.js";
import {MatchvsRsp} from "../meMatchvs/MatchvsRsp";
import Game from "./Game";
import {NetMsgEvent} from "../network/BattleEvent";
import {judgeRole} from "../game/play/judgeRole";
import {prompt} from "../game/play/prompt";
import putCards from "../utils/putCards";
import begin from "../utils/begin";
import {cardUtils} from "../utils/cardUtils";
import {pokerUtil} from "../game/utils/pokerUtil";
import result from "./result";

let engine = require('../meMatchvs/MatchvsEngine');
let response = require("../meMatchvs/MatchvsResponse");
let msg = require("../meMatchvs/MatvhsvsMessage");
let examplesData = require('../meMatchvs/ExamplesData');
let playerInfo = require('../data/PlayerInfo');
let roomInfo = require('../data/RoomInfo');

let arr = [];
const {ccclass, property} = cc._decorator;
@ccclass

export default class GameButton extends cc.Component {

    constructor() {
        super();
        this.matchvsRsp = new MatchvsRsp();
        this.game = Game.ins; //加载游戏场景
        this.isReady = false;
        this.matchvsRsp = new MatchvsRsp();
        this.cardUtils = new cardUtils();

        this.lift = false;   //是否进入掀牌逻辑标识
    }
    @property({
        type: cc.Prefab
    })
    card2 = null;
    @property({
        type: cc.Prefab
    })
    card3 = null;

    @property({
        type: cc.Prefab
    })
    cardList = null;

    @property({
        type: cc.Label
    })
    message = null;

    @property({
        type : cc.Prefab
    })
    gameButtons = null;

    @property({
        type : cc.Prefab
    })
    liftCardButton = null;

    @property({
        type:cc.Prefab
    })
    result = null;

    @property({
        type:cc.Label
    })
    promptLabel = null;

    start(){
        GameButton._instance = this;
        this.addPrefab(this.gameButtons);  //加载按钮UI
        this.node.getChildByName('gameButton').active = false;  //隐藏按钮

        this.addPrefab(this.liftCardButton);
        this.node.getChildByName('liftCardButton').active = false;  //隐藏按钮

        this.addPrefab(this.result);
        this.node.getChildByName('result').active = false;  //隐藏按钮
        console.log(this.node.getChildByName('result'));
        this.bindFunction();               //绑定点击事件
    }
    /**
     * 返回场景信息
     */
    static get ins() {
        return GameButton._instance;
    }
    update(dt){
        //为准备按钮添加响应事件
        if(this.node.getChildByName("start") !== null && this.isReady === false){
            this.node.getChildByName("start").on('click', this.startGame,this);
            this.isReady = true;
        }

    }
    /**
     * 初始化资源
     */
    init(){
        this.cardStore = pokerClick.ins;
    }

    /**
     * 准备 按钮响应事件
     */
    startGame(){
        this.reInitPlayInfo();
        console.log("发送消息=======准备");
        //向gameServer发送准备信号
        this.sendEventEx(1,{
            action:NetMsgEvent.GAME_READY_S,
            data:{
                userId:playerInfo.userId
            }
        },0);
        //隐藏准备按钮
        this.node.getChildByName("start").active = false;
        //加载消息提示的预制体（message）
        this.message.string = "等待其他玩家准备";
        this.node.getChildByName('result').active = false;  //隐藏按钮
    }

    /**
     * 出牌按钮响应事件
     */
    putCards(){
        this.init();
        let arr = this.cardStore.selectedCards;
        let pre_arr = playerInfo.prePlayerPutCards;
        let judge = new judgeRole(pre_arr, arr);
        if(arr.length === 0)
            return;
        let flag = pokerUtil.isMAX(arr);    //判断牌型是否为掀牛最大牌型，如果是，可继续出牌
        if(judge.judge_role() && arr.length !== 0){
            this.promptLabel.string = "";
            // this.destroyCardLayoutChildren(1);
            this.cardStore.discards();  //出牌
            this.cardStore.addPutCards(arr);//将打出的牌添加到出牌区域；

            //验证是否进入掀牌环节
            let action = null;
            if(this.lift){
                action = NetMsgEvent.PLAYER_DISCARD_S;
            }else{
                action = NetMsgEvent.PLAY_CARDS_S;
            }

            this.node.getChildByName("gameButton").active = false;  //隐藏游戏按钮游戏按钮
            //修改playerInfo中的数据。
            playerInfo.handCards = this.cardUtils.reduceCards(playerInfo.handCards, arr); //手中的牌减少

            playerInfo.abandonCards = this.cardUtils.addCards(playerInfo.abandonCards, arr); //已经打出的牌增加

            if(playerInfo.prePopUserID !== playerInfo.userId){//该玩家未连续出牌
                playerInfo.inArowCards = [];
                playerInfo.gradeCards = [];
            }
            let pokerUtils = new pokerUtil();
            let temp = pokerUtils.convertArrayToKey(arr);
            playerInfo.gradeCards.push(temp);
            playerInfo.inArowCards = this.cardUtils.addCards(playerInfo.inArowCards, arr);


            this.sendPutCardToOtherPlayer({
                action: action,
                data:{
                    flag:flag,//牌型是否是最大
                    cards: arr,
                    preCards: playerInfo.prePlayerPutCards,
                    userCardsLen:playerInfo.handCards.length,
                    inArowCards: playerInfo.inArowCards,
                    gradeCards: playerInfo.gradeCards,
                }
            });//向客户端及服务器发送出牌消息，在其他桌面也显示
        }else{
            console.log("请选择合适的牌型");
            this.promptLabel.string = '请选择合适的牌型';
            return;
        }

    }

    /**
     * 不出按钮响应事件
     */
    noOut(){
        this.init();
        let liftUserId = playerInfo.gameServerData.liftUserID;
        if(this.lift && playerInfo.userId === liftUserId){
            this.liftNoOut();
            return;
        }
        if(playerInfo.prePopUserID === playerInfo.userId){
            console.log("必须出牌");
            this.promptLabel.string = "必须出牌";
            return;
        }else{
            let arr = playerInfo.prePlayerPutCards;  //前一位玩家所出牌
            let p = new prompt(playerInfo.handCards, arr);
            let array = p.promptPoker();
            if(array.length !== 0){
                console.log("您手中有比他大的牌！"); //手中有牌，必须出
                // this.node.getChildByName('prompt').string = '您手中有比他大的牌';
                this.promptLabel.string = '请慎重';

            }else{ //发送消息，不出牌。
                this.promptLabel.string = "";
                this.sendPutCardToOtherPlayer({
                    action:NetMsgEvent.PLAY_CARDS_S,
                    data:{
                        cards: [],
                        preCards:playerInfo.prePlayerPutCards //前一玩家出牌
                    }
                });
                this.node.getChildByName("gameButton").active = false;  //隐藏游戏按钮游戏按钮
            }
        }
    }
    /**
     * 提示按钮响应事件
     */
    prompt(){
        console.log("提示");
        this.init();
        let poker = playerInfo.handCards;  //当前玩家手中的牌
        let pre_arr = playerInfo.prePlayerPutCards;  //前一玩家出的牌
        let p = new prompt(poker, pre_arr);
        let arr = p.promptPoker();//提示出牌的数组
        pokerClick.ins.selectCards(arr);
    }
    /**
     * 洗牌按钮响应事件
     */
    RestartGame(){
        console.log("洗牌");
        let array = playerInfo.inArowCards;

        let playerStatus = 0;  //0表示其他玩家，1表示庄家
        if(playerInfo.status)
            playerStatus = 1;

        if(array.length === 0 || array.length >= 6){
            //=0未出牌，直接弃牌，如果其他玩家不掀牌，重开，掀牌，庄家放牌
            //庄家出够六张牌，提出结束游戏，如果该玩家是庄家，进入掀牌逻辑，不是庄家，计算分数，重开。
            //给gameServer及其他玩家 发送消息
            this.sendEventEx(2, {
                action : NetMsgEvent.SHUFFLE_CARD,
                data:{
                    status : playerStatus,
                    LEN:array.length,
                    inArowCards:playerInfo.inArowCards,
                    abdc:playerInfo.abandonCards
                }
            }, 1);
        }else{
            //如果庄家不够六张牌提出洗牌，庄家输，玩家不够六张牌提出，玩家输
            //给gameServer及其他玩家 发送消息
            console.log(playerInfo.inArowCards);
            this.sendEventEx(2,{
                action : NetMsgEvent.SHUFFLE_CARD_ERROR,
                data:{
                    status : playerStatus,
                    LEN:array.length,
                    inArowCards:playerInfo.inArowCards,
                    abdc:playerInfo.abandonCards
                }
            },1);
        }

        this.node.getChildByName('gameButton').active = false;
        this.node.getChildByName('liftCardButton').active = false;
    }
    /**
     *  掀牌按钮响应事件
     *  只有庄家提出结束游戏的请求时，才对玩家展示掀牌按钮。
     */
    liftCard(){
        this.init();
        //向gameServer发送消息
        //掀牌玩家先扣牌
        //gameServer向庄家发送玩家掀牌消息，玩家开始放牌。发牌结束后，掀牌玩家扣牌，扣牌无规则
        //掀牌规则：庄家放牌，如果是最大牌型，掀牌玩家选择是否继续掀牌，是，庄家继续放牌，否则，看其他玩家是否掀牌
        //如果庄家出牌 不是最大牌型，按座位出，掀牌玩家吃不了，选择是否继续掀牌，掀，另一玩家能吃，则由另一玩家放牌
        //另一玩家吃不了，则继续由庄家放牌
        //扣牌的目的是保持掀牌玩家和庄家手中牌的数量保持一致。
        let hostCardsLen = playerInfo.gameServerData.hostCardsLen; //庄家手中的牌
        let myCardsLen = playerInfo.handCards.length;
        let discardLen = myCardsLen - hostCardsLen;
        console.log(hostCardsLen+"   "+myCardsLen);
        if(discardLen !== 0){
            console.log("请先选择"+discardLen+"张牌，再点击掀牌");
            this.promptLabel.string = "请先选择"+discardLen+"张牌，再点击掀牌";

            let arr = this.cardStore.selectedCards;
            console.log(arr);
            if(!(arr instanceof Array) || arr.length !== discardLen){//未选择牌arr === [] || arr === null || arr.length === 0
                return;
            }else{
                this.promptLabel.string = "";
                playerInfo.handCards = this.cardUtils.reduceCards(playerInfo.handCards, arr);
                this.cardStore.discards();
            }
        }

        let cards = playerInfo.prePlayerPutCards;
        this.sendEventEx(2,{
            action:NetMsgEvent.LIFT_CARDS,
            data:{
                flag: playerInfo.flag,
                cards: cards,
                cardsLen: playerInfo.handCards.length,
            }
        },1);


        this.node.getChildByName('gameButton').active = false;
        this.node.getChildByName('liftCardButton').active = false;
    }

    /**
     * 在掀牌逻辑中不出牌时
     * 展示掀牌按钮
     */
    liftNoOut(){
        this.node.getChildByName('gameButton').active = false;
        this.node.getChildByName('liftCardButton').active = true;
    }
    /**
     * 添加预制体
     */
    reloadUI(){
        //加载其他两家的牌
        this.addPrefab(this.card2);
        this.addPrefab(this.card3);

        console.log("开始发牌");
        this.addPrefab(this.cardList);//添加牌列表
        console.log(this.cardList);
        this.node.getChildByName("start").active = false;
    }
    /**
     * 添加预制文件
     */
    addPrefab(prefab){
        let node = cc.instantiate(prefab);
        this.node.addChild(node)
    }

    /**
     * 为gameButton绑定响应事件
     */
    bindFunction(){
        console.log(this.node.getChildByName("gameButton"));
        this.node.getChildByName("gameButton").getChildByName("put").on('click', this.putCards, this);
        this.node.getChildByName("gameButton").getChildByName("noput").on('click', this.noOut, this);
        this.node.getChildByName("gameButton").getChildByName("prompt").on('click', this.prompt, this);
        this.node.getChildByName("gameButton").getChildByName("restart").on('click', this.RestartGame, this);
        this.node.getChildByName("liftCardButton").getChildByName("lift").on('click', this.liftCard, this);
        this.node.getChildByName("liftCardButton").getChildByName("restart").on('click', this.RestartGame, this);
        // this.node.getChildByName('result').getChildByName('guanbi').on('click', this.startGame(), this);
    }

    /**
     * 发送信息,其他玩家
     */
    sendEvent(msg) {
        let result = engine.prototype.sendEvent(msg);
    }

    /**
     * 发送消息至gameServer
     * msgType	number	消息发送类型：0表示转发给其他玩家；1表示转发给game server；2表示转发给其他玩家及game server	2
     * data	    string	发送内容	"hello"
     * destType	number	发送目标类型：0表示发送目标为userIDs；1表示发送目标为除userIDs以外的房间其他人	0
     * userIDs	Array	发送目标	[12345]
     */
    sendEventEx(msgType, msg, destType){
        engine.prototype.sendEventEx(msgType,msg,destType);
    }

    /**
     * 开始游戏
     * @param eventInfo
     */
    gameServerNotify(eventInfo){
        this.message.string = "";//清空消息提示。
        begin.ins.clearNode();
        putCards.ins.clearNode();

        //获取服务端返回的数据
        console.log(JSON.parse(eventInfo.cpProto));
        let cpProto = JSON.parse(eventInfo.cpProto);
        //获取玩家列表
        let userList = cpProto.data.userCards;
        //获取第一个做庄的人
        let callOwner = cpProto.data.callOwner;
        let cards = []; //存储当前玩家的牌
        for(let i = 0; i < 3; i++){
            if(userList[i].userID === playerInfo.userId){
                cards = userList[i].card;
                break;
            }
        }
        //给用户显示牌
        console.log(cards);
        playerInfo.handCards = cards;
        this.reloadUI();

        this.lift = false;
        this.isReady = false;

        //显示游戏按钮
        if(callOwner === playerInfo.userId){
            playerInfo.status = true;
            this.node.getChildByName('gameButton').active = true;
        }

    }

    /**
     * 向其他玩家及服务器发送出牌消息
     * @param cards
     */
    sendPutCardToOtherPlayer(msg){
        this.sendEventEx(2, msg, 1);
    }

    /**
     * 接收到其他玩家出牌提示后，将牌添加到出牌区域
     */
    putCardForOtherPlayer(card){
        // console.log("==================================");
        console.log("添加牌至出牌容器");
        putCards.ins.addPrefab(card);
    }

    /**
     * 根据服务器返回的数据显示按钮
     * @param data
     */
    displayGameBuuton(data){
        console.log("displayGameBuuton");
        let preCards = data.data.cardList;    //前一玩家所出牌
        let nextPlayer = data.data.nextPlayer; //下一位出牌的玩家

        playerInfo.prePlayerPutCards = preCards;
        playerInfo.prePopUserID = data.data.prePopUserID;

        this.disPlayButtons(nextPlayer, 'gameButton');
    }

    /**
     * 显示掀牌按钮
     * @param data
     */
    displayLiftCardButton(data){
        console.log("displayLiftCardButton");
        let next = data.data.nextPlayer;
        let host = data.data.host;
        console.log(next);
        if(next === playerInfo.userId && host !== playerInfo.userId)
            this.node.getChildByName('liftCardButton').active = true;
    }


    /**
     * 展示扣牌按钮
     */
    displayDiscardButton(data){
        let button = data.button;
        let preCards = data.cardList;    //前一玩家所出牌
        let nextPlayer = data.nextPlayer; //下一位出牌的玩家

        playerInfo.prePlayerPutCards = preCards;
        playerInfo.prePopUserID = data.prePopUserID;

        // playerInfo.discardLen = data.discardLen;//需要扣掉的牌
        this.disPlayButtons(nextPlayer, button);
    }

    /**
     * 庄家放牌
     * @param data
     */
    hostPutCard(data){
        this.lift = true;
        let host = data.host;
        let liftUserID = data.liftUserID;
        this.disPlayButtons(host, 'gameButton');
        // if(host === playerInfo.userId)//给庄家显示游戏按钮
        //     this.node.getChildByName('gameButton').active = true;
    }

    /**
     * 显示一组按钮
     * @param userID
     * @param button
     */
    disPlayButtons(userID, button){
        if(userID === playerInfo.userId)
            this.node.getChildByName(button).active = true;
    }

    /**
     * 清除node的子节点
     * 1 出牌容器  2 用户牌容器
     * @param node
     */
    destroyCardLayoutChildren(node){//清除cardLayout的子节点
        if(node === 1){
            let childrenArr = this.node
                .getChildByName('putCards')
                .getChildByName('cardLayout').children;
            console.log("=======================");
            console.log(childrenArr);
            for(let i = 0; i < childrenArr.length; i++){
                // childrenArr[i].node.des
            }
        }else{
            this.node.getChildByName('card').removeAllChildren(true);
        }



    }

    /**
     * 更新玩家信息
     * @param data
     */
    updataPlayerUI(data){
        let userData = data.userdata;
        let playerData = new Map();  //需要添加的用户数据
        let index = 2;
        for(let i = 0; i < userData.length; i++){
            if(userData[i].userid !== playerInfo.userId){
                playerData.set(index, userData[i]);
                index++;
            }
        }

        Game.ins.updataPlayerUI(playerData);

    }

    /**
     *  展示分数面板
     * @param data
     */
    displayResult(data){
        this.node.getChildByName('result').active = true;  //展示分数面板
        //清空牌列表容器和出牌容器
        putCards.ins.addPrefab([]); //清空出牌容器
        begin.ins.addPrefab([]);//清空牌列表容器

        //隐藏游戏按钮
        this.node.getChildByName('gameButton').active = false;
        this.node.getChildByName('liftCardButton').active = false;

    }

    /**
     * 显示服务器返回的消息
     * @param data
     */
    displayMessage(data){
        let message = data.message;
        let type = data.type;
        this.promptLabel.string = message;
        if(type === 'REFUSE_PLAY')
            this.node.getChildByName('gameButton').active = true;
        else if(type === 'REFUSE_LIFT')
            this.node.getChildByName('liftCardButton').active = true;
    }

    /**
     * 重置playerInfo中的数据；
     */
    reInitPlayInfo(){
            playerInfo.handCards = []; //手中的牌
            playerInfo.putCards = [];   //打出的牌
            playerInfo.abandonCards = [];//已经打出的牌
            playerInfo.inArowCards =  []; //玩家连续打出的牌
            playerInfo.prePlayerPutCards = []; //前一位玩家出的牌
            playerInfo.status = false;  //是否做庄 true:是，false:不是
            playerInfo.site = 0;        //座位，掀牛是按座位顺序来轮流做庄
            playerInfo.fraction = 0;    //玩家得分
            playerInfo.prePopUserID = 0; //前一出牌玩家ID
            playerInfo.discardLen = 0;  //需要扣掉牌的张数
            playerInfo.gameServerData = null;
    }

}