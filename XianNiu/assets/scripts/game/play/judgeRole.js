/**
 * 判断玩家出牌是否符合游戏规则
 */
import {gameUtil} from "../utils/gameUtil.js";
import {pokerUtil} from "../utils/pokerUtil.js";
import {numSort} from "../utils/numSort.js";
import {relationType} from "../type/relationType.js";
import {pokerType} from "../type/pokerType.js";

export class judgeRole {
    /**
     * 构造函数
     * @param pre_arr  前一位玩家出的牌
     * @param arr      当前玩家出牌
     */
    constructor(pre_arr, arr){
        numSort.Sort(pre_arr);
        numSort.Sort(arr);
        this.pre_arr = pre_arr;
        this.arr = arr;
        console.log(this.arr);
        this.game_util = gameUtil.getInstance();
        this.poker_util = pokerUtil.getInstance();
        this.relation = new Map(relationType);
        this.poker_type = new Map(pokerType);

    }

    /**
     * 前一玩家出牌不是最大类型，判断出牌
     * @return {boolean}
     */
    judge(){
        if(!this.poker_util.isSamePoker(this.arr)){//如果牌型为掀牛特殊牌型时
            let identifier = this.game_util.kindIsOk(this.arr);//该牌型对应的编号
            //console.log(identifier)
            if(identifier != null){
                if(this.pre_arr.length === 0)
                    return true;
                let pre_key = this.poker_util.convertArrayToKey(this.pre_arr);
                let key = this.poker_util.convertArrayToKey(this.arr);
                return this.game_util.judgeRelation(pre_key, key)
            }else{
                return false;
            }
        }else{
            if(this.pre_arr.length === 0)
                return true;
            else
                return this.game_util.judgeRelationForSamePoker(this.pre_arr, this.arr);
        }
    }


    /**
     * 判断玩家出牌是否符合游戏策略
     * @return {boolean}
     */
    judge_role(){
        let key = this.poker_util.convertArrayToKey(this.pre_arr);
        let value = this.poker_type.get(key);
        if(this.relation.get(value) !== 'max')
            return this.judge();
        else{
            //console.log("你没有比他大的牌");
            return false;
        }

    }
}