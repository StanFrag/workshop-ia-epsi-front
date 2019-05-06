export class Player {
    id: number;
    user_id: number;
    posX: number;
    posY: number;

    sprite: Phaser.GameObjects.TileSprite;
    scene: Phaser.Scene

    constructor(params: Player, scene: Phaser.Scene) {
        this.id = params.id;
        this.user_id = params.user_id;
        this.posX = params.posX;
        this.posY = params.posY;

        this.scene = scene;

        this.initSprite();
    }

    private initSprite() {
        this.sprite = this.scene.add.tileSprite(this.posX, this.posY, 0, 0, 'tiles', "259");
        this.sprite.setOrigin(0)
    }

    public move(position, callback) {
        this.scene.tweens.add({
            targets: this.sprite,
            x: position.posX,
            y: position.posY,
            duration: 3000,
            onComplete: function () {
                callback();
            }
        });
    }
}