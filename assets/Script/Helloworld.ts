import MazeFactory from "./MazeFactory";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Node)
    label1: cc.Node = null;

    @property(cc.Node)
    label: cc.Node = null;

    @property
    text: string = 'hello';

    start() {

        MazeFactory.createMaze({
            gridSize: cc.size(150, 150),
            row: 5,
            col: 5,
            horizontalWall: this.label1,
            verticalWall: this.label,
            originPoint: cc.v2(-479.003, -319.144),
            // originPoint: cc.v2(-0.003, -0.144),
            root:this.node,
        });

    }
}
