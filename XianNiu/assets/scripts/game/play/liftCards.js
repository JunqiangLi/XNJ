
import {pokerUtil} from "../game/utils/pokerUtil.js";
import {arrayUtil} from "../game/utils/arrayUtil.js";
/**
 * 掀牌处理类
 */
export default class liftCards{

    /**
     * 构造器
     * @param liftedPlayer 被掀的玩家
     * @param player       掀牌的玩家
     */
    constructor(liftedPlayer, player, playStore){
        this.liftedPlayer = liftedPlayer;
        this.player = player;
        this.playStore = playStore;
        this.screenCards = []; //存储最后六张赢牌
        this.unlessCards = [];
    }

    /**
     * 扣掉多余的牌
     * @constructor
     */
    ASCards(){
        let cardsAmount = this.liftedPlayer.handPokers.length;
        let amount = this.player.handPokers.length;

        let ASamount = amount - cardsAmount; // 需要扣掉的牌
        let flag = this.ScreenCards();

        if(!flag){
            return false;
        }else{
            let arr = arrayUtil.abandon(this.player.handPokers, this.screenCards); //得到一些杂牌
            this.unlessCards = arr;
            if(arr.length < ASamount)
                return false;
            let array = [];
            for(let i = 0; i < arr.length; i++)
                array.push(arr[i]);
            this.unlessCards = arrayUtil.abandon(this.unlessCards, array);// 刷新杂牌
            return array;//返回需要扣掉的牌；
        }
    }

    /**
     * 筛选不能扣掉的牌
     */
    ScreenCards(){
        let arr = this.player.handPokers;
        if(arr.length <= 6){//如果手中的牌小于或等于六张时，驳回掀牌请求
            return false;
        }

        while(this.screenCards.length < 6){
            let array = pokerUtil.maxType(arr);//返回最大牌型
            if(array.length !== 0){
                for(let i = 0; i < array.length; i++)//将最大牌型的数组添加到筛选牌中
                    this.screenCards.push(array[i]);
                arr = arrayUtil.abandon(arr, array);
            }else{
                return false;
            }
        }
        return true;
    }

    /**
     * 返回需要扣掉牌的数量
     * @constructor
     */
    AbandonCardsNum(){
        let cardsAmount = this.liftedPlayer.handPokers.length;
        let amount = this.player.handPokers.length;

        return  amount - cardsAmount; // 需要扣掉的牌
    }


}