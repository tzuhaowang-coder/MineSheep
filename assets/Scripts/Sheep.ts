import {_decorator, Animation, AnimationClip, Component, Label, Node, tween, Vec3, Sprite, Color} from 'cc';

const {ccclass, property} = _decorator;

@ccclass('Sheep')
export class Sheep extends Component {
    set sheepValue(value: string) {
        this._sheepValue = value;
        this.sheepValueLabel.string = value;
    }

    anim: Animation = null;
    private clips: AnimationClip[] = [];    //down jump run
    private _sheepValue: string = ``;

    // 拿去給外部注入用
    public onSheepFinishMove: (index: number) => void = null;
    calculateReward: (multiply: string) => void = null;

    isClicked: boolean = false;

    private starNode: Node = null;
    private sheepValueLabel: Label;
    private sheepSprite: Sprite;

    onLoad() {
        this.anim = this.getComponent(Animation);
        this.sheepSprite = this.getComponent(Sprite);
        this.clips = this.anim.clips;
        this.starNode = this.node.parent.children[1];

        let valueLabelNode = this.node.children[0];
        valueLabelNode.scale = Vec3.ZERO;
        this.sheepValueLabel = valueLabelNode.getComponent(Label);
    }

    start() {
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

    async sheepOnClick() {
        if (this.isClicked) {
            return;
        }
        this.isClicked = true;

        this.playAnimation(this.anim, this.clips[1]).then(() => {
                console.log(`this.sheepValue: ${this._sheepValue}`);
                if (this._sheepValue == `END`) {
                    this.sheepGoDie();
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

                    this.calculateReward(this._sheepValue);
                }
            }
        );
    }

    sheepGoDie(gameEnd: boolean = false) {
        this.playAnimation(this.anim, this.clips[0]).then(() => {
            if (!gameEnd) {
                this.calculateReward(this._sheepValue);
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

