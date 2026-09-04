import {_decorator, Component, Node} from 'cc';
import {Sheep} from "db://assets/Scripts/Sheep";

const {ccclass, property} = _decorator;

@ccclass('ViewManager')
export class ViewManager extends Component {

    @property({type: Node}) sheepParentNode: Node = null;
    sheepNodes: Sheep[] = [];
    shuffledBonus: string[] = [];

    get isAnySheepMoving(): boolean {
        return this._isAnySheepMoving;
    }

    set isAnySheepMoving(value: boolean) {
        this._isAnySheepMoving = value;
    }

    private _isAnySheepMoving: boolean = false;

    onLoad() {
        this.sheepNodes = this.sheepParentNode.getComponentsInChildren(Sheep);
        this.sheepNodes.forEach(s => s.InitButton());
        // this.node.on(`sheepMoving`, this.sheepOnClick, this);
    }

    start() {

    }

}

