//发牌逻辑, 生成48个随机数，分三组
const numSort = require("./ArrayTools");
const pokerIndex = [
    ['1', 1], ['2', 1], ['3', 1], ['4', 1],
    ['5', 2], ['6', 2], ['7', 2], ['8', 2],
    ['9', 3], ['10', 3], ['11', 3], ['12', 3],
    ['13', 4], ['14', 4],
    ['15', 5], ['16', 5],
    ['17', 6], ['18', 6], ['19', 6], ['20', 6],
    ['21', 7], ['22', 7], ['23', 7], ['24', 7],
    ['25', 8], ['26', 8], ['27', 8], ['28', 8],
    ['29', 9], ['30', 9],
    ['31', 10], ['32', 10],
    ['33', 11], ['34', 11], ['35', 11], ['36', 11],
    ['37', 12], ['38', 12], ['39', 12], ['40', 12],
    ['41', 13], ['42', 13], ['43', 13], ['44', 13],
    ['45', 14], ['46', 14], ['47', 14], ['48', 14],
];

let arrays = [];
let a = [];
let b = [];
let c = [];
class SendCard{
    constructor(){
        a = [];
        b = [];
        c = [];
        arrays = [];
        this.map = new Map(pokerIndex);
        this.Random();
        this.splitArray();
        this.a = a;
        this.b = b;
        this.c = c;

    }
    //随机数生成函数
    generateRandom(){
        let rand = parseInt(Math.random()*48);
        for(let i = 0 ; i < arrays.length; i++){
            if(arrays[i] === rand+1){
                return false;
            }
        }
        arrays.push(rand+1);
    }
    //初始化数组
    Random(){
        for(let i = 0; ; i++){
            if(arrays.length<48){
                this.generateRandom()
            }else{
                break;
            }
        }
        //console.log(arrays)
    }

    //将数组切分成三个 a,b,c
    splitArray(){
        let i = 0;
        while(i < 48){
            for(let j = 0; j < 16; j++){
                a.push(arrays[i++]);
            }
            for(let j = 0; j < 16; j++){
                b.push(arrays[i++]);
            }
            for(let j = 0; j < 16; j++){
                c.push(arrays[i++]);
            }
        }

        numSort.Sort(a);
        numSort.Sort(b);
        numSort.Sort(c);
        this.transform(a);
        this.transform(b);
        this.transform(c);

    }

    //将数组转化为特定的值
    transform(arr){
        //this.map = new Map(pokerIndex);
        for(let i = 0; i < arr.length; i++){
            arr[i] = this.map.get(''+arr[i]);
        }
        //console.log(arr);
    }
    getCardList(){
        return [this.a, this.b, this.c];
    }
}

module.exports = SendCard;

