import {_decorator, Animation, AnimationClip, Component, NodeEventType} from 'cc';

const {ccclass, property} = _decorator;

@ccclass('Sheep')
export class Sheep extends Component {
    anim: Animation = null;
    private clips: AnimationClip[] = [];    //down jump run

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

    private sheepOnClick = async () => {

    }

    InitButton() {
        this.node.on(NodeEventType.MOUSE_DOWN, this.sheepOnClick);

    }
}

