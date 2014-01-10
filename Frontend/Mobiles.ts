///<reference path="phaser/phaser.d.ts"/>
///<reference path="app.ts"/>
module Game {

    export interface IMobile {
        update();
    }

    export class Mobile extends Phaser.Sprite implements IMobile {
        state:PhaserGameState;

        constructor(game: Phaser.Game, x?: number, y?: number, key?: string, frame?: number) {
            super(game, x, y, key, frame);

            if(game.state.states[game.state.current] instanceof  PhaserGameState) {
                this.state = <PhaserGameState>game.state.states[game.state.current];
            }
            else {
                console.error("ERROR: state is not of type PhaserGameState");
            }

        }

        update() {
        }
    }


    // TODO: Should be a sprite
    export class Player extends Mobile {
        private energyPerSec:number = 1;

        public inRange:number = 0;
        public energy:number = 10;


        constructor(game: Phaser.Game, x:number, y:number) {
            super(game, x, y, 'player' );
            this.body.collideWorldBounds = true;
            this.anchor.setTo(0.5, 0.5);

            this.game.input.mouse.mouseDownCallback = <Function>((e) => this.mouseClick(e));
            this.game.add.existing(this);
        }

        public mouseClick(event:MouseEvent) {
            //this.bubbleText("LANG");
        }

        public update() {
            this.inRange = this.countInRange();

            var elapsedSec = this.game.time.elapsed / 1000;
            this.gainEnergy(elapsedSec);
        }

        private gainEnergy(elapsedSec:number) {
            var old = this.energy;
            this.energy += elapsedSec * this.energyGainPerSec;
            this.energy = Math.max(0, this.energy);

            if (Math.floor(this.energy) < Math.floor(old)) {
                this.bubbleText("-1");
            }

            if (Math.floor(this.energy) > Math.floor(old)) {
                this.bubbleText("+1");
            }
        }

        public bubbleText(msg:string) {
            var body = this.body;

            var text = this.game.add.bitmapText(body.x, body.y - 30, msg, { font: '28px Desyrel', align: 'center' });
            var moveTween = this.game.add.tween(text).to({ y: body.y - 80 }, 1000, Phaser.Easing.Cubic.Out, true);
            var hideTween = this.game.add.tween(text).to({ alpha: 0 }, 200, Phaser.Easing.Quadratic.InOut, true, 500);

            hideTween.onComplete.addOnce(() => {this.game.world.remove(text)});
        }

        public get energyGainPerSec():number {
            var optimal = 3;
            var diff = Math.abs(optimal - this.inRange);

            if (diff == 0)
                return this.energyPerSec;
            else if (diff > 1) {
                return -this.energyPerSec;
            }
            return 0;
        }

        private countInRange():number {
            var player = this.state.player.center;
            var count = 0;
            for (var i in this.state.mobiles) {
                var mob = this.state.mobiles[i].center;

                var dist = Phaser.Math.distance(player.x, player.y, mob.x, mob.y);
                if (mob != player && dist < 100) {
                    count++;
                }
            }
            return count;
        }
    }

    export class Npc extends Mobile {

        // Energy Emitter
        private emitterRed:Phaser.Particles.Arcade.Emitter;
        private emitterYellow:Phaser.Particles.Arcade.Emitter;
        private emitterGreen:Phaser.Particles.Arcade.Emitter;

        constructor(game:Phaser.Game, x:number, y:number, state:PhaserGameState) {
            super(game, x, y, 'target');
            this.state = state;

            this.body.collideWorldBounds = true;
            this.body.velocity.x = this.state.game.rnd.frac() * 100;
            this.body.velocity.y = this.state.game.rnd.frac() * 100;
            this.body.bounce.setTo(1, 1);
            this.anchor.setTo(0.5, 0.5);

            this.emitterGreen = this.buildEmitter('energy_green');
            this.emitterYellow = this.buildEmitter('energy_yellow');
            this.emitterRed = this.buildEmitter('energy_red');


        }

        buildEmitter(sprite:string) {
            var emitter = this.state.add.emitter(this.x, this.y, 100);
            emitter.gravity = 0;
            //keys: string[], frames: string[], quantity: number, collide: boolean, collideWorldBounds: boolean

            emitter.makeParticles([sprite], [], 2, false, false);
            emitter.x = this.x;
            emitter.y = this.y;
            emitter.minParticleScale = 2;
            emitter.maxParticleScale = 2;
            emitter.start(false, 2000, 100, 0);
            emitter.on = false;
            return emitter;
        }

        public update() {
            this.emitterRed.x = this.x;
            this.emitterRed.y = this.y;
            this.emitterYellow.x = this.x;
            this.emitterYellow.y = this.y;
            this.emitterGreen.x = this.x;
            this.emitterGreen.y = this.y;

            var inRange = this.state.physics.distanceBetween(this, this.state.player) < 100;

            this.emitterRed.on = false;
            this.emitterYellow.on = false;
            this.emitterGreen.on = false;

            if (this.state.player.energyGainPerSec > 0) {
                this.emitterGreen.on = inRange;
            }
            if (this.state.player.energyGainPerSec == 0) {
                this.emitterYellow.on = inRange;
            }
            if (this.state.player.energyGainPerSec < 0) {
                this.emitterRed.on = inRange;
            }


            this.emitterRed.forEach(this.moveTo, this, false);
            this.emitterYellow.forEach(this.moveTo, this, false);
            this.emitterGreen.forEach(this.moveTo, this, false);
        }

        moveTo(sprite:Phaser.Sprite) {
            if (this.state.physics.distanceBetween(sprite, this.state.player) < 10) {
                sprite.kill();
                return;
            }

            this.state.physics.moveToObject(sprite, this.state.player, 500);
        }
    }
}