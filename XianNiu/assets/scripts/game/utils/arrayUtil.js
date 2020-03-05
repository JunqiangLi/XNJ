//数组工具类
export class arrayUtil {
    constructor(){

    }

    /**
     * 是否被包含,是返回true,不是返回false
     */
    static isContained =(a, b)=>{
        //console.log(a);
        //console.log(b);
        if(!(a instanceof Array) || !(b instanceof Array)) return false;
        if(a.length < b.length) return false;
        let i = 0, j = 0;
        while (true){
            if(a[i] === b[j])
                j++;
            i++;
            if(i === a.length && j < b.length)
                return false;
            if(j === b.length)
                return true;
        }
        return false;
    }
    /**
     * 删除数组中的一组元素
     * 扣牌,出牌后刷新当前牌
     * @param a 被操作的数组（当前牌）
     * @param b 需要删去的值（扣掉的牌）
     */

    static abandon =(a, b)=>{
        //console.log(a, b)
        if(!(a instanceof Array) || !(b instanceof Array)) return false;
        if(a.length < b.length) return false;

        for(let i = 0; i < b.length; i++){
            a.splice(a.findIndex(item => item === b[i]), 1)
        }
        return a;
    }


    /**
     * 给数组添加一组元素
     * @param abandon_poker 已出的牌
     * @param abandon 刚刚出的牌
     */
    static add(abandon_poker, abandon){
        console.log(abandon_poker);
        console.log(abandon);

        for(let i = 0; i < abandon.length; i++){
            abandon_poker.push(abandon[i]);
        }
        return abandon_poker;
    }

    /**
     * 数组每一元素加1
     * @param arr
     * @return {Array}
     */
    static everyElementAdd_1(arr){
        let array = []
        for(let i = 0; i < arr.length; i++)
            array.push(arr[i]+1);
        return array;
    }
}