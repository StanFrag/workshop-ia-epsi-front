import "phaser";
import { Player } from '../objects/player';

type Callback = (error?: Error, data?: number) => void;
type PromiseResolve<T> = (value?: T | PromiseLike<T>) => void;
type PromiseReject = (error?: any) => void;

export class SimpleGameScene extends Phaser.Scene {

    gameData: Array<any>; // a supprimer lorsqu'on aura les appels a l'api
    compteur: number = 0; // a supprimer lorsqu'on aura les appels a l'api

    // playersList: Array<Phaser.GameObjects.TileSprite> = [];
    playersList: Array<Player> = [];

    gameCamera: any;
    roundText: Phaser.GameObjects.Text;

    movePlayerDuration: Number = 3000;

    constructor() {
        super({
            key: "SimpleGameScene"
        });

    }

    init(params): void {
        // On recupere les parametres envoyés depuis une autre scene
    }

    preload(): void {
        // preload de l'ensemble des images/sprites/atlas
        this.load.image("logo", "../assets/logo.png");
        this.load.image("map-tiles", "../assets/tilesets/test-tiles.png");

        this.load.spritesheet('tiles', '../assets/tilesets/test-tiles.png', { frameWidth: 16, frameHeight: 16 });
    }

    // fonction recursive
    // permet le mouvement/creation de chaque player en jeu
    movePlayer(players, index, callback: Callback) {
        
        if (index === players.length) {
            return callback();
        }

        let player = players[index];

        // Si le player n'existe pas encore, on le crée
        // mais on ne le deplace pas
        if (!this.playersList[player.id]) {
            // on crée le player
            const playerRef = new Player(player, this);
            this.playersList[player.id] = playerRef;

            // On fait suivre le nouveau player pour la camera
            // On pourra créer une animation pour que le joueur n'apparaisse pas simplement comme ca
            this.gameCamera.startFollow(playerRef.sprite, false, 0.1, 0.1);

            index++;

            // On rappele la fonction pour passer au player suivant
            this.movePlayer(players, index, callback);
        }else{
            const vm = this;
            const playerRef = this.playersList[player.id];

            this.gameCamera.startFollow(playerRef.sprite, false, 0.1, 0.1);

            playerRef.move({posX: player.posX, posY: player.posY}, function() {
                index++;
                vm.movePlayer(players, index, callback);
            })
        }
    }

    playersActions(players) {
        return new Promise((resolve: PromiseResolve<number>, reject: PromiseReject): void => { 
            this.movePlayer(players, 0, (error, data) => { 
                if (error) reject(error) 
                else resolve(data)
            }); 
        }); 
    }

    getData () {
        return new Promise((resolve: PromiseResolve<any>, reject: PromiseReject): void => {
            // TODO: recuperation des données depuis l'api rest
            resolve(this.gameData[this.compteur]);
        }); 
    }

    displayRound () {
        return new Promise((resolve: PromiseResolve<any>, reject: PromiseReject): void => {
            const vm = this;
            const text: string = "Round n° " + this.compteur;

            this.roundText.setText(text);

            this.roundText.x = this.gameCamera.x - ( this.roundText.width/2);
            this.roundText.y = this.gameCamera.y - 50;

            this.roundText.alpha = 0;
            this.roundText.setVisible(true);

            this.tweens.add({
                targets: this.roundText,
                alpha: { value: 1, duration: 2000, ease: 'Power1' },
                onComplete: function () {
                    vm.roundText.setVisible(false);
                    resolve();
                },
            });
        }); 
    }

    runGame() {
        this.getData().then((gameData: any) => {
            if (gameData) {

                this.displayRound()
                .then(() => {return this.playersActions(gameData.players)})
                .then(() => {
                        console.log("Fin du round n° ", this.compteur);
                        this.compteur++;
                        this.runGame();
                    })
                .catch(error => { 
                    console.log('error: ', error); 
                });
            } else {
                console.log('FIN DU JEU');
                return;
            }
        })
        
    }

    create(): void {
        this.testMap();


        this.gameCamera = this.cameras.add(100, 100, 200, 200).setZoom(1);
        this.gameCamera.setBounds(0, 0, this.game.canvas.width, this.game.canvas.height);

        this.roundText = this.add.text(100, 100, '', { font: '24px Impact', fill: '#FBFBAC' });

        this.gameData = [{
            players: [
                {id: 0, user_id: 0, posX: 18, posY: 8},
                {id: 1, user_id: 0, posX: 12, posY: 16},
            ]
        },
        {
            players: [
                {id: 0, user_id: 0, posX: 8, posY: 78},
                {id: 1, user_id: 0, posX: 132, posY: 84},
                {id: 2, user_id: 0, posX: 150, posY: 98}
            ]
        },
        {
            players: [
                {id: 0, user_id: 0, posX: 58, posY: 178},
                {id: 1, user_id: 0, posX: 32, posY: 124},
                {id: 2, user_id: 0, posX: 70, posY: 198}
            ]
        },
        {
            players: [
                {id: 0, user_id: 0, posX: 18, posY: 8},
                {id: 1, user_id: 0, posX: 12, posY: 16},
                {id: 2, user_id: 0, posX: 150, posY: 98}
            ]
        },
    ];

        this.runGame();
    }

    update(time): void {}

    testMap() {
        const level = [
            [  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0 ],
            [  0,   16,   2,   3,   0,   0,   0,   1,   2,   3,   0 ],
            [  0,   5,   6,   7,   0,   0,   0,   5,   6,   7,   0 ],
            [  0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0 ],
            [  0,   0,   0,  14,  13,  14,   0,   0,   0,   0,   0 ],
            [  0,   0,   0,   0,  12,  12,   12,   0,   0,   0,   0 ],
            [  0,   0,   0,   0,  12,  12,   12,   0,   0,   0,   0 ],
            [  0,   0,  14,  14,  14,  14,  14,   0,   0,   0,  15 ],
            [  0,   0,   0,   0,   0,   0,   0,   0,   0,  15,  15 ],
            [ 35,  36,  37,   0,   0,   0,   0,   0,  15,  15,  15 ],
            [ 39,  39,  39,  39,  39,  39,  39,  39,  39,  39,  39 ]
          ];
        
        // When loading from an array, make sure to specify the tileWidth and tileHeight
        const map = this.make.tilemap({ data: level, tileWidth: 16, tileHeight: 16 });
        const tiles = map.addTilesetImage("tiles");
        const layer = map.createStaticLayer(0, tiles, 0, 0);
        // layer.setScale(3,3);
        
        let test = map.getTileAt(1, 1, true, layer);
    }
};