import GameButton from "./GameButton";
let playerInfo = require('../data/PlayerInfo');

const pokerType = [
    //两张
    ['4-5', 2],//'对喜'
    ['4-4-5', 3],//'三喜' 三芯
    ['4-5-5', 22],
    ['4-4-5-5', 5],//'四喜' 五芯或一亮子
    ['9-10', 2],//'对牛'

    //三张
    ['9-9-10', 3],//'三牛'
    ['9-10-10', 3],

    //四张
    ['9-9-10-10', 1],//'四牛' 算亮子

    //六张
    ['1-1-1-1-2-3', 1],//'鱼亮'
    ['1-2-2-2-2-3', 1],
    ['1-2-3-3-3-3', 1],
    ['8-8-8-8-11-14', 1],//'摆亮'
    ['8-11-11-11-11-14', 1],
    ['8-11-14-14-14-14', 1],
    //九张
    ['1-1-1-2-2-2-3-3-3', 3],//三鱼，算三芯
    ['8-8-8-11-11-11-14-14', 3],//三摆，算三芯
    //12张
    ['1-1-2-2-3-3-8-8-11-11-14-14', 5]//龙凤朿：双鱼+双摆，无条件首朿，赢两家
];
const {ccclass, property} = cc._decorator;
@ccclass

export default class result extends cc.Component {

    @property({
        type: cc.Node
    })
    player = null;
    @property({
        type: cc.Node
    })
    player_2 = null;
    @property({
        type: cc.Node
    })
    player_3 = null;

    @property({
        type: cc.Node
    })
    guanBi = null;

    @property({
        type: cc.SpriteFrame
    })
    wonOrFail = [];

    start(){
        let data = playerInfo.gameServerData;
        result.instance = this;
        console.log(data);
        this.replayData(data);
    }
    /**
     * 返回场景信息
     */
    static get ins() {
        return result._instance;
    }

    /**
     * 关闭按钮响应事件
     */
    onClickGuanBi(){
        console.log("关闭分数面板");
        GameButton.ins.startGame();
    }

    /**
     * 展示数据
     * @param data
     */
    replayData(data){
        let score = this.returnScore(data);
        let userData = data.userdata;

        let playerScore = 0;
        let idx = 0;

        //typeof(obj) ==
        //玩家一
        this.player.getChildByName("player").getComponent(cc.Label).string = ""+userData[0].nickName;
        console.log(this.player.getChildByName("player"));
        playerScore = typeof(score.get(userData[0].userid)) === "undefined" ? score.get('100') : score.get(userData[0].userid);
        idx = playerScore > 0 ? 0 : 1;//图片下标

        this.player.getChildByName("img").getComponent(cc.Sprite).spriteFrame = this.wonOrFail[idx];
        console.log(this.player.getChildByName("img"));
        this.player.getChildByName("grade").getComponent(cc.Label).string = ""+playerScore+"分";
        console.log(this.player.getChildByName("grade"));

        //玩家二
        this.player_2.getChildByName("player").getComponent(cc.Label).string = ""+userData[1].nickName;
        playerScore = typeof(score.get(userData[1].userid)) === "undefined" ? score.get('100') : score.get(userData[1].userid);
        idx = playerScore < 0 ? 1 : 0;
        console.log(score.get('100') , idx);
        this.player_2.getChildByName("img").getComponent(cc.Sprite).spriteFrame = this.wonOrFail[idx];
        this.player_2.getChildByName("grade").getComponent(cc.Label).string = ""+playerScore+"分";

        //玩家三
        this.player_3.getChildByName("player").getComponent(cc.Label).string = ""+userData[2].nickName;
        playerScore = typeof(score.get(userData[2].userid)) === "undefined" ? score.get('100') : score.get(userData[2].userid);
        idx = playerScore > 0 ? 0 : 1;
        this.player_3.getChildByName("img").getComponent(cc.Sprite).spriteFrame = this.wonOrFail[idx];
        this.player_3.getChildByName("grade").getComponent(cc.Label).string = ""+playerScore+"分";
    }


    /**
     * 统计分数
     * @param array
     * @return {number}
     */
    calculatingScore(array){
        let m = new Map(pokerType);
        let score = 0;
        for(let i = 0; i < array.length; i++){
            let temp = m.get(array[i]);
            if(temp != null){
                score+=temp;
            }
        }
        return score;
    }

    returnScore(data){
        let flag = data.flag;
        let host = data.host;
        let liftUserID = data.liftUserID;
        let userData = data.userdata;


        let gameData = new Map();
        let score = new Map();

        for(let i = 0; i < userData.length; i++){
            gameData.set(userData[i].userid, userData[i]);
        }

        console.log(gameData);
        let hostArrScore = this.calculatingScore(gameData.get(host).gradeCards);
        let liftAmount = liftUserID === 0? 0:gameData.get(liftUserID).liftAmount;
        let liftArrScore = liftUserID === 0? []:this.calculatingScore(gameData.get(liftUserID).gradeCards);

        if(flag === 'HOSt_WIN' || flag === 'HOST_WIN'){//庄家赢

            score.set(host, hostArrScore+liftAmount+1);
            score.set(liftUserID, -(hostArrScore+liftAmount+1));
            score.set('100', -(hostArrScore+liftAmount+1));
        }else if(flag === 'PLAYER_WIN' || flag === 'HOST_FAIL'){// 庄家输
            if(liftUserID === 0){//庄家中途放弃出牌，庄家-10， 其余玩家+5
                score.set(host, -10);
                score.set('100', 5);
            }else{
                score.set(host, -(liftArrScore+liftAmount));
                score.set(liftUserID, liftArrScore+liftAmount);
                score.set(100, 0);
            }
        }else if(flag === 'ERROR'){//异常结束。
            if(liftUserID === 0){//庄家中途放弃出牌，庄家-10， 其余玩家+5
                score.set(host, -10);
                score.set('100', 5);
            }else{
                score.set(host, liftAmount);
                score.set(liftUserID, -liftAmount);
                score.set('100', 0);
            }
        }
        console.log(score);

        return score;
    }

}