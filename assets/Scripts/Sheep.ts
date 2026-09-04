import {_decorator, Animation, AnimationClip, Component, NodeEventType} from 'cc';
import {ViewManager} from "db://assets/Scripts/ViewManager";

const {ccclass, property} = _decorator;

@ccclass('Sheep')
export class Sheep extends Component {
    anim: Animation = null;
    private clips: AnimationClip[] = [];    //down jump run
    sheepValue: string = ``;
    isClicked: boolean = false;

    onLoad() {
        this.anim = this.getComponent(Animation);
        this.clips = this.anim.clips;
    }

    start() {
    }

    async playAnimation(anim: Animation, clip: AnimationClip, loop = false, timer: number = 5): Promise<void> {
        return new Promise((resolve) => {
            console.log(clip.name);
            const state = anim.getState(clip.name);
            let countDown: number = clip.duration;
            if (loop) {

                state.wrapMode = AnimationClip.WrapMode.Loop;
                // loop 記得要給停止時間，不然一樣只會播一輪
                countDown = timer;
            }

            anim.play(clip.name)

            this.scheduleOnce(() => {
                console.log("resolve");

                anim.stop();
                resolve();
            }, countDown);
        });
    };

    private sheepOnClick = async (view: ViewManager) => {
        if (this.isClicked) return;
        if (view.isAnySheepMoving()) return;    // 其他羊開講時不能生效

        this.playAnimation(this.anim, this.clips[2]).then(() => {
                console.log(`this.sheepValue: ${this.sheepValue}`);
                // todo: 傳回view 做計算
            }
        );


    }

    InitButton(view: ViewManager, index: number) {
        this.sheepValue = view.shuffledBonus[index];

        this.node.on(NodeEventType.MOUSE_DOWN, () => this.sheepOnClick(view));

    }
}

