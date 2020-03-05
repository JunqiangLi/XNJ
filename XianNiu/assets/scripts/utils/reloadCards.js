const {ccclass, property} = cc._decorator;
@ccclass
class reloadCards extends cc.Component{
    @property({
        type: cc.SpriteFrame
    })
    cardStorePlace = [];

    @property({
        type: cc.Node
    })
    poker = null;

    start () {

    }
    reload (idx) {
        this.poker.getComponent(cc.Sprite).spriteFrame = this.cardStorePlace[idx];
        this.poker.index = idx+1;
        this.poker.arrIndex = idx+1;
    }

    //清空结点
    clearNode(){
        //清空图片
        this.poker.getComponent(cc.Sprite).spriteFrame = null;
        //销毁结点
        this.poker.destroy();

    }
}

