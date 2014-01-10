///<reference path="Events.ts"/>
///<reference path="Mobiles.ts"/>
///<reference path="Components.ts"/>
///<reference path="Entities.ts"/>
///<reference path="Systems.ts"/>
///<reference path="endgate/endgate-0.2.1.d.ts"/>
///<reference path="phaser/phaser.d.ts"/>

window.onload = () => {
    var el = document.getElementById('gameCanvas');
    //var game = new Game.LifeInLife(<HTMLCanvasElement>el);
    var game = new Game.LifeInLifeGame();
};

module Game {

    export class LifeInLifeGame extends Phaser.Game {
        constructor() {
            super(800, 600, Phaser.CANVAS, 'content', null, true, true);
            // TODO: Into: (Game of Life + Loading assets) Limited by loading screen but with min length
            // TODO: Menu: Game of Life style
            this.state.add("Main", new PhaserGameState(), true);

            // Esc -> Exit Dialog -> Menu/Cancel
        }

    }

    export class PhaserGameState extends Phaser.State {
        player:Player;
        private hud:Hud;
        cursor:Phaser.CursorKeys;

        componentManager:ComponentManager = new ComponentManager();
        spawnSystem:SpawnSystem;

        public get debug():Phaser.Utils.Debug {
            return this.game.debug;
        }

        mobiles:Array<Mobile> = [];

        npcs:Phaser.Group;

        cameraAnchor:Phaser.Sprite;

        constructor() {
            super();
        }

        preload() {
            this.load.bitmapFont("lucky_day", 'fonts/lucky_day.png', 'fonts/lucky_day.xml'); // Lucky_Day
            this.load.bitmapFont('desyrel', 'fonts/desyrel.png', 'fonts/desyrel.xml'); // Desyrel

            this.load.image('empty', 'sprites/empty.png');
            this.load.image('player', 'sprites/player.png');
            this.load.image('target', 'sprites/target.png');
            this.load.image('energy', 'sprites/energy.png');
            this.load.image('energy_red', 'sprites/energy_red.png');
            this.load.image('energy_yellow', 'sprites/energy_yellow.png');
            this.load.image('energy_green', 'sprites/energy_green.png');
            this.load.image('energy_bar', 'sprites/energy_bar.png');

        }

        create() {
            this.spawnSystem = new Game.SpawnSystem(this.game, this.componentManager);

            this.cameraAnchor = this.add.sprite(0, 0, 'empty');
            this.cameraAnchor.fixedToCamera = true;

            this.hud = new Hud(this.game, this);

            this.cursor = this.input.keyboard.createCursorKeys();

            this.world.setBounds(0, 0, 2000, 2000);

            this.npcs = this.game.add.group(this.world, "npcs");

            for (var i = 0; i < 100; i++) {
                var npc = new Npc(this.game, this.world.randomX, this.world.randomY, this);
                this.npcs.add(npc);
                this.mobiles.push(<Mobile>npc);
            }


            var spawn = new Spawn();
            spawn.spawnDelaySec = 5;
            spawn.started = this.game.time.elapsed;
            spawn.active = true;
            var spawnerEntity = new SpawnerEntity(spawn);
            // TODO: also support "late registering"
            this.componentManager.register(spawnerEntity);



            //  Stop the following keys from propagating up to the browser
            this.input.keyboard.addKeyCapture([
                Phaser.Keyboard.LEFT,
                Phaser.Keyboard.RIGHT,
                Phaser.Keyboard.UP,
                Phaser.Keyboard.DOWN,
                Phaser.Keyboard.SPACEBAR ]);

            var player = new Player(this.game, this.world.centerX, this.world.centerY);
            this.player = player;
            this.mobiles.push(<Mobile>player);

            var playerEntity = new Entity();
            playerEntity.addComponent(new Sprite(player));
            playerEntity.addComponent(new NeighbourCount(this.npcs));
            this.componentManager.register(playerEntity);

            this.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);
        }



        update() {
            var playerSprite = this.player;

            playerSprite.body.velocity.x = 0;
            playerSprite.body.velocity.y = 0;

            if (this.cursor.left.isDown) {
                playerSprite.body.velocity.x = -200;
            }

            if (this.cursor.right.isDown) {
                playerSprite.body.velocity.x = 200;
            }

            if (this.cursor.up.isDown) {
                playerSprite.body.velocity.y = -200;
            }

            if (this.cursor.down.isDown) {
                playerSprite.body.velocity.y = 200;
            }

            if (this.input.keyboard.isDown(Phaser.Keyboard.PAGE_DOWN)) {

            }

            /*
             if (this.game.input.mousePointer.justPressed()) {
             playerSprite.x = this.game.input.mousePointer.x;
             playerSprite.y = this.game.input.mousePointer.y;

             this.game.input.mousePointer.reset();
             }
             */

            // STC: Yet we have to manage all systems here manually. Might be the most flexible solution, but maybe not
            this.spawnSystem.update();
            new CountNeighboursSystem(this.game, this.componentManager).update();
        }

        render() {
            this.hud.render();
            //var text = "Energy: ";
            // var style = { font: "14px Arial", fill: "#ff0044", align: "center" };

            //renderText(text: string, x: number, y: number, color?: string, font?: string): void;
            // this.debug.renderText(text, 10, 10, 'black', '14px Arial');

            //this.game.debug.renderSpriteCorners(this.player.Sprite, false, true);
            //this.game.debug.renderSpriteInfo(this.player.Sprite, 20, 32);


        }


    }

    class Hud extends Phaser.Group {

        state:PhaserGameState;

        energyBar:Phaser.Sprite;

        constructor(game: Phaser.Game, state:PhaserGameState) {
            super(game, game.world, "Hud");

            this.state = state;

            var bar = this.game.add.graphics(0, 0);
            bar.lineStyle(2, 0x0000FF, 1);
            bar.drawRect(50, 250, 100, 100);
            this.add(bar);
            this.energyBar = bar;


           // this.energyBar = this.create(0, 0, 'energy_bar');

            this.energyBar.cameraOffset = new Phaser.Point(200, 6);

            //this.energyBar.cropEnabled = true;
            //this.energyBar.crop = new Phaser.Rectangle(0, 0, this.energyBar.body.width, this.energyBar.body.height);
            this.energyBar.fixedToCamera = true;
        }

        public update() {
        }

        public render() {
            var text = "In Range: " + Phaser.Math.roundTo(this.state.player.inRange).toString();
            this.state.debug.renderText(text, 10, 10, 'black', '14px Arial');

            var text = "Energy: " + Phaser.Math.roundTo(this.state.player.energy, -2).toString();
            this.state.debug.renderText(text, 100, 10, 'black', '14px Arial');

            //this.energyBar.crop.width = this.energyBar.body.width / 10 * this.state.player.energy;

        }


    }
}