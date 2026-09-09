import {_decorator, Button, Component, EventHandler, instantiate, Node, Prefab} from 'cc';
import {Sheep} from "db://assets/Scripts/Sheep";
import {EGetReward} from "db://assets/Scripts/GameManager";

const {ccclass, property} = _decorator;

@ccclass('ViewManager')
export class ViewManager extends Component {
    @property({type: Prefab, displayName: `綿羊按鈕prefab`}) sheepBtnPrefab: Node = null;
    @property({type: Node}) sheepParentNode: Node = null;

    sheepButtons: Sheep[] = [];
    shuffledBonus: string[] = [];
    calculateReward: (type: EGetReward) => void = null;

    // isAnySheepMoving(): boolean {
    //     return this._isAnySheepMoving;
    // }

    set isAnySheepMoving(value: boolean) {
        this._isAnySheepMoving = value;
    }

    private _isAnySheepMoving: boolean = false;

    dic: Map<string, EGetReward> = new Map();

    onLoad() {

    }

    installAllSheepBtns() {
        for (let i = 0; i < 15; i++) {
            this.sheepParentNode.addChild(instantiate(this.sheepBtnPrefab));
        }
        this.sheepButtons = this.sheepParentNode.getComponentsInChildren(Sheep);
        console.log(`this.sheepButtons.length: ${this.sheepButtons.length}`);
        this.sheepButtons.forEach((s, index) => {

            this.initButton(s, index);

            s.onSheepFinishMove = (index) => {
                // this._isAnySheepMoving = false;
            };

            s.calculateReward = (multiply: string) => {
                let eGetReward = this.dic.get(multiply);
                this.calculateReward(eGetReward);
            }


        });
    }

    start() {
        this.setDictionary();
    }


    initButton(sheep: Sheep, index: number) {
        let temp = index;
        sheep.sheepValue = this.shuffledBonus[temp];

        const handler = new EventHandler();
        handler.target = this.node;
        handler.component = `ViewManager`;
        handler.handler = `sheepOnClickHandler`;
        handler.customEventData = temp.toString();

        sheep.getComponent(Button).clickEvents.push(handler);
    }

    private setDictionary() {
        this.dic.set(`+2`, EGetReward.plus2);
        this.dic.set(`+1`, EGetReward.plus1);
        this.dic.set(`x1`, EGetReward.nothing);
        this.dic.set(`END`, EGetReward.End);
    }

    sheepOnClickHandler = async (event: Event, eventData: string) => {
        if (this._isAnySheepMoving) {
            console.log(`其他羊還在動作`);
            return;
        }
        this.isAnySheepMoving = true;

        let index = parseInt(eventData);
        this.sheepButtons[index].sheepOnClick();
    }

    onEndGame() {
        // 結束遊戲，處理所有還沒點過的羊
        let remainSheep = this.sheepButtons.filter(sheep => !sheep.isClicked);
        remainSheep.forEach((sheep) => {
            sheep.isClicked = true;
            sheep.sheepGoDie(true);
        });

    }

    resetGame() {
        this.isAnySheepMoving = false;
        this.sheepButtons.forEach((s, index) => {
            s.resetSheepStatus(this.shuffledBonus[index]);
        });
    }
}