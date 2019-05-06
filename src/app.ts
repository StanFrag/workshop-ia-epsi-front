import "phaser";
import { SimpleGameScene } from './scenes/simple-example.scene'

const config: GameConfig = {
  title: "test cgi",
  width: 800,
  height: 600,
  parent: "phaser-example",
  scene: [ SimpleGameScene ],
  backgroundColor: "#182116"
};

export class CgiGame extends Phaser.Game {
  constructor(config: GameConfig) {
    super(config);
  }
}

window.onload = () => {
  var game = new CgiGame(config);
};