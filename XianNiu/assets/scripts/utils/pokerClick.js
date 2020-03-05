import putCards from "./putCards";

const {ccclass, property} = cc._decorator;
@ccclass
class pokerClick extends cc.Component {

    @property({
        type: cc.Node
    })
    poker = null;
    @property
    _touchMoved = null;
    @property({
        type: cc.Prefab
    })
    cardMask = null;
    init(){
        //牌
        this.cards = this.poker.children;

        //牌的初始位置
        this.cardInitY = this.cards[0].y;

        //触摸选择到的牌
        this.touchedCards = [];

        //选中的牌
        this.selectedCardsNode = [];  //保存选中牌的结点
    }
    start() {
        this.init();
        this.addTouchEvent();
        pokerClick._instance = this;

        console.log("this is pokerClick");
    }

    static get ins() {
        return pokerClick._instance
    }
    /**
     * 添加事件
     */
    addTouchEvent(){

        //父节点监听touch事件（直接子节点必须注册同样的事件方能触发）
        this.poker.on(cc.Node.EventType.TOUCH_START, function (event) {
            console.log('poker TOUCH_START');

            //牌
            let card = event.target;

            //起始触摸位置（和第一张card一样，相对于poker的位置）
            this.touchStartLocation = this.cards[0].convertTouchToNodeSpace(event);
            console.log('touch start Location:'+ JSON.stringify(this.touchStartLocation));

            //计算牌位置
            let index = 0;
            //console.log("------");
            for(let i=0;i<this.cards.length;i++){
                let c = this.cards[i];

                if(c._id === card._id){
                    index = i;
                    break;
                }
            }
            //暂存第一次触摸到的牌
            let touchedCard = {
                index:index,
                card:card
            };
            this.firstTouchedCard = touchedCard;
            //暂存
            this.pushTouchedCards(touchedCard.index,touchedCard.card);

        }, this);

        //父节点监听touch事件（直接子节点必须注册同样的事件方能触发）
        this.poker.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            console.log('poker TOUCH_MOVE');
            //先清除原先触摸到的牌
            this.clearTouchedCards();
            //保存第一张牌
            this.pushTouchedCards(this.firstTouchedCard.index,this.firstTouchedCard.card);

            //触摸点转换为card节点坐标
            let nodeLocation = this.cards[0].convertTouchToNodeSpace(event);
            console.log('touch nodeLocation:'+ JSON.stringify(nodeLocation));
            let x = nodeLocation.x;
            let y = nodeLocation.y;

            //找到当前选中的牌
            let currentCard = null;
            for(let i=0;i< this.cards.length;i++){
                let card = this.cards[i];
                let cardX = card.x;
                let cardY = card.y;
                console.log('card x='+cardX+',y='+cardY);


                //某张牌范围包括了鼠标位置，选中此牌与触摸开头的所有牌
                let cardWidth = i===5 ? card.width:19;
                let cardHeight = card.height;
                if(cardX<=x && x <= cardX+cardWidth && cardY<=y && y<= cardY+cardHeight){
                    currentCard = card;

                    //暂存触摸到的牌
                    this.pushTouchedCards(i,card);

                    break;
                }
            }

            //添加开头与此牌直接的所有牌
            let startTouchLocation = this.touchStartLocation;
            for(let i=0;i< this.cards.length;i++){
                let card = this.cards[i];
                let cardX = card.x;
                //框选的范围包括了的牌
                let min,max;
                if(startTouchLocation.x < nodeLocation.x){
                    min = startTouchLocation.x;
                    max = nodeLocation.x;
                }else{
                    min = nodeLocation.x;
                    max = startTouchLocation.x;
                }
                console.log('min='+min+', max='+max);

                if(min <= cardX && cardX <= max){
                    //暂存触摸到的牌
                    this.pushTouchedCards(i,card);
                }
            }


        }, this);

        //父节点监听touch事件（直接子节点必须注册同样的事件方能触发）
        this.poker.on(cc.Node.EventType.TOUCH_END, function (event) {
            console.log('poker TOUCH_END');
            this.doSelectCard();
        }, this);

        //父节点监听touch事件（直接子节点必须注册同样的事件方能触发）
        this.poker.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            console.log('poker TOUCH_CANCEL');
            this.doSelectCard();
        }, this);

        //给所有的牌注册事件，会自动冒泡到poker节点
        for(let i=0;i< this.cards.length;i++){
            let cards = this.cards;
            //闭包传递i值
            (function(i){
                let card = cards[i];
                card.on(cc.Node.EventType.TOUCH_START, function (event) {
                    console.log('card TOUCH_START');
                }, card);

                card.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
                    console.log('card TOUCH_MOVE');
                }, card);

                card.on(cc.Node.EventType.TOUCH_END, function (event) {
                    console.log('card TOUCH_END');
                }, card);

                card.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
                    console.log('card TOUCH_CANCEL');
                }, card);


            })(i)

        }

    }

    /**
     * 暂存触摸到的牌
     */
    pushTouchedCards(index,card){
        //构造牌对象
        let cardObj = {
            index:index,
            name:card.name,
            //if(card.y === this.cardInitY)

            isSelected:card.y===this.cardInitY?false:true //高度不一样，表示选中
        };

        //防止重复添加
        let existCard = this.touchedCards.find(function(obj){
            if(obj.name === card.name){
                return obj;
            }else{
                return null;
            }
        });
        if(!existCard){
            //添加暂存
            this.touchedCards.push(cardObj);

            //包含提示
            this.addCardMask(card);
        }
    }

    /**
     * 清除原先暂存的触摸到的牌
     */
    clearTouchedCards(){
        for(let i=0;i<this.touchedCards.length;i++){
            let cardIndex = this.touchedCards[i].index;
            let card = this.cards[cardIndex];
            card.removeChild(card.children[0]);
        }
        this.touchedCards = [];
    }

    /**
     * 选择牌
     */
    doSelectCard(){
        this.selectedCards = [];

        console.log(this.touchedCards);

        //改变牌状态
        for(let i = 0; i< this.touchedCards.length;i++){
            let cardObj = this.touchedCards[i];
            let card = this.cards[cardObj.index];
            if(cardObj.isSelected && card.y === 30){ //如果是选中改为不选中
                card.y = card.y - 30;
            }else{ //不选中改为选中状态
                card.y = card.y + 30;
            }
        }

        //重置
        this.clearTouchedCards();

        //显示选中的牌
        this.showSelectedCards();
    }
    //选择牌，提示
    selectCards(cards){
        //改变牌状态
        for(let i = 0; i< cards.length;i++){
            let card = this.cards[0];
            let j = 0;
            for(j = 0; j < this.cards.length; j++){
                if(this.cards[j].arrIndex === cards[i]){
                    card = this.cards[j];
                    break;
                }
            }
            if(card.y===this.cardInitY)//通过高度来判断是否选中
                card.y = card.y + 30;
            else
                card.y = card.y - 30;
        }
        this.selectedCards = cards;

        //重置
        this.clearTouchedCards();

        //显示选中的牌
        this.showSelectedCards();
    }

    /**
     * 包含牌遮罩
     */
    addCardMask(card){
        let cardMask = cc.instantiate(this.cardMask);
        console.log("------");
        console.log(cardMask);
        cardMask.position = cc.v2(0, 0);
        card.addChild(cardMask);
    }

    /**
     * 显示选中的牌
     */
    showSelectedCards(){
        this.selectedCards = [];
        for(let i=0;i< this.cards.length;i++){
            let card = this.cards[i];
            let isSelected = card.y === this.cardInitY ? false:true;
            //console.log(isSelected)
            if(isSelected){
                this.selectedCards.push(card.index);
                //this.selectedCardsNode.push(card);
            }
        }
        //输出
        console.log(this.selectedCards)

        //console.info("selected cards is: "+ JSON.stringify(this.selectedCards));
    }

    /**
     * 出牌
     * @param cards  要出的牌
     * @param handCards 手上的牌
     */
    discards () {
        //初始化被选中的牌的结点
        let j = 0;
        for(let i = 0; i < this.cards.length; i++){
            if(this.cards[i].index === this.selectedCards[j]){
                // console.log(this.cards[i]);
                this.selectedCardsNode.push(this.cards[i]);
                j++;
            }
            if(j === this.selectedCards.length)
                break;
        }
        let cards = this.selectedCardsNode;
        //出牌
        if (!cards || cards.length === 0) return;

        //从父节点分离
        for (const key in cards) {
            if (cards.hasOwnProperty(key)) {
                const card = cards[key];
                card.removeFromParent(false)  //将选中的结点从父节点中分离
            }
        }
        //将牌的预制体添加到出牌区域
        //this.addPutCards(this.selectedCards);
    }

    /**
     * 添加节点至出牌区域
     * @param cards
     */
    addPutCards(cards){
        //先检查原先结点有没有子节点，如果有的话，清空
        // putCards.ins.clearNode();
        // putCards.ins.abandonPoker.node.removeAllChildren(false);
        putCards.ins.addPrefab(cards);
    }


}
