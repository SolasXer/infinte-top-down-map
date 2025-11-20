import { _decorator, Color, Component, EventKeyboard, Input, input, instantiate, KeyCode, Node, Prefab, Sprite, Vec2 } from 'cc';
import { Perlin } from './Berlin';
const { ccclass, property } = _decorator;

const Row = 6;
const Col = 12;
const TileSize = 32;
const NosieScale = 0.1;
const MoveSpeed = 10;

@ccclass('Main')
export class Main extends Component {
    @property(Prefab)
    tilePf: Prefab;

    @property(Node)
    camera: Node;

    isMoving: boolean = false;
    velocity: Vec2 = new Vec2(0, 0);

    protected onLoad(): void {
        const count = Row * Col;
        for (let i = 0; i < count; i++) {
            const tile = instantiate(this.tilePf);
            this.camera.addChild(tile);
        }
        this.layoutTiles();
    }

    protected onEnable(): void {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    protected onDisable(): void {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }


    start() {

    }

    update(deltaTime: number) {
        if (this.velocity.x === 0 && this.velocity.y === 0) {
            return;
        }

        this.camera.x += this.velocity.x;
        this.camera.y += this.velocity.y;

        const startCol = Math.floor(this.camera.x / TileSize);
        const startRow = Math.floor(this.camera.y / TileSize);

        for (let r = 0; r < Row; r++) {
            for (let c = 0; c < Col; c++) {
                const worldCol = startCol + c;
                const worldRow = startRow + r;
                const nv = Perlin.getNoise(worldCol * NosieScale, worldRow * NosieScale, 0);
                const color = this.getBiome(nv);
                const tile = this.camera.children[r * Col + c];
                tile.getComponent(Sprite).color = new Color(color);
            }
        }
    }

    private layoutTiles() {
        const startX = this.camera.x - (Col / 2 * TileSize) + TileSize / 2;
        const startY = this.camera.y + (Row / 2 * TileSize) - TileSize / 2;
        for (let r = 0; r < Row; r++) {
            for (let c = 0; c < Col; c++) {
                const tile = this.camera.children[r * Col + c];
                const x = startX + c * TileSize;
                const y = startY - r * TileSize;
                tile.setPosition(x, y);
            }
        }
    }

    onKeyDown(e: EventKeyboard) {
        switch (e.keyCode) {
            case KeyCode.KEY_A:
                this.velocity.x = - MoveSpeed;
                break;
            case KeyCode.KEY_D:
                this.velocity.x = MoveSpeed;
                break;
            case KeyCode.KEY_W:
                this.velocity.y = -MoveSpeed;
                break;
            case KeyCode.KEY_S:
                this.velocity.y = MoveSpeed;
                break;
            default:
                break;
        }
    }

    onKeyUp(e: EventKeyboard) {
        switch (e.keyCode) {
            case KeyCode.KEY_A:
                this.velocity.x = 0;
                break;
            case KeyCode.KEY_D:
                this.velocity.x = 0;
                break;
            case KeyCode.KEY_W:
                this.velocity.y = 0;
                break;
            case KeyCode.KEY_S:
                this.velocity.y = 0;
                break;
            default:
                break;
        }
    }

    getBiome(value: number): string {
        // 柏林噪声通常返回 -1 到 1，我们需要标准化到 0 到 1 附近便于判断
        // 这里简单处理，value 大概在 -1~1 之间
        if (value < -0.2) return '#1e90ff'; // 深海
        if (value < -0.05) return '#00bfff'; // 浅水
        if (value < 0.05) return '#f4a460'; // 沙滩
        if (value < 0.4) return '#228b22';  // 森林
        if (value < 0.6) return '#696969';  // 岩石
        return '#fffafa';                   // 雪山
    }
}
