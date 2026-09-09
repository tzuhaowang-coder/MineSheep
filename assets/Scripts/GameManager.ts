import {_decorator, Button, Component, EventHandler, Label, Node, tween, Vec3} from 'cc';
import {ViewManager} from "db://assets/Scripts/ViewManager";

const {ccclass, property} = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    set multiply(value: number) {
        this._multiply = value;
        this.multiplyLabel.string = `Multiply: ${this._multiply}`;
    }

    set round(value: number) {
        this._round = value;
        this.roundCountLabel.string = `Round: ${this._round}`;
    }

    @property(ViewManager) viewManager: ViewManager;
    @property(Label) multiplyLabel: Label;
    @property(Label) roundCountLabel: Label;
    @property(Button) resetGameButton: Button;
    private readonly bonusList: string[] = ['+2', '+1', 'x1', 'x1', '+2', 'x1', 'x1', 'END', '+2', '+2', 'x1', '+2', '+2', '+2', '+2'];
    private shuffledBonusList: string[] = [];


    private _multiply: number = 1;
    private _round: number = 1;

    private starNode: Node = null;

    onLoad() {
        this.initResetBtn();
        this.shuffledBonusList = [...this.bonusList];
        this.getShuffledBonusList();
        this.starNode = this.multiplyLabel.node.children[0];
    }

    start() {
        this.viewManager.shuffledBonus = this.shuffledBonusList;
        this.viewManager.calculateReward = (type) => {
            this.calculateMultiply(type);
        }

        this.viewManager.installAllSheepBtns();
    }

    nextRound() {
        this.round = this._round + 1;
        this.viewManager.isAnySheepMoving = false;
    }

    getShuffledBonusList() {
        for (let i = this.bonusList.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            if (i !== j) {
                let temp = this.shuffledBonusList[i];
                this.shuffledBonusList[i] = this.shuffledBonusList[j];
                this.shuffledBonusList[j] = temp;
            } else {
                console.log(`不用換`);
            }
        }
        console.log(this.shuffledBonusList);
    };

    calculateMultiply(type: EGetReward) {
        const showStar = () => {
            tween(this.starNode).to(0.5, {
                scale: Vec3.ONE,
            }, {
                onComplete: () => {
                    this.starNode.setScale(Vec3.ZERO);
                }
            }).start();
        }
        const calculate = (eGetReward: EGetReward) => {
            switch (eGetReward) {

                case EGetReward.plus1:
                    this.multiply = this._multiply + 1;
                    showStar();
                    break;
                case EGetReward.plus2:
                    this.multiply = this._multiply + 2;
                    showStar();
                    break;
            }
        }

        let endGame = type == EGetReward.End;
        calculate(type);
        if (!endGame) {
            this.nextRound();
        } else {
            this.EndGame();
        }
    }


    newRound() {
        // new Round
        this.getShuffledBonusList();
        this.viewManager.resetGame();
        this.multiply = 1;
        this.round = 1;
    }

    private EndGame() {
        this.viewManager.onEndGame();
    }

    private initResetBtn() {
        let handler = new EventHandler();
        handler.target = this.node;
        handler.component = `GameManager`;
        handler.handler = `newRound`;
        handler.customEventData = ``;

        this.resetGameButton.clickEvents.push(handler);
    }
}

export enum EGetReward {
    plus2,
    plus1,
    nothing,
    End
}
