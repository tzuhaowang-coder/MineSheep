import {_decorator, Animation, AnimationClip, Component, Label, Node, tween, Vec3, Sprite, Color, Button, EventHandler} from 'cc';
import {SheepManager} from "db://assets/Scripts/SheepManager";

const {ccclass, property} = _decorator;

@ccclass('Sheep')
export class Sheep extends Component {
    set sheepValue(value: string) {
        this._sheepValue = value;
        this.sheepValueLabel.string = value;
    }

    private anim: Animation = null;
    private clips: AnimationClip[] = [];    //down jump run
    private _sheepValue: string = ``;

    isClicked: boolean = false;

    private starNode: Node = null;
    private sheepValueLabel: Label;
    private sheepSprite: Sprite;
    sheepButton: Button = null;

    onLoad() {
        let buttonNode = this.node.children[0];

        this.sheepButton = buttonNode.getComponent(Button);
        this.anim = buttonNode.getComponent(Animation);
        this.clips = this.anim.clips;
        this.sheepSprite = buttonNode.getComponent(Sprite);
        this.starNode = this.node.children[1];

        let valueLabelNode = buttonNode.children[0];
        valueLabelNode.scale = Vec3.ZERO;
        this.sheepValueLabel = valueLabelNode.getComponent(Label);
    }
    
    async playAnimation(anim: Animation, clip: AnimationClip, loop = false, forever = false, timer: number = 5): Promise<void> {
        return new Promise((resolve) => {
            console.log(clip.name);
            const state = anim.getState(clip.name);
            let countDown: number = clip.duration;
            if (loop) {

                state.wrapMode = AnimationClip.WrapMode.Loop;
                // loop 記得要給停止時間，不然一樣只會播一輪
                countDown = timer;
            }
            anim.play(clip.name);

            // 要不要停
            if (!forever) {
                this.scheduleOnce(() => {
                    console.log("resolve");

                    anim.stop();
                    resolve();
                }, countDown);
            }
        });
    };

    async sheepOnClick(manager: SheepManager) {
        if (this.isClicked) {
            return;
        }
        this.isClicked = true;

        this.playAnimation(this.anim, this.clips[1]).then(() => {
                console.log(`this.sheepValue: ${this._sheepValue}`);
                if (this._sheepValue == `END`) {
                    this.sheepGoDie(false, manager);
                } else {
                    this.starNode.active = true;
                    this.sheepValueLabel.node.scale = Vec3.ONE;

                    tween(this.starNode).to(0.5, {
                        scale: Vec3.ONE,
                    }, {
                        onComplete: () => {
                            console.log("onComplete");
                            this.starNode.setScale(Vec3.ZERO);
                        }
                    }).start();

                    let eGetReward = manager.dic.get(this._sheepValue);
                    manager.calculateReward(eGetReward);
                }
            }
        );
    }

    sheepGoDie(gameEnd: boolean = false, manager: SheepManager) {
        this.playAnimation(this.anim, this.clips[0]).then(() => {
            if (!gameEnd) {
                let eGetReward = manager.dic.get(this._sheepValue);
                manager.calculateReward(eGetReward);
            }
            this.sheepSprite.color = Color.GRAY;
            this.sheepValueLabel.node.scale = Vec3.ONE;
        });
    }

    resetSheepStatus(value: string) {
        this.sheepValue = value;
        this.isClicked = false;
        this.sheepSprite.color = Color.WHITE;
        this.sheepValueLabel.node.scale = Vec3.ZERO;

        this.playAnimation(this.anim, this.clips[2], true, true);
    }
}

