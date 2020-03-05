/**
 * 策略工具类，主要判断玩家出牌是否符合游戏策略
 * 前一玩家牌型为掀牛特殊牌型是调用此类
 */
import {pokerType} from "../type/pokerType.js";
import {relationType} from "../type/relationType.js";
import {pokerUtil} from "./pokerUtil.js";
import {specialPokerRelation} from "../type/specialPokerRelation.js";
import {arrayUtil} from "./arrayUtil.js";

export class gameUtil {
    constructor() {
        this.poker_util = pokerUtil.getInstance();
        this.map = new Map(relationType);//牌的对应关系
        this.poker = new Map(pokerType);//牌类型对应的编号
    }

    //单例模式
    static getInstance() { 
        if (!gameUtil.intance) {
            gameUtil.intance = new gameUtil();
        }
        return gameUtil.intance;
    }

    /**
     * 判断用户牌型是否正确 前一玩家牌型为掀牛特殊牌型是调用此方法判断
     * @param pokerKind 用户牌的数组
     * @return 对应牌型的键值，若不存在，返回null
     */
    kindIsOk(pokerKind) {
        let key = this.poker_util.convertArrayToKey(pokerKind);

        let flag = this.poker.get(key);
        return flag;
    }

    /**
     * 判断玩家的牌是否大于前一家的牌 前一玩家牌型为掀牛特殊牌型是调用此方法判断
     * @param pre_key 前一家的牌的键值
     * @param key     下一家的牌的键值
     * @return {boolean}
     */
    judgeRelation(pre_key, key) {
        let temp = this.poker.get(pre_key);
        if (this.map.get(temp) === this.poker.get(key)) {
            return true;
        }
        return false;
    }

    /**
     * 前一玩家出牌不是最大类型牌时，一副相同的牌判断出牌
     * 特殊情况：1、长串和拐三 2、铜锤六和冠六 3、红八和牛八 4、梅十和花十
     * @param pre_arr 前一玩家出牌数组
     * @param arr     当前玩家出牌数组
     * @return {boolean}
     */
    judgeRelationForSamePoker(pre_arr, arr) {
        if (pre_arr.length !== arr.length)
            return false;
        let key = this.poker_util.convertArrayToKey(arr);
        let temp = this.poker.get(key);
        if (temp === 15 || temp === 19 || temp === 20 || temp === 24) {//玩家出对牛，三牛，四牛
            return true
        }

        let specialRelation = new Map(specialPokerRelation);
        if (arr[0] === specialRelation.get(pre_arr[0]) || arr[0] <= pre_arr[0])
            return false;
        else if (arr[0] > pre_arr[0])
            return true;

    }

    /**
     * 提示用户出牌 前一玩家牌型为掀牛特殊牌型是调用此方法提示
     * @param pre_key 前一位玩家出牌键值
     * @return string &Array返回玩家需要出牌的键值
     *         若前一玩家的牌最大，返回max
     *         若有多种解，则返回字符串：x-x-x型,18张牌
     */
    prompt(pre_key) {
        let key = this.poker.get(pre_key);
        let value = this.map.get(key);
        //console.log(isNaN(value))
        if (!isNaN(value))
            return this.poker_util.findKey(this.poker, value);
        else if (value === 'max')
            return 'max';
        else {
            let arr = this.poker_util.convertKetToArray(value);

            let arr2 = [];
            console.log(arr);
            for (let i = 0; i < arr.length; i++)
                arr2.push(this.poker_util.findKey(this.poker, arr[i]));
            //console.log(arr2);
            return this.poker_util.convertArrayToKey(arr2);
        }
    }

    /**
     * 提示用户出牌, 前一玩家出对子，按子或亮子时
     * 特殊情况：1、长串和拐三 2、铜锤六和冠六 3、红八和牛八 4、梅十和花十
     * @param pre_arr 前一玩家出牌数组
     * @return {Array} 下一玩家应出牌数组
     */
    promptForSamePoker(poker, pre_arr) {
        let pre_num = pre_arr[0];
        let num;
        //特殊情况：3、长串和拐三 5、铜锤六和冠六 8、红八和牛八 11、梅十和花十
        if (pre_num === 3 || pre_num === 5 ||
            pre_num === 8 || pre_num === 11)
            num = pre_num + 2;
        else
            num = pre_num + 1;
        let arr = [];

        for (let i = 0; i < pre_arr.length; i++)
            arr.push(num);

        while (true) {
            if (arrayUtil.isContained(poker, arr)) {//对喜由牌，牛八牛九牌做特殊处理，如果玩家手中的牌有喜子或牛的话，编号加一
                if (arr[0] === 4 || arr[0] === 5) {
                    if (arrayUtil.isContained(poker, [4, 5]))
                        arr = arrayUtil.everyElementAdd_1(arr);
                } else if (arr[0] === 9 || arr[0] === 10) {
                    if (arrayUtil.isContained(poker, [9, 10]))
                        arr = arrayUtil.everyElementAdd_1(arr);
                } else {
                    break;
                }
            } else {
                arr = arrayUtil.everyElementAdd_1(arr);
            }
            if (arr[0] > 14) {
                num = 9;
                arr = [];
                for (let i = 0; i < pre_arr.length; i++) {
                    arr.push(num);
                    num++;
                    if (num > 10)
                        num = 9;
                }
                break;
            }
        }
        return arr;
    }

    /**
     * 统计分数
     * @param array     赢牌
     * @constructor
     */
    StaScore(array){

    }
}