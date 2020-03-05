import {arrayUtil} from "../game/utils/arrayUtil.js";

export class cardUtils {

    /**
     * /将打出的牌从收中的牌中删除
     * @param array  hangCards
     * @param abandon  打出的牌
     * @return {boolean|*}
     */
    reduceCards(array, abandon){
        return arrayUtil.abandon(array, abandon);
    }

    /**
     * 将打出的牌添加到已打出的牌中
     * @param array  已经打出的牌
     * @param abandon 刚出的牌
     */
    addCards(array, abandon){
        return arrayUtil.add(array, abandon)
    }

    /**
     * 系统玩家自动出牌
     * @param array  当前系统玩家手中的牌
     */
    standPlayerDealPoker(array){
        let arr = prompt.promptStandPlayer(array);
        return arr;
    }

    /**
     * 打印玩家出牌情况
     * @param array 玩家出牌数组
     * @param index 玩家编号
     * @constructor
     */
    Print(array, index){
        if(array.length !== 0){
            console.log("玩家"+index+"出牌：");
            console.log(array);
        }else{
            console.log("玩家"+index+"不出牌！");
        }
    }



}