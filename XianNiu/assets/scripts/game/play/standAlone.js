/**
 * 单机版，系统判断是否拥有头家基本牌型
 */
import {leaderType} from "../type/leaderType.js";
import {arrayUtil} from "../utils/arrayUtil.js";
import {pokerUtil} from "../utils/pokerUtil.js";
import {numSort} from "../utils/numSort.js";

export class standAlone {
    /**
     * 玩家手中的牌
     * @param arr
     */
    constructor(arr){
        this.poker_utils = pokerUtil.getInstance();
        this.arr = arr;
        this.leadType = new Map(leaderType);//初始化头家基本牌型
    }

    /**
     * 是否有头家基本牌型
     * @return {*}
     */
    isContain(){
        for(let [key, value] of this.leadType){
            let poker = this.poker_utils.convertKetToArray(key);
            poker = numSort.Sort(poker);
            if(arrayUtil.isContained(this.arr, poker)){
                return poker;
            }
        }
        return null;
    }
}