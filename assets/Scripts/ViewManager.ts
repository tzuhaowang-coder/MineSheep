import {_decorator, Component, Node} from 'cc';
import {Sheep} from "db://assets/Scripts/Sheep";
import {EGetReward} from "db://assets/Scripts/GameManager";

const {ccclass, property} = _decorator;

@ccclass('ViewManager')
export class ViewManager extends Component {

    @property({type: Node}) sheepParentNode: Node = null;
    sheepNodes: Sheep[] = [];
    shuffledBonus: string[] = [];

    isAnySheepMoving(): boolean {
        return this._isAnySheepMoving;
    }

    // set isAnySheepMoving(value: boolean) {
    //     this._isAnySheepMoving = value;
    // }

    dic: Map<string, EGetReward> = new Map();
    private _isAnySheepMoving: boolean = false;

    onLoad() {
        this.sheepNodes = this.sheepParentNode.getComponentsInChildren(Sheep);
        this.sheepNodes.forEach((s, index) => s.InitButton(this, index));
    }

    start() {
        this.setDictionary();
    }


    private setDictionary() {
        this.dic.set(`+2`, EGetReward.plus2);
        this.dic.set(`+1`, EGetReward.plus1);
        this.dic.set(`x1`, EGetReward.nothing);
        this.dic.set(`END`, EGetReward.End);
    }

    sheepOnClick = () => {
        if (this.isAnySheepMoving) return;
        this._isAnySheepMoving = true;
    }
}

