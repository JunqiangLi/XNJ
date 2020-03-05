
import {numSort} from "./numSort.js";
import {pokerType} from "../type/pokerType.js";
import {relationType} from "../type/relationType.js";
import {arrayUtil} from "./arrayUtil";

export class pokerUtil {

    //单例模式
    static getInstance(){
        if(!pokerUtil.intance){
            pokerUtil.intance = new pokerUtil();
        }
        return pokerUtil.intance;
    }

    /**
     * 将牌数组转换为键值
     * @param arr
     * @return {string}
     */
    convertArrayToKey(arr){
         numSort.Sort(arr);
         let key = ''+arr[0];
         for(let i = 1; i < arr.length; i++){
             if(arr[i] !== null)
                key+='-'+arr[i];
         }
         return key;
     }

    /**
     * 将键值转换为数组,若字符串为空，返回null
     * @param key
     * @return {*}
     */
    convertKetToArray(key){
        if(key == null)
            return null;
        //console.log(key);
        let arr = key.split('-');

        for(let i = 0; i < arr.length; i++){
            arr[i] = parseInt(arr[i]);
        }
        //console.log(arr)
        return arr;
    }

    /**
     * 根据values 返回键值
     * @param obj values存在的map
     * @param value
     * @param compare
     * @return {string} 键值
     */
    findKey(map, value) {
        for(let [key, this_value] of map){
            if(this_value === value)
                return key;
        }
    }

    /**
     * 判断出牌是否为对子、按子或亮子
     * @param arr
     * @return {boolean}
     */
    isSamePoker(arr){
        numSort.Sort(arr);
        //console.log(arr[arr.length-1])
        if(arr[0] === arr[arr.length-1])
            return true;
        return false;
    }

    /**
     *  玩家出牌是否为掀牛最大牌型
     * @param arr
     * @return {*}
     */
    static isMAX(arr){
        if(arr.length === 0)
            return 'false';
        if(arr.length === 1 && arr[0] === 14)
            return 'max';
        if(arr.length === 1)
            return "false";
        let key = pokerUtil.getInstance().convertArrayToKey(arr);
        let poker_type = new Map(pokerType);

        let relation_type = new Map(relationType);

        let value = poker_type.get(key);
        //console.log(value);
        return relation_type.get(value);
    }

    /**
     * 返回最大牌型
     * @param array
     * @return {*}
     */
    static maxType(array){
        let poker_type = new Map(pokerType);
        let relation_type = new Map(relationType);

        for(let [key, value] of poker_type){
            let arr = pokerUtil.getInstance().convertKetToArray(key);
            if(arrayUtil.isContained(array, arr)) {
                if (relation_type.get(value) === 'max') {//返回掀牛最大牌型
                    return arr;
                }
            }
        }
        return [];
    }
 }