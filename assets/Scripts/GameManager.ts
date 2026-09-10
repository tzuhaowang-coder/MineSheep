import {_decorator, Button, Component, EventHandler, Label, Node, tween, Vec3} from 'cc';
import {SheepManager} from "db://assets/Scripts/SheepManager";

const {ccclass, property} = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    set multiply(value: number) {
        this._multiply = value;
        this.multiplyLabel.string = `Multiple: ${this._multiply}`;
    }

    set round(value: number) {
        this._round = value;
        this.roundCountLabel.string = `Round: ${this._round}`;
    }

    @property({type: SheepManager}) sheepManager: SheepManager;
    @property(Label) multiplyLabel: Label;
    @property(Label) roundCountLabel: Label;
    @property(Button) resetGameButton: Button;
    private readonly bonusList: string[] = ['+2', '+1', 'x1', 'x1', '+2', 'x1', 'x1', 'END', '+2', '+2', 'x1', '+2', '+2', '+2', '+2'];
    private shuffledBonusList: string[] = [];


    private _multiply: number = 1;
    private _round: number = 1;

    private starNode: Node = null;
    private starNode2: Node = null;


    start() {
        this.initResetBtn();
        this.shuffledBonusList = [...this.bonusList];
        this.getShuffledBonusList();
        this.starNode = this.multiplyLabel.node.children[0];
        this.starNode2 = this.roundCountLabel.node.children[0];
        this.sheepManager.shuffledBonus = this.shuffledBonusList;
        this.sheepManager.getGameManager(this);
        this.sheepManager.installAllSheepBtns();
    }

    nextRound() {
        // this.round = this._round + 1;
        this.sheepManager.isAnySheepMoving = false;
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
        const showStar = (star: boolean = false) => {
            let target = star ? this.starNode : this.starNode2;

            tween(target).to(0.5, {
                scale: Vec3.ONE,
            }, {
                onComplete: () => {
                    target.setScale(Vec3.ZERO);
                }
            }).start();
        }
        const calculate = (eGetReward: EGetReward) => {
            switch (eGetReward) {

                case EGetReward.round1:
                    this.round = this._round + 1;
                    showStar();
                    break;
                case EGetReward.round2:
                    this.round = this._round + 2;
                    showStar();
                    break;
                case EGetReward.multiple1:
                    this.multiply = this._multiply + 1;
                    showStar(true);
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
        this.sheepManager.resetGame();
        this.multiply = 1;
        this.round = 1;
    }

    private EndGame() {
        this.sheepManager.onEndGame();
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
    round2,
    round1,
    multiple1,
    End
}
