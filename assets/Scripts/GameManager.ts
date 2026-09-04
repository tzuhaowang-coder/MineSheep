import {_decorator, Component, Node} from 'cc';
import {ViewManager} from "db://assets/Scripts/ViewManager";

const {ccclass, property} = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(ViewManager) viewManager: ViewManager;
    private bonusList: string[] = ['+2', '+1', 'x1', 'x1', '+2', 'x1', 'X1', 'END', '+2', '+2', 'x1', '+2', '+2', '+2', '+2'];
    private shuffledBonusList: string[] = [];

    onLoad() {
        this.shuffledBonusList = [...this.bonusList];
    }

    getShuffledBonusList(): string[] {
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
        return this.shuffledBonusList;
    };

    start() {
        this.viewManager.shuffledBonus = this.shuffledBonusList;
    }

    update(deltaTime: number) {

    }
}

