import {
    _decorator,
    Animation,
    AnimationClip,
    Button,
    Color,
    Component,
    EventHandler,
    instantiate,
    Label,
    Node,
    Prefab,
    Sprite,
    tween,
    Vec3
} from 'cc';
import {EGetReward} from "db://assets/Scripts/GameManager";

const {ccclass, property} = _decorator;

/** 單隻綿羊的運行時狀態與節點引用 */
interface ISheepData {
    outerNode: Node;        // 外層固定 Node (提供給 Layout 排版用，保持靜止)
    sheepBtnNode: Node;     // 子物件：綿羊按鈕 Node (實際播放動畫與顏色變化的對象)
    anim: Animation;
    sprite: Sprite;
    label: Label;
    starNode: Node;
    clips: AnimationClip[];
    value: string;
    isClicked: boolean;
}

@ccclass('SheepManager')
export class SheepManager extends Component {
    @property({type: Prefab, displayName: '綿羊外殼prefab'}) sheepBtnPrefab: Prefab = null;
    @property({type: Node}) sheepParentNode: Node = null;

    // 遊戲資料與狀態
    shuffledBonus: string[] = [];
    calculateReward: (type: EGetReward) => void = null;

    private _isAnySheepMoving: boolean = false;
    private dic: Map<string, EGetReward> = new Map();
    private sheepList: ISheepData[] = [];

    set isAnySheepMoving(value: boolean) {
        this._isAnySheepMoving = value;
    }

    get isAnySheepMoving(): boolean {
        return this._isAnySheepMoving;
    }

    onLoad() {
    }

    start() {
        this.setDictionary();
    }

    private setDictionary() {
        this.dic.set('+2', EGetReward.plus2);
        this.dic.set('+1', EGetReward.plus1);
        this.dic.set('x1', EGetReward.nothing);
        this.dic.set('END', EGetReward.End);
    }

    /** 生成並初始化所有綿羊 */
    installAllSheepBtns() {
        this.sheepList = [];

        for (let i = 0; i < 15; i++) {
            const outerNode = instantiate(this.sheepBtnPrefab);
            this.sheepParentNode.addChild(outerNode);

            const sheepBtnNode = outerNode.children[0] || outerNode;

            const anim = sheepBtnNode.getComponent(Animation);
            const sprite = sheepBtnNode.getComponent(Sprite);
            const clips = anim ? anim.clips : [];

            let starNode: Node = null;
            starNode = outerNode.children[1];

            let label: Label = null;
            const labelNode = sheepBtnNode.children[0];
            labelNode.scale = Vec3.ZERO;
            label = labelNode.getComponent(Label);

            const sheepData: ISheepData = {
                outerNode: outerNode,
                sheepBtnNode: sheepBtnNode,
                anim: anim,
                sprite: sprite,
                label: label,
                starNode: starNode,
                clips: clips,
                value: '',
                isClicked: false
            };

            this.sheepList.push(sheepData);
            this.initButton(sheepData, i);
        }

        console.log(`this.sheepList.length: ${this.sheepList.length}`);
    }

    /** 為每隻綿羊綁定事件與數值 */
    private initButton(sheepData: ISheepData, index: number) {
        sheepData.value = this.shuffledBonus[index] || '';
        if (sheepData.label) {
            sheepData.label.string = sheepData.value;
        }

        // 按鈕元件優先嘗試從綿羊子物件綁定，若無則從外層綁定
        const btn = sheepData.sheepBtnNode.getComponent(Button) || sheepData.outerNode.getComponent(Button);
        if (btn) {
            const handler = new EventHandler();
            handler.target = this.node;
            handler.component = 'SheepManager';
            handler.handler = 'sheepOnClickHandler';
            handler.customEventData = index.toString();

            btn.clickEvents.push(handler);
        }
    }

    /** 按鈕點擊觸發事件 */
    sheepOnClickHandler = async (event: Event, eventData: string) => {
        if (this._isAnySheepMoving) {
            console.log('其他羊還在動作');
            return;
        }

        const index = parseInt(eventData);
        const sheepData = this.sheepList[index];

        if (!sheepData || sheepData.isClicked) {
            return;
        }

        this.isAnySheepMoving = true;
        await this.sheepOnClick(sheepData);
    };

    /** 單隻綿羊點擊後的動畫與邏輯處置 */
    private async sheepOnClick(sheepData: ISheepData) {
        sheepData.isClicked = true;

        // 播放跳躍動畫 (clips[1])
        await this.playAnimation(sheepData.anim, sheepData.clips[1]);

        console.log(`sheepValue: ${sheepData.value}`);

        if (sheepData.value === 'END') {
            await this.sheepGoDie(sheepData);
        } else {
            // 播放星星動畫與顯示文字
            if (sheepData.starNode) {
                sheepData.starNode.active = true;
                sheepData.starNode.setScale(Vec3.ZERO);

                tween(sheepData.starNode)
                    .to(0.5, {scale: Vec3.ONE})
                    .call(() => {
                        console.log('Star Animation OnComplete');
                        sheepData.starNode.setScale(Vec3.ZERO);
                    })
                    .start();
            }

            if (sheepData.label) {
                sheepData.label.node.scale = Vec3.ONE;
            }

            this.dispatchReward(sheepData.value);
        }
    }

    /** 綿羊結束動畫 (Down/Die) */
    private async sheepGoDie(sheepData: ISheepData, isGameEnd: boolean = false) {
        // 播放倒下動畫 (clips[0])
        await this.playAnimation(sheepData.anim, sheepData.clips[0]);

        if (!isGameEnd) {
            this.dispatchReward(sheepData.value);
        }

        if (sheepData.sprite) {
            sheepData.sprite.color = Color.GRAY;
        }

        if (sheepData.label) {
            sheepData.label.node.scale = Vec3.ONE;
        }
    }

    /** 派發獎勵 */
    private dispatchReward(value: string) {
        const rewardType = this.dic.get(value);
        if (this.calculateReward && rewardType !== undefined) {
            this.calculateReward(rewardType);
        }
    }

    /** 播放動畫的 Promise 通用函式 */
    private playAnimation(anim: Animation, clip: AnimationClip, loop = false, forever = false, timer: number = 5): Promise<void> {
        return new Promise((resolve) => {
            if (!anim || !clip) {
                resolve();
                return;
            }

            console.log(clip.name);
            const state = anim.getState(clip.name);
            let countDown: number = clip.duration;

            if (loop && state) {
                state.wrapMode = AnimationClip.WrapMode.Loop;
                countDown = timer;
            }

            anim.play(clip.name);

            if (!forever) {
                this.scheduleOnce(() => {
                    console.log("resolve animation");
                    anim.stop();
                    resolve();
                }, countDown);
            }
        });
    }

    /** 遊戲結束處理剩餘綿羊 */
    onEndGame() {
        const remainSheep = this.sheepList.filter(sheep => !sheep.isClicked);
        remainSheep.forEach((sheep) => {
            sheep.isClicked = true;
            this.sheepGoDie(sheep, true);
        });
    }

    /** 重置遊戲狀態 */
    resetGame() {
        this.isAnySheepMoving = false;

        this.sheepList.forEach((sheepData, index) => {
            sheepData.value = this.shuffledBonus[index] || '';
            sheepData.isClicked = false;

            if (sheepData.label) {
                sheepData.label.string = sheepData.value;
                sheepData.label.node.scale = Vec3.ZERO;
            }

            if (sheepData.sprite) {
                sheepData.sprite.color = Color.WHITE;
            }

            // 播放跑步循環動畫 (clips[2])
            this.playAnimation(sheepData.anim, sheepData.clips[2], true, true);
        });
    }
}