///<reference path="Events.ts"/>
///<reference path="Keyboard.ts"/>
///<reference path="Mobiles.ts"/>
///<reference path="endgate/endgate-0.2.1.d.ts"/>
///<reference path="phaser/phaser.d.ts"/>

window.onload = () => {
    var el = document.getElementById('gameCanvas');
    //var game = new Game.LifeInLife(<HTMLCanvasElement>el);
    var game = new Game.PhaserGame();
};

module Game {

    export class PhaserGame {
        game:Phaser.Game;

        constructor() {
            var state = new PhaserGameState();
            this.game = new Phaser.Game(800, 600, Phaser.CANVAS, 'content',
                state,
                true, // transparent
                true); // antialias

        }

    }

    export class PhaserGameState extends Phaser.State {

        //game:Phaser.Game;
        player:Player;
        private hud:Hud;
        cursor:Phaser.CursorKeys;

        public get debug() : Phaser.Utils.Debug {
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

        }

        create() {


            this.cameraAnchor = this.add.sprite(0, 0, 'empty');
            this.cameraAnchor.fixedToCamera = true;



//{ font: '64px desyrel', align: 'center' }

            this.hud = new Hud(this);

            this.cursor = this.input.keyboard.createCursorKeys();

            this.world.setBounds(0, 0, 2000, 2000);

            this.npcs = new Phaser.Group(this.game, null, "npc's", false);
            for (var i = 0; i < 100; i++) {
                var npc = new Npc(this.world.randomX, this.world.randomY, this);
                //this.npcs.add(npc.Sprite);
                this.mobiles.push(<Mobile>npc);
            }


            //  Stop the following keys from propagating up to the browser
            this.input.keyboard.addKeyCapture([
                Phaser.Keyboard.LEFT,
                Phaser.Keyboard.RIGHT,
                Phaser.Keyboard.UP,
                Phaser.Keyboard.DOWN,
                Phaser.Keyboard.SPACEBAR ]);

            var player = new Player(this.world.centerX, this.world.centerY, this);
            this.player = player;
            this.mobiles.push(<Mobile>player);

            this.camera.follow(this.player.Sprite, Phaser.Camera.FOLLOW_PLATFORMER);
        }

        update() {
            var playerSprite = this.player.Sprite;

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
            for(var i in this.mobiles) {
                this.mobiles[i].update();
            }

            this.hud.update();

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

    class Hud {
        state:PhaserGameState;

        constructor(state:PhaserGameState) {
            this.state = state;
        }

        public update() {
        }

        public render() {
            var text = "In Range: " + Phaser.Math.roundTo(this.state.player.inRange).toString();
            this.state.debug.renderText(text, 10, 10, 'black', '14px Arial');

            var text = "Energy: " + Phaser.Math.roundTo(this.state.player.energy, -2).toString();
            this.state.debug.renderText(text, 100, 10, 'black', '14px Arial');
        }



    }


    class Target extends EndGate.Collision.Collidable {
        private static _targetRadius:number = 30;
        private static _targetColor:EndGate.Graphics.Color = EndGate.Graphics.Color.Green;
        private static _targetBodyColor:EndGate.Graphics.Color = EndGate.Graphics.Color.Transparent;

        public Graphic:EndGate.Graphics.Circle;

        constructor(x:number, y:number) {
            this.Graphic = new EndGate.Graphics.Circle(x, y, Target._targetRadius, Target._targetBodyColor);

            super(this.Graphic.GetDrawBounds());

            // Make a border around our base graphic
            this.Graphic.Border(5, Target._targetColor);
            // Add a vertical rectangle to the base graphic
            this.Graphic.AddChild(new EndGate.Graphics.Rectangle(0, 0, 5, 40, Target._targetColor));
            // Add a horizontal rectangle to the base graphic
            this.Graphic.AddChild(new EndGate.Graphics.Rectangle(0, 0, 40, 5, Target._targetColor));
        }

        public Collided(data:EndGate.Collision.CollisionData):void {
            // We cannot collide with other targets because all targets have static positions.  Adding a collidable with a static position to the
            // CollisionManager will optimize collision detection AND prevent other static collidables from colliding with each other.

            // Will remove the target from the collision manager
            this.Dispose();
            // Will remove the target from the scene (will no longer be drawn)
            this.Graphic.Dispose();

            super.Collided(data);
        }
    }


}