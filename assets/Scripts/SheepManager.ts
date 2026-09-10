import {_decorator, Component, EventHandler, instantiate, Node, Prefab} from 'cc';
import {Sheep} from "db://assets/Scripts/Sheep";
import {EGetReward, GameManager} from "db://assets/Scripts/GameManager";

const {ccclass, property} = _decorator;

@ccclass('SheepManager')
export class SheepManager extends Component {
    @property({type: Prefab, displayName: `綿羊按鈕prefab`}) sheepBtnPrefab: Prefab = null;
    @property({type: Node}) sheepParentNode: Node = null;
    private gameManager: GameManager;
    sheepButtons: Sheep[] = [];
    shuffledBonus: string[] = [];

    set isAnySheepMoving(value: boolean) {
        this._isAnySheepMoving = value;
    }

    private _isAnySheepMoving: boolean = false;

    dic: Map<string, EGetReward> = new Map();

    installAllSheepBtns() {
        for (let i = 0; i < 15; i++) {
            this.sheepParentNode.addChild(instantiate(this.sheepBtnPrefab));
        }
        this.sheepButtons = this.sheepParentNode.getComponentsInChildren(Sheep);
        console.log(`this.sheepButtons.length: ${this.sheepButtons.length}`);
        this.sheepButtons.forEach((s, index) => {
            this.initSheepButton(s, index);
        });
    }

    start() {
        this.setDictionary();
    }


    private setDictionary() {
        this.dic.set(`+2`, EGetReward.round2);
        this.dic.set(`+1`, EGetReward.round1);
        this.dic.set(`x1`, EGetReward.multiple1);
        this.dic.set(`END`, EGetReward.End);
    }

    sheepOnClickHandler = async (event: Event, eventData: string) => {
        if (this._isAnySheepMoving) {
            console.log(`其他羊還在動作`);
            return;
        }
        this.isAnySheepMoving = true;

        let index = parseInt(eventData);
        this.sheepButtons[index].sheepOnClick(this);
    }

    onEndGame() {
        // 結束遊戲，處理所有還沒點過的羊
        let remainSheep = this.sheepButtons.filter(sheep => !sheep.isClicked);
        remainSheep.forEach((sheep) => {
            sheep.isClicked = true;
            sheep.sheepGoDie(true, this);
        });

    }

    resetGame() {
        this.isAnySheepMoving = false;
        this.sheepButtons.forEach((s, index) => {
            s.resetSheepStatus(this.shuffledBonus[index]);
        });
    }


    getGameManager(game: GameManager) {
        this.gameManager = game;
    }

    calculateReward(type: EGetReward) {
        this.gameManager.calculateMultiply(type);
    }

    private initSheepButton(s: Sheep, index: number) {
        let temp = index;
        s.sheepValue = this.shuffledBonus[temp];

        const handler = new EventHandler();
        handler.target = this.node;
        handler.component = `SheepManager`;
        handler.handler = `sheepOnClickHandler`;
        handler.customEventData = temp.toString();

        s.sheepButton.clickEvents.push(handler);
    }
}