/**
 * 提示玩家出牌
 */
import {pokerUtil} from "../utils/pokerUtil.js";
import {gameUtil} from "../utils/gameUtil.js";
import {arrayUtil} from "../utils/arrayUtil.js";
import {relationType} from "../type/relationType.js";
import {pokerType} from "../type/pokerType.js";

export class prompt {
    /**
     * 构造函数
     * @param poker     当前玩家手中的牌
     * @param pre_arr   前一位玩家出牌
     */
    constructor(poker, pre_arr){
        this.pokers = poker;
        //console.log(this.pokers)
        this.pre_arr = pre_arr;
        this.poker_util = pokerUtil.getInstance();
        this.game_util = gameUtil.getInstance();
    }

    /**
     * 返回提示的出牌编号,前提玩家出牌合理
     * 特殊情况 4,5,9,10未做处理
     * @return {*} 数组，如果无提示，返回空数组
     */
    promptPoker(){
        if(this.pre_arr.length === 0)//前一玩家未出牌
            return this.promptStandPlayer(this.pokers);
        let pre_key = this.poker_util.convertArrayToKey(this.pre_arr); //将数组转换为键值

        if(!this.poker_util.isSamePoker(this.pre_arr)){//前一玩家出牌为掀牛特殊牌型
            console.log("掀牛特殊牌型");
            let key = this.game_util.prompt(pre_key);
            if(key === 'max'){//前一位玩家牌型最大
                console.log("没有比他大的牌！");
                return [];
            }
            else{
                let array = this.poker_util.convertKetToArray(key);
                //console.log(array);
                if(array.length !== 18){
                    if(arrayUtil.isContained(this.pokers, array))//玩家手中有此牌，直接返回数组
                        return array;
                    else{
                        console.log("没有比他大的牌！");
                        return [];
                    }
                }else{
                    //console.log(array);
                    let temp = [];
                    for(let i = 0; i < array.length; i++){
                        temp.push(array[i]);
                        if((i+1) % 6===0){
                            //console.log(temp);
                            if(arrayUtil.isContained(this.pokers, temp))//玩家手中有此牌，直接返回数组
                                return temp;
                            temp = [];
                        }
                    }
                    console.log("没有比他大的牌！");
                    return [];
                }
            }
        }else{//前一玩家出牌为对子，按子或亮子 特殊情况
            let arr = [];
            let arr_b = [];
            if(this.pre_arr.length === 1){
                if(this.pre_arr[0] === 14){
                    arr = [];
                    arr_b = [];
                }else{
                    arr.push(this.pre_arr[0]+1);
                    arr_b = arr;
                }
            }else{
                arr = this.game_util.promptForSamePoker(this.pokers, this.pre_arr);
                arr_b = arr;
            }

            //判断出此牌是否会拆开掀牛特殊牌型，若会，编号加一
            while(this.decollatePokerType(arr)){
                for(let i in arr){
                    arr[i]=arr[i]+1;
                    if(arr[i]>14)
                        break;
                }
            }
            //返回最优的结果，
            if(arrayUtil.isContained(this.pokers, arr)){
                return arr;
            }else{
                if(arrayUtil.isContained(this.pokers, arr_b))
                    return arr_b;//如果实在没有，则忍痛拆开掀牛牌型；
                console.log("没有比他大的牌！");
                return [];
            }
        }
    }

    /**
     * 玩家首出牌时
     * @param array
     * @return {*}
     */
    promptStandPlayer(array){
        //console.log(array);
        let relation_type = new Map(relationType);
        let poker_Type = new Map(pokerType);

        let pokerArr = [];
        for(let [key, value] of poker_Type){
            let arr = this.poker_util.convertKetToArray(key);
            if(arrayUtil.isContained(array, arr)) {
                pokerArr = arr;
                if (relation_type.get(value) === 'max') {//返回掀牛最大牌型
                    return arr;
                }
            }
        }
        //无掀牛最大牌型时，返回掀牛牌型（鱼）
        return pokerArr;
    }

    /**
     * 判断 提示所出的牌会不会拆开玩家手中的掀牛特殊牌型
     * @param arr
     */
    static decollatePokerType(pokers, arr){
        console.log("decollatePokerType");
        let specialPokerType = ['1-2-3', '8-11-14'];
        for(let i in specialPokerType){
            let array = new pokerUtil().convertKetToArray(specialPokerType[i]);
            if(arrayUtil.isContained(array, arr[0])){
                return arrayUtil.isContained(pokers, array);//玩家手中有此种牌型，判断提示牌中是否有此牌
            }
        }
        return false;
    }

    decollatePokerType(arr){
        console.log("decollatePokerType");
        let specialPokerType = ['1-2-3', '8-11-14'];
        for(let i in specialPokerType){
            let array = new pokerUtil().convertKetToArray(specialPokerType[i]);
            if(arrayUtil.isContained(array, arr[0])){
                return arrayUtil.isContained(this.pokers, array);//玩家手中有此种牌型，判断提示牌中是否有此牌
            }
        }
        return false;
    }
}