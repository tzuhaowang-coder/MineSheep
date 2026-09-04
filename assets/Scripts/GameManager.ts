import {_decorator, Component, Node} from 'cc';
import {ViewManager} from "db://assets/Scripts/ViewManager";

const {ccclass, property} = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(ViewManager) viewManager: ViewManager;
    private readonly bonusList: string[] = ['+2', '+1', 'x1', 'x1', '+2', 'x1', 'x1', 'END', '+2', '+2', 'x1', '+2', '+2', '+2', '+2'];
    private shuffledBonusList: string[] = [];
    

    multiply: number = 1;
    round: number = 1;

    onLoad() {
        this.shuffledBonusList = [...this.bonusList];
    }

    start() {
        this.viewManager.shuffledBonus = this.shuffledBonusList;
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

        switch (type) {

            case EGetReward.plus1:
                this.multiply += 1;
                break;
            case EGetReward.plus2:
                this.multiply += 2;
                break;
            case EGetReward.nothing:
                break;
            case EGetReward.End:
                break;
        }
        // todo: NextRound or Over

    }


    newRound() {
        this.getShuffledBonusList();
    }

    update(deltaTime: number) {

    }
}

export enum EGetReward {
    plus2,
    plus1,
    nothing,
    End
}
