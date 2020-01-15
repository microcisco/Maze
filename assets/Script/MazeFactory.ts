const {ccclass, property} = cc._decorator;

/**@description 作闭右开*/
function RandomInt(Min, Max): number {
    return Min + Math.floor(Math.random() * (Max - Min));
}

class Stack<T> {
    private data: T[] = [];

    Push(t: T) {
        this.data.push(t);
    }

    Peek(): T {
        if (this.data.length === 0) return null;
        return this.data[this.data.length - 1];
    }

    Pop() {
        if (this.data.length === 0) return;
        this.data.pop();
    }

    Clear(): void {
        this.data.length = 0;
    }

    getLength() {
        return this.data.length;
    }
}

class DFS {
    //所有水平方向墙壁
    private allHorizontalWall: cc.Vec2[] = [];
    //所有垂直方向墙壁
    private allVerticalWall: cc.Vec2[] = [];
    //所有参观过的格子
    private visitGrid: cc.Vec2[] = [];
    //行
    private readonly row: number;
    //列
    private readonly col: number;

    constructor(row: number, col: number) {
        this.row = row;
        this.col = col;
    }

    private clear(): void {
        this.allHorizontalWall.length = 0;
        this.allVerticalWall.length = 0;
        this.visitGrid.length = 0;
        this.stack.Clear();
    }

    /**@description 随机返回一个相邻且没有被访问过的格子*/
    private findNewNeighbour(pos: cc.Vec2) {
        const arr: cc.Vec2[] = [];
        if (pos.y + 1 <= this.col - 1) {
            const item = cc.v2(pos.x, pos.y + 1);
            if (!this.visitGrid.some(value => value.equals(item))) arr.push(item);
        }
        if (pos.x + 1 <= this.row - 1) {
            const item = cc.v2(pos.x + 1, pos.y);
            if (!this.visitGrid.some(value => value.equals(item))) arr.push(item);
        }
        if (pos.y - 1 >= 0) {
            const item = cc.v2(pos.x, pos.y - 1);
            if (!this.visitGrid.some(value => value.equals(item))) arr.push(item);
        }
        if (pos.x - 1 >= 0) {
            const item = cc.v2(pos.x - 1, pos.y);
            if (!this.visitGrid.some(value => value.equals(item))) arr.push(item);
        }
        if (arr.length === 0) return null;
        return arr[Math.floor(Math.random() * arr.length)];
    }

    /**@description 打通墙壁*/
    private throughWall(pos0: cc.Vec2, pos1: cc.Vec2) {
        if (pos0.x === pos1.x && pos0.y !== pos1.y) {
            //纵轴
            if (pos0.y < pos1.y) {
                //pos0上边
                this.allVerticalWall.push(pos1.clone());
            } else {
                //pos0下边
                this.allVerticalWall.push(pos0.clone());
            }
        } else if (pos0.x !== pos1.x && pos0.y === pos1.y) {
            //横轴
            if (pos0.x < pos1.x) {
                //pos0右边
                this.allHorizontalWall.push(pos1.clone());
            } else {
                //pos0左边
                this.allHorizontalWall.push(pos0.clone());
            }
        } else {
            throw new Error('throughWall fail');
        }
    }

    /**@description 获取随机位置*/
    private getRandomPos() {
        return cc.v2(RandomInt(0, this.row - 1), RandomInt(0, this.col - 1));
    }

    private stack: Stack<cc.Vec2> = new Stack<cc.Vec2>();
    //当前格子
    private curArea: cc.Vec2;

    create() {
        this.clear();
        //随机选择迷宫中一个点 && 加入已经访问到的格子
        this.curArea = this.getRandomPos();
        this.stack.Push(this.curArea.clone());
        this.visitGrid.push(this.curArea.clone());
        while (this.stack.getLength() > 0) {
            //发现没有被访问到的邻居格子
            const neighbour = this.findNewNeighbour(this.curArea);
            if (neighbour) {
                //存在邻居 && 打通当前点与此邻接点之间的墙壁。
                this.throughWall(this.curArea, neighbour);
                this.curArea = neighbour;
                this.visitGrid.push(this.curArea.clone());
                this.stack.Push(this.curArea.clone());
            } else {
                //当前点的周围都已经被访问到，则退回到上一个点，且以此点为当前点
                this.stack.Pop();
                this.curArea = this.stack.Peek();
            }
        }
        //返回
        return {
            allVerticalWall: this.allVerticalWall,
            allHorizontalWall: this.allHorizontalWall
        }
    }
}

//迷宫工厂
@ccclass
export default class MazeFactory extends cc.Component {
    private static horizontalWall: cc.Node;
    private static verticalWall: cc.Node;

    private static getHorizontalWall() {
        return cc.instantiate(this.horizontalWall);
    }

    private static getVerticalWall() {
        return cc.instantiate(this.verticalWall);
    }

    public static createMaze(data: {
        originPoint: cc.Vec2,
        horizontalWall: cc.Node;
        verticalWall: cc.Node;
        gridSize: cc.Size;
        row: number,
        col: number,
        root: cc.Node,
    }) {
        const dfs = new DFS(data.row, data.col);
        const q = dfs.create();
        //生成迷宫
        this.horizontalWall = data.horizontalWall;
        this.verticalWall = data.verticalWall;
        for (let i = 0; i < data.row; ++i) {
            for (let j = 0; j < data.col; ++j) {
                if (!q.allHorizontalWall.some(value => value.equals(cc.v2(i, j)))) {
                    let horizontalWall = this.getHorizontalWall();
                    horizontalWall.setPosition(data.originPoint.add(cc.v2(j * data.gridSize.height, i * data.gridSize.width)));
                    data.root.addChild(horizontalWall);
                }
                if (!q.allVerticalWall.some(value => value.equals(cc.v2(i, j)))) {
                    let verticalWall = this.getVerticalWall();
                    verticalWall.setPosition(data.originPoint.add(cc.v2(j * data.gridSize.height, i * data.gridSize.width)));
                    data.root.addChild(verticalWall);
                }
                if (i === data.row - 1) {
                    let horizontalWall = this.getHorizontalWall();
                    horizontalWall.setPosition(data.originPoint.add(cc.v2(j * data.gridSize.height, (i + 1) * data.gridSize.width)));
                    data.root.addChild(horizontalWall);
                }
                if (j === data.col - 1) {
                    let verticalWall = this.getVerticalWall();
                    verticalWall.setPosition(data.originPoint.add(cc.v2((j + 1) * data.gridSize.height, i * data.gridSize.width)));
                    data.root.addChild(verticalWall);
                }
            }
        }
    }

}
