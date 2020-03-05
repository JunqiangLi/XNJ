//发牌逻辑, 生成48个随机数，分三组

import {pokerIndex} from "../type/pokerIndex.js";
import {numSort} from "../utils/numSort.js";

let arrays = [];
let a = [];
let b = [];
let c = [];

export class deal {

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
    static creat(){
        return new deal();
    }
}