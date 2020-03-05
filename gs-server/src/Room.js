
const log4js = require('log4js');
const textEncoding = require('text-encoding');
const Player = require("./Player");
const SendCards = require("./SendCard");
const GameData = require("./GameData");

const log  = log4js.getLogger();

const ROOMSTATE ={
    NONE:0x00000000,
    GAME_READ:1<<1,
    CALL_LANDOVER: 1<<2,
    GAME_START: 1<<3,
    GAME_REPORT:1<<4,
};

class Room{
    constructor(gameID, roomID,pushHander){
        this.gameID = gameID;
        this.roomID = roomID;
        this.roomPlayers = 0;                  //房间中的人数
        this.players = new Map();
        this.pushHander = pushHander;          //引擎业务处理对象
        this.roomState = ROOMSTATE.NONE;
        this.landOwner = null;
        this.landCards = [];                   //斗地主的底牌，掀牛中不设置
        this.callOwnerLocat = new Player();
        this.playerSate = 0;                   //当前出牌的玩家的位置。
        this.alreadyPop = 0;                   //记录一轮出牌中，已经出牌的玩家。
        this.host = 0;                         //庄家。
        this.prePopUserID = 0;                 //一轮游戏中前一位出牌玩家的ID
        this.rePlayCardNumber = 0;             //当前游戏中同意洗牌的人数
        this.liftUserID = 0;

        this.restartGame = false;
    }

    reInitRoom(){
        this.roomState = ROOMSTATE.NONE;
        this.landOwner = null;
        this.landCards = [];
        this.callOwnerLocat = new Player();

    }

    /**
     * 更新玩家数据
     */
    updataPlayersData(){
        for (let [id, p] of this.players) {
            p.cardListLenth = 16;
            p.liftAmount = 0;
            p.isReady = false;
            p.isCallLandOwner = false;
            p.gameScore = 0;
            p.ranking = 0;
            p.isOk = false;
            p.isAlreadyPop = false;
        }
    }
    //添加玩家
    addPlayer(userID, userProfile){
        let p = new Player(userID);
        p.userID = userID;
        p.localTableId = this.roomPlayers;  //设置玩家的座位
        this.roomPlayers++;

        log.debug(userID);
        log.debug(userProfile);
        if(userProfile){
            let obj = JSON.parse(userProfile);
            if("nickName" in obj){
                p.nickName = obj.nickName;
                //log.debug(p.nickName);
            }
            if("avator" in obj){
                p.avator = obj.avator;
                //log.debug(p.avator);
            }
        }
        this.players.set(userID,p);
        log.debug("players count :"+this.players.size);
    }

    getPlayer(userID){
        return this.players.get(userID);
    }

    //删除玩家
    delPlayer(userID){
        let player = this.players.get(userID)
        if(player){
            log.debug("player had exit"+userID);
            this.players.delete(userID);
        }else{
            log.debug("player not exist:"+userID);
        }
        log.debug("players count :"+this.players.size);
    }

    //房间消息处理
    roomEvent(userID, event){
        if(userID && event && event.action){
            switch(event.action){
            case GameData.MSG_EVENT.READY://准备
                this.eventReady(userID);
                break;
            case GameData.MSG_EVENT.SEND_CARD:
                break;
            case GameData.MSG_EVENT.REPROT_SCORE://上报分数
                this.reportPlayerScore(userID, event.data);
                break;
            case GameData.MSG_EVENT.RESET_ROOM://重置房间
                this.reSetRoom(userID);
                break;
            case GameData.MSG_EVENT.CLEAR_SCROE://清空分数
                this.clearPlayersScore(userID, event.data.userList);
                break;
            case GameData.MSG_EVENT.PLAY_CARDS://出牌
                this.playCards(userID, event.data);
                break;
            case GameData.MSG_EVENT.GAME_OVER_S://游戏结束
                this.gameOver(userID, event.data);
            case GameData.MSG_EVENT.INROOM_ISOK_S://加入指定房间OK
                this.checkIsOk(userID);
                break;
            case GameData.MSG_EVENT.LIFT_CARDS: //掀牌
                this.liftCard(userID, event.data);
                break;
            case GameData.MSG_EVENT.SHUFFLE_CARD: //洗牌申请
                this.rePlayCards(userID, event.data);
                break;
            case GameData.MSG_EVENT.PLAYER_DISCARD://掀牌玩家扣牌
                this.liftUserDiscard(userID, event.data);
                break;
            case GameData.MSG_EVENT.SHUFFLE_CARD_ERROR://未满六张牌提出重开
                this.shuffleCardError(userID, event.data);
                break;
            default:
                log.info("Invaild Event");
                break;
            }
        }
    }

    /**
     * 玩家准备事件
     * @param {number} userID 
     */
    eventReady(userID){
        let player = this.players.get(userID);
        log.debug(userID);
        if(player){
            log.debug("  eventReady 用户存在："+userID);
            player.isReady = true;
            this.sendEvent({
                action: GameData.RSP_EVENT.ROOM_DETAIL,
                data:{
                    flag: "ROOM_DETAIL",
                    userdata: this.resultData(),
                }
            });
            this.checkGameStart();
        }else{
            log.debug(" eventReady 没有找到这个用户："+userID);
        }
    }

    /**
     * 检测是否可以开始游戏，如果所有玩家都准备了就可以开始游戏，发放牌
     */
    checkGameStart(){
        if((!(this.roomState & ROOMSTATE.GAME_START)
            && this.players.size >= GameData.Conf.MAX_PLAYER_NUM) || this.restartGame){
            log.debug(" 可以发牌");
            let allReady = true;
            for (let [k, p] of this.players) {
                if (!p.isReady) {
                    allReady = false;
                }
            }
            if (allReady) {
                log.debug("gameID:"+this.gameID+" joinOver roomID:"+this.roomID);
                // 房间停止加人
                this.pushHander.joinOver({
                    gameID: this.gameID, 
                    roomID: this.roomID,
                });
                // 通知房间内玩家开始游戏,并发牌
                this.noticeSendCards();
                this.roomState |= ROOMSTATE.GAME_START;
            }else{
                log.debug("还有人没有准备好！");
            }
        }else{
            log.debug(" 检测是否都准备好，房间状态：" + this.roomState, "房间人数：" + this.players.size);
        }
    }

    /**
     * 开始游戏，并且发放牌
     */
    noticeSendCards(){
        this.updataPlayersData();  //重置玩家信息。
        let deal = new SendCards();
        let cardList = deal.getCardList(); //三个牌数组，分派玩家

        let userCard = [];
        let index = 0;
        //给玩家分配牌
        for (let [id, p] of this.players) {
            //添加玩家时设置。
            // p.localTableId = index;//设置在桌子的位置

            p.cardList = cardList[index];//设置牌列表
            userCard.push({
                userID:id,
                card:cardList[index++]
            });
        }
        //this.landCards = cardList[3];    //斗地主的底牌，掀牛中不设置
        //生成随机位置，指定第一次做庄的人
        if(this.host === 0){
            let callnum = Math.floor(Math.random()*3);
            callnum = 0;    //为方便测试，指定第一个玩家为庄家。
            this.playerSate = callnum;
            this.callOwnerLocat = callnum;
            this.host = userCard[callnum].userID;
            log.debug("第一次做庄的人:"+userCard[callnum].userID);
        }else{
            this.getNextHost();
            log.debug("庄家:"+this.host);
        }

        this.sendEvent({
            action: GameData.RSP_EVENT.SEND_CARD,
            data:{
                userCards: userCard,            //玩家牌列表
                callOwner: this.host,       //做庄的人ID
            }
        });
    }

    /**
     * 获取下一个出牌的ID
     * @param {*} userID 
     */
    getNext(userID){
        let nextCall = this.playerSate+1;
        if(nextCall >= GameData.Conf.MAX_PLAYER_NUM){
            nextCall = 0;
        }

        for(let [id, p] of this.players){
            if(p.localTableId === nextCall){
                this.playerSate = nextCall;
                return id;
            }
        }
        return userID;
    }

    
    /**
     *  推送房间消息
     * @param {Object} event
     * @memberof Room
     */
    sendEvent(event) {
        log.debug("event:",event);
        let content = new textEncoding.TextEncoder("utf-8").encode(JSON.stringify(event));
        this.pushHander.pushEvent({
            gameID: this.gameID, 
            roomID: this.roomID, 
            pushType: 3,
            content: content,
        });
    }

    /**
     * 收到上报分数的消息调用上报分数模块接口
     * @param {number} userID 上报的玩家ID
     * @param {number} dt 上报的数据
     */
    reportPlayerScore(userID, dt){
        //房间上报数据状态
        this.roomState |= ROOMSTATE.GAME_REPORT;
        let player = this.players.get(userID);
        let event = {
            action: GameData.RSP_EVENT.REPROT_RESULT,
            data:{
                userID:userID,
                status:1,
                rank:0,
                totleScore:0,
            }
        };
        let self  = this;
        if(player){
            log.debug("userID:"+userID+" data:",dt);
            player.reportGameScoreNew(dt, function(res, err){
                if(res !== null){
                    log.info("上报成功：", res);
                    event.data.rank = res.data.rank;
                    event.data.totleScore = res.data.value;
                    event.data.status = 0;
                    self.reInitRoom(); 
                    self.sendEvent(event);
                }else{
                    log.error("report data error ", JSON.stringify(err));
                    self.sendEvent(event);
                }
            });
        }else{
            log.error("This userID is invaild");
            self.sendEvent(event);
        }
    }

    clearPlayersScore(userID, userList){
        let player = this.players.get(userID);
        if(player){
            player.clearScoreData(userList);
        }
    }

    /**
     * 重置房间中的参数
     * @param {number} userID 
     */
    reSetRoom(userID){
        if((this.roomState & ROOMSTATE.GAME_REPORT)){
            this.roomState = ROOMSTATE.NONE;
            this.landOwner = null;
            this.landCards = [];
            this.callOwnerLocat = new Player();
            let tempPlayers = this.players;
            this.players = new Map();
            for(let k of tempPlayers.keys()){
                let p = new Player();
                p.userID = k ;
                this.players.set(k,p);
            }
            this.sendEvent({
                action:GameData.RSP_EVENT.RESET_OK,
                userID:userID,
                status:0,
            });
        }
        
    }

    /**
     * 出牌,只做转发，确定下一次出牌的人
     */
    playCards(userid,dt){
        this.playerSate = this.players.get(userid).localTableId;
        log.debug(userid, dt);
        let card = dt.cards;
        let flag = dt.flag;
        this.players.get(userid).inArowCards = dt.inArowCards;
        this.players.get(userid).gradeCards = dt.gradeCards;
        if(card.length === 0){
            card = dt.preCards;
            log.debug("玩家"+userid+"不出牌");
        }
        else{
            this.prePopUserID = userid;
            log.debug("玩家"+userid+"出牌"+card);
        }

        //更新手中牌的数量，掀牌时用。
        this.players.get(userid).cardListLenth = dt.userCardsLen;

        let nextPlayer = 0;
        if(this.alreadyPop === 2){ //当前一轮玩家出牌结束
            log.debug("一轮出牌结束 下一轮"+this.prePopUserID+"先出牌");
            this.alreadyPop = 0;
            nextPlayer = this.prePopUserID;
            //this.prePopUserID = 0;  //胡闹
            this.playerSate = this.players.get(nextPlayer).localTableId;
            card = [];
            log.debug("已经有"+this.alreadyPop+"人出牌了");
        }else{
            if(flag === 'max'){//玩家出最大牌型。
                nextPlayer = userid;
                card = [];
                this.alreadyPop = 0;
            }else{
                nextPlayer = this.getNext(userid);
                this.alreadyPop++;
            }
        }

        log.debug(nextPlayer);
        this.sendEvent({
            action:GameData.RSP_EVENT.PLAY_CARDS_R,
            data:{
                userID:userid,
                nextPlayer:nextPlayer,
                cardList: card,
                hostCardsLen:this.players.get(this.host).cardListLenth,
                prePopUserID: this.prePopUserID
            }
        });
    }

    /**
     * 
     * @param {number} userid 
     * @param {any} dt 
     */
    gameOver(userid, dt){
        dt.winerID = userid;
        this.sendEvent({
            action:GameData.RSP_EVENT.GAME_OVER_R,
            data:dt
        });
    }

    /**
     * 加入指定房间的时候，判断是否所有人都加入，而且Ok了
     * @param {number} userid
     */
    checkIsOk(userid){
        let player = this.players.get(userid);
        if (player) {
            log.debug(userid + " had ready");
            player.isOk = true;
            //如果人数少了就返回
            if (this.players.size < GameData.Conf.MAX_PLAYER_NUM) {
                return ;
            }
            for (let [k, p] of this.players) {
                //如果有一个人没有OK就 不行
                if (!p.isOk) {
                    return;
                }
            }
            this.sendEvent({
                action: GameData.RSP_EVENT.INROOM_ISOK_R,
                data:{
                    canStart:1
                }
            });
        }
    }

    /**
     * 掀牌
     * @param userid 掀牌玩家的ID
     * @param dt     客户端发送的数据；
     */
    liftCard(userid,dt){
        // let Llen = this.players.get(userid).cardListLenth;    //掀牌玩家手中牌的数量
        // let Hlen = this.players.get(this.host).cardListLenth; //庄家手中牌的数量
        // let discardLen = Hlen - Llen;
        this.players.get(userid).liftAmount++;  //掀牌次数累加。
        this.liftUserID = userid;
        let cards = dt.cards;
        let flag = dt.flag;
        if(flag === 'max'){
            this.alreadyPop = 0;
            log.debug("玩家"+userid+"掀牌");
            this.sendEvent({
                action : GameData.RSP_EVENT.HOST_PUT_CARD,
                data:{
                    liftUserID: userid,
                    host: this.host,
                }
            });
            return;
        }

        if(this.players.get(userid).liftAmount === 1){//玩家第一次掀牌
            this.alreadyPop = 0;
            //发送给客户端，庄家进行一轮放牌
            log.debug("玩家"+userid+"掀牌");
            this.sendEvent({
                action : GameData.RSP_EVENT.HOST_PUT_CARD,
                data:{
                    liftUserID: userid,
                    host: this.host,
                }
            });
        }else{//掀庄家放的牌，获取下一位玩家（问题：????）
            this.alreadyPop++;
            this.playerSate = this.players.get(userid).localTableId;
            let nextPlayer = this.getNext(userid);
            if(flag === 'max')
                nextPlayer = this.host;
            this.sendEvent({
                action:GameData.RSP_EVENT.LIFT_HOST_CARDS,
                data:{
                    button: 'gameButton',
                    userid: userid,
                    liftUserID: this.liftUserID,
                    nextPlayer: nextPlayer,
                    host: this.host,
                    cardList: cards,
                    prePopUserID: this.prePopUserID,
                    hostCardsLen:this.players.get(this.host).cardListLenth,
                }
            });
        }

    }

    /**
     * 掀牌玩家扣牌响应
     * 掀牌玩家吃牌
     * 另一玩家吃牌
     * @param userid
     * @param dt
     */

    liftUserDiscard(userid, dt){
        this.players.get(userid).inArowCards = dt.inArowCards;
        this.players.get(userid).gradeCards = dt.gradeCards;
        this.prePopUserID = userid;
        this.alreadyPop++;
        this.playerSate = this.players.get(userid).localTableId;
        //如果庄家牌面最大，只给掀牌玩家展示掀牌按钮，其余玩家不做操作，选择继续掀时，扣掉相应的牌
        //放弃掀牌，则按座位次序，判断另一玩家是否掀牌
        //牌型不是最大，按序出牌，如果掀牌玩家前面的玩家吃庄家的牌，则另一玩家放牌
        //另一玩家不吃，给掀牌玩家展示游戏按钮，选择不出时，再次给掀牌玩家展示掀牌按钮
        let flag = dt.flag;   //牌型最大标识，max:牌型最大
        let cards = dt.cards; //庄家放牌数组
        let nextPlayer = this.getNext(userid);

        if(cards.length === 0){
            cards = dt.preCards;
            log.debug("玩家"+userid+"不出牌");
        }
        else{
            this.prePopUserID = userid;
            log.debug("玩家"+userid+"出牌"+cards);
        }

        if(this.alreadyPop === 3){
            log.debug("一轮掀牌结束");
            this.alreadyPop = 0;
            cards = [];
            nextPlayer = this.prePopUserID;
            log.debug("下一位出牌玩家"+nextPlayer);
        }

        //更新手中牌的数量，掀牌时用。
        this.players.get(userid).cardListLenth = dt.userCardsLen;

        let Llen = this.players.get(this.liftUserID).cardListLenth;    //掀牌玩家手中牌的数量
        let Hlen = this.players.get(this.host).cardListLenth; //庄家手中牌的数量
        let discardLen = Hlen - Llen;

        if((userid === this.liftUserID) || (this.alreadyPop !== 1)){//掀牌玩家或庄家吃其他玩家的牌
            //游戏进入正常出牌环节。

            if(flag === 'max'){//玩家出最大牌型。
                nextPlayer = userid;
                cards = [];
                this.alreadyPop = 0;
            }

            this.sendEvent({
                action:GameData.RSP_EVENT.PLAY_CARDS_R,
                data:{
                    userID:userid,
                    nextPlayer:nextPlayer,
                    cardList: cards,
                    hostCardsLen:this.players.get(this.host).cardListLenth,
                    prePopUserID: this.prePopUserID
                }
            });
        }else{//另一玩家 或庄家
            let button = '';
            if(flag === 'max'){//只给掀牌玩家展示掀牌按钮
                nextPlayer = this.liftUserID;
                button = 'liftCardButton';
                cards = [];
            }else{//另一玩家展示出牌按钮，掀牌玩家先展示出牌按钮，不出，在展示掀牌按钮。
                button = 'gameButton';
            }

            this.sendEvent({
                action:GameData.RSP_EVENT.PLAYER_DISCARD,
                data:{
                    button: button,
                    userid: userid,
                    liftUserID: this.liftUserID,
                    flag: flag,
                    nextPlayer: nextPlayer,
                    host: this.host,
                    cardList: cards,
                    prePopUserID: this.prePopUserID,
                    discardLen: discardLen,   //玩家需要扣掉几张牌
                    hostCardsLen:this.players.get(this.host).cardListLenth,
                }
            });
        }
    }

    /**
     * 如果是庄家发出的消息，进入掀牌逻辑
     * 如果是其他玩家，游戏结束
     * @param userid
     * @param dt
     */
    rePlayCards(userid, dt){
        let nextPlayer = this.getNext(userid);
        if(userid === this.host){//庄家提出的，给其他玩家显示掀牌按钮
            log.debug("庄家申请重开");
            this.sendEventForRePlay(GameData.RSP_EVENT.HOST_REPLAY_CARD, nextPlayer);
        }else if( this.liftUserID !== 0 && userid !== this.host && userid !== this.liftUserID) {
            //既不是庄家，又不是掀牌玩家
            log.debug(userid+"提出重开，gameServer拒绝");
            this.sendEvent({
                action:GameData.RSP_EVENT.CANT_REPALY_CARD,
                data:{
                    type:'REFUSE_PLAY',
                    message:"客官，等会，别着急"
                }
            })
        }else{//其他玩家
            if(dt.LEN === 0){//如果其他玩家未出牌，直接重新发牌，换庄家
                log.debug("玩家"+userid+"同意重开");
                this.sendEventForRePlay(GameData.RSP_EVENT.OTHER_REPLAY_CARD, nextPlayer);
            }else{//其他玩家出牌。发送消息计算得分，展示分数板
                log.debug("玩家"+userid+"提出重开");
                let data = {
                    flag: 'PLAYER_WIN',
                    host: this.host,
                    liftUserID: this.liftUserID,
                    userdata: this.resultData(),
                };
                this.sendEventResult(data);
            }
        }
        this.rePlayCardNumber++;
        if(this.rePlayCardNumber === 3){//游戏结束
            let temp  = this.players.get(this.host).inArowCards.length;
            if(temp>6){
                let data = {
                    flag: 'HOSt_WIN',
                    host: this.host,
                    liftUserID: this.liftUserID,
                    userdata: this.resultData(),
                };
                this.sendEventResult(data);
            }else if(temp === 0){
                this.rePlayCardNumber = 0; //重新发牌
                // this.reNewPlayCard(this.getNext(this.host));
                this.noticeSendCards();
            }else{//庄家出牌不够六张，中途结束游戏
                let data = {
                    flag: 'HOST_FAIL',
                    host: this.host,
                    liftUserID: this.liftUserID,
                    userdata: this.resultData(),
                };
                this.sendEventResult(data);
            }
            log.debug("Restart Game!");
            this.updataPlayersData();
        }
        this.restartGame = true; //重开
    }

    /**
     * 发送游戏数据，显示得分面板
     * @param data
     */
    sendEventResult(data){
        this.sendEvent({
            action: GameData.RSP_EVENT.DISPLAY_RESULT,
            data: data,
        })
    }

    /**
     * 发送消息显示掀牌
     * @param action
     * @param nextPlayer
     */
    sendEventForRePlay(action, nextPlayer){
        let Hlen = this.players.get(this.host).cardListLenth; //庄家手中牌的数量
        this.sendEvent({
            action: action,
            data:{
                nextPlayer:nextPlayer,
                host:this.host,
                hostCardsLen:Hlen, //庄家手中的牌的数量
            }
        });
    }

    /**
     * 重新发牌，转下一位庄家
     * @param nextHost
     */
    reNewPlayCard(nextHost){
        let deal = new SendCards();
        let cardList = deal.getCardList(); //三个牌数组，分派玩家

        let userCard = [];
        let index = 0;
        for (let [id, p] of this.players) {
            p.cardList = cardList[index];//设置牌列表
            userCard.push({
                userID:id,
                card:cardList[index++]
            });
        }

        this.playerSate = this.players.get(nextHost).localTableId;
        this.callOwnerLocat = this.players.get(nextHost).localTableId;
        this.host = nextHost;
        this.alreadyPop = 0;                   //记录一轮出牌中，已经出牌的玩家。
        this.prePopUserID = 0;                 //一轮游戏中前一位出牌玩家的ID
        this.rePlayCardNumber = 0;             //当前游戏中同意洗牌的人数
        this.liftUserID = 0;

        this.sendEvent({
            action: GameData.RSP_EVENT.SEND_CARD,
            data:{
                userCards: userCard,            //玩家牌列表
                callOwner: this.host,       //做庄的人ID
            }
        });
    }

    /**
     * 未满六张牌提出重开
     * @param userid
     * @param dt
     */
    shuffleCardError(userid, dt){
        log.debug(userid+"未满六张牌提出重开");
        let data = {
            flag: 'ERROR',
            host: this.host,
            liftUserID: this.liftUserID,
            userdata: this.resultData(),
        };
        this.sendEventResult(data);
    }

    /**
     * 检测房间中玩家牌的数量
     * 如果都小于6，则重开
     * @return {boolean}
     */
    checkPlayerCardLen(){
        let temp = 0;
        for (let [id, p] of this.players) {
            if(p.cardListLenth < 6)
                temp++
        }
        if(temp === 3)
            return true;
        return false;
    }


    /**
     * 重开时调用，重置修改房间参数
     */
    getNextHost(){
        this.playerSate = this.players.get(this.host).localTableId;
        let nextHost = this.getNext(this.host);
        this.playerSate = this.players.get(nextHost).localTableId;
        this.callOwnerLocat = this.players.get(nextHost).localTableId;
        this.host = nextHost;
        this.alreadyPop = 0;                   //记录一轮出牌中，已经出牌的玩家。
        this.prePopUserID = 0;                 //一轮游戏中前一位出牌玩家的ID
        this.rePlayCardNumber = 0;             //当前游戏中同意洗牌的人数
        this.liftUserID = 0;
    }

    /**
     * 封装返回的数据
     * @return {Map<any, any>}
     */
    resultData(){
        let userData = [];
        for (let [id, p] of this.players) {
            let cards = p.gradeCards;
            if(!(p.inArowCards instanceof Array))
                p.inArowCards = [];
            if(p.inArowCards.length < 6)//少于六张，清空统计数组。
                cards = [];
            let data = {
                localTableId: p.localTableId,
                userid: id,
                gradeCards: cards,
                nickName: p.nickName,
                avator: p.avator,
                liftAmount: p.liftAmount,
            };
            userData.push(data);
        }
        return userData;
    }

}


module.exports = Room;

