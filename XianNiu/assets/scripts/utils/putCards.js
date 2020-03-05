
const {ccclass, property} = cc._decorator;
@ccclass
/**
 * 出牌时将牌的预制体拖到出牌区域
 */
export default class putCards extends cc.Component {
    @property({
        type: cc.Layout
    })
    abandonPoker = null;

    @property({
        type: cc.Prefab
    })
    prefabItem = null;

    cardArr = [];
    start() {
        putCards._instance = this;
    }

    restart(){
        this.clearNode();
        this.init();
        this.scheduleOnce(function () {
            console.log("this.scheduleOnce");
            //this.reload(this.cardArr);
        }, 3);

    }
    //返回当前场景的数据
    static get ins() {
        return putCards._instance
    }

    //添加牌
    addPrefab(cards){
        this.clearNode();
        this.cardArr = [];
        console.log(cards);

        for (let i = 0; i < cards.length; i++){
            let node = cc.instantiate(this.prefabItem);
            this.abandonPoker.node.addChild(node);
            this.cardArr.push(node);
        }
        this.reload(this.cardArr, cards);
    }

    addChildrenAgain(cards){
        //new Director().sleep(2000);
        //this.node.removeAllChildren();
        console.log(this.node.children);

    }
    reload(cardArr, arr){
        for(let i = 0; i < arr.length; i++){
            this.reloadCell(arr[i]-1, cardArr[i]);
        }
    }

    reloadCell(idx, pokerList){
        pokerList.getComponent("reloadCards").reload(idx);
    }

    //清空结点
    clearNode(){
        for(let i = 0; i < this.cardArr.length; i++){
            this.cardArr[i].getComponent("reloadCards").clearNode();
        }
    }

}