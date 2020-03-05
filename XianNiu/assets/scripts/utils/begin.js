
let arr = []
let playerInfo = require('../data/PlayerInfo');
const {ccclass, property} = cc._decorator;
@ccclass

export default class begin extends cc.Component{
    constructor(){
        super();
        begin._instance = this;
    }
    @property({
        type: cc.Prefab
    })
    prefabItem = null;

    @property({
        type: cc.Node
    })
    pokerLayout = null;

    @property({
        type: cc.Node
    })
    cardArr = [];

    start () {
        this.init();
        this.clearNode();
        this.addPrefab(this.arr);
        begin._instance = this;
        console.log("this is begin");
    }

    restart(){
        this.clearNode();
        this.init();
        this.scheduleOnce(function () {
            console.log("this.scheduleOnce");
            //this.reload(this.cardArr);
        }, 3);

    }

    static get ins() {
        return begin._instance;
    }

    init () {
        this.arr = playerInfo.handCards;
        this.abandonArr = [];
        arr = this.arr;
        this._layout = this.node.getComponent(cc.Layout);
    }

    addPrefab(cards){
        this.clearNode();
        this.cardArr = [];

        if(! (cards instanceof Array))
            cards = this.arr;

        for(let i = 0; i < cards.length; i++){
            let node = cc.instantiate(this.prefabItem);

            this._layout.node.addChild(node)
            this.cardArr.push(node);
        }
        this.reload(this.cardArr);
    }

    reload(cardArr){

        console.log(cardArr);
        for(let i = 0; i < arr.length; i++){
            this.reloadCell(arr[i]-1, cardArr[i]);
        }
    }

    reloadCell(idx, pokerList){
        if(idx < 0 || idx >= arr.length){
            return;
        }
        pokerList.getComponent("reloadCards").reload(idx);
    }

    clearNode(){
        for(let i = 0; i < this.cardArr.length; i++){
            this.cardArr[i].getComponent("reloadCards").clearNode();
        }
    }
}



