import "phaser";
import { Player } from '../objects/player';

export class SimpleGameScene extends Phaser.Scene {

    gameData: Array<any>; // a supprimer lorsqu'on aura les appels a l'api
    compteur: number = 0;
    playersList: Array<Player> = [];
    roundText: Phaser.GameObjects.Text;

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
        this.load.spritesheet('tiles', '../assets/tilesets/test-tiles.png', { frameWidth: 16, frameHeight: 16 });

        // on recupere le json mock le temps de la creation de l'appel rest
        this.load.json('mockData', '../assets/json/mock.json');
    }

    create(): void {
        // On crée les differents elements du jeu

        // A integrer dans le processus de round pour les modifications de la map a chaque tour
        this.createMap();

        // on recupere les données du mock preload en cache
        this.gameData = this.cache.json.get('mockData').data;
        // initialisation du text de round
        this.roundText = this.add.text(100, 100, '', { font: '24px Impact', fill: '#FBFBAC' });

        // on lance la partie
        this.runGame();
    }

    update(time): void {
        // Boucle pour les elements interactifs
    }

    runGame() {
        this.getDataByIteration(this.compteur).then((gameData: any) => {
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
                console.log('Fin de la partie');
                return;
            }
        })
    }

    playersActions(players) {
        return new Promise((resolve: PromiseResolve<number>, reject: PromiseReject): void => { 
            this.movePlayer(players, 0, (error, data) => { 
                if (error) reject(error) 
                else resolve(data)
            }); 
        }); 
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
            this.cameras.main.startFollow(playerRef.sprite, false, 0.1, 0.1);

            index++;

            // On rappele la fonction pour passer au player suivant
            this.movePlayer(players, index, callback);
        }else{
            const vm = this;
            const playerRef = this.playersList[player.id];

            this.cameras.main.startFollow(playerRef.sprite, false, 0.1, 0.1);

            playerRef.move({posX: player.posX, posY: player.posY}, function() {
                index++;
                vm.movePlayer(players, index, callback);
            })
        }
    }

    getDataByIteration (iteration) {
        return new Promise((resolve: PromiseResolve<any>, reject: PromiseReject): void => {
            // TODO: recuperation des données depuis l'api rest
            resolve(this.gameData[iteration]);
        }); 
    }

    displayRound () {
        return new Promise((resolve: PromiseResolve<any>, reject: PromiseReject): void => {
            const vm = this;
            const text: string = "Round n° " + this.compteur;

            if(this.compteur > 0) {
                this.roundText.setText(text);

                this.roundText.x = this.cameras.main.scrollX + ( this.game.canvas.width / 2) - (this.roundText.width / 2);
                this.roundText.y = this.cameras.main.scrollY + 50;

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
            }else{
                resolve();
            }
            
        }); 
    }

    createMap() {
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
    }
};