var Events;
(function (Events) {
    var EventArgs = (function () {
        function EventArgs() {
        }
        EventArgs.Empty = new EventArgs();
        return EventArgs;
    })();
    Events.EventArgs = EventArgs;

    var EventHandler = (function () {
        function EventHandler() {
            this._events = [];
        }
        EventHandler.prototype.hasEventListener = function (listener) {
            var listeners = this._events;
            if (listeners) {
                for (var i = 0, l = listeners.length; i < l; i++) {
                    if (listeners[i] === listener) {
                        return true;
                    }
                }
            }
            return false;
        };

        EventHandler.prototype.addEventListener = function (listener) {
            // Not sure you absolutely need this test
            if (!this.hasEventListener(listener)) {
                var listeners = this._events;
                if (!listeners) {
                    listeners = this._events = [];
                }
                listeners.push(listener);
            }
        };

        EventHandler.prototype.removeEventListener = function (listener) {
            var listeners = this._events;
            if (listeners) {
                for (var i = 0, l = listeners.length; i < l; i++) {
                    if (listeners[i] === listener) {
                        listeners.splice(i, 1);
                        break;
                    }
                }
            }
        };

        EventHandler.prototype.invoke = function (sender, e) {
            if (typeof sender === "undefined") { sender = {}; }
            if (typeof e === "undefined") { e = EventArgs.Empty; }
            var listeners = this._events;
            if (listeners) {
                for (var i = 0, l = listeners.length; i < l; i++) {
                    listeners[i].call(sender, e);
                }
            }
        };
        return EventHandler;
    })();
    Events.EventHandler = EventHandler;
})(Events || (Events = {}));
///<reference path="Events.ts"/>
var Events;
(function (Events) {
    var KeyboardHandler = (function () {
        function KeyboardHandler() {
            var _this = this;
            this.moveLeft = new Events.EventHandler();
            this.moveRight = new Events.EventHandler();
            this.moveUp = new Events.EventHandler();
            this.moveDown = new Events.EventHandler();
            document.onkeydown = function (e) {
                return _this.keyListener(e);
            };
        }
        KeyboardHandler.prototype.keyListener = function (e) {
            if (!e) {
                e = window.event;
            }

            if (e.keyCode == 37) {
                //keyCode 37 is left arrow
                this.moveLeft.invoke(this);
            }
            if (e.keyCode == 38) {
                //keyCode 38 is up arrow
                this.moveUp.invoke(this);
            }
            if (e.keyCode == 39) {
                //keyCode 39 is right arrow
                this.moveRight.invoke(this);
            }
            if (e.keyCode == 40) {
                //keyCode 40 is down arrow
                this.moveDown.invoke(this);
            }
        };
        return KeyboardHandler;
    })();
    Events.KeyboardHandler = KeyboardHandler;
})(Events || (Events = {}));
///<reference path="Events.ts"/>
///<reference path="Keyboard.ts"/>
///<reference path="Mobiles.ts"/>
///<reference path="endgate/endgate-0.2.1.d.ts"/>
///<reference path="phaser/phaser.d.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
window.onload = function () {
    var el = document.getElementById('gameCanvas');

    //var game = new Game.LifeInLife(<HTMLCanvasElement>el);
    var game = new Game.LifeInLifeGame();
};

var Game;
(function (Game) {
    var LifeInLifeGame = (function (_super) {
        __extends(LifeInLifeGame, _super);
        function LifeInLifeGame() {
            _super.call(this, 800, 600, Phaser.CANVAS, 'content', null, true, true);

            // TODO: Into: (Game of Life + Loading assets) Limited by loading screen but with min length
            // TODO: Menu: Game of Life style
            this.state.add("Main", new PhaserGameState(), true);
            // Esc -> Exit Dialog -> Menu/Cancel
        }
        return LifeInLifeGame;
    })(Phaser.Game);
    Game.LifeInLifeGame = LifeInLifeGame;

    var PhaserGameState = (function (_super) {
        __extends(PhaserGameState, _super);
        function PhaserGameState() {
            _super.call(this);
            this.mobiles = [];
        }
        Object.defineProperty(PhaserGameState.prototype, "debug", {
            get: function () {
                return this.game.debug;
            },
            enumerable: true,
            configurable: true
        });

        PhaserGameState.prototype.preload = function () {
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
        };

        PhaserGameState.prototype.create = function () {
            this.cameraAnchor = this.add.sprite(0, 0, 'empty');
            this.cameraAnchor.fixedToCamera = true;

            this.hud = new Hud(this.game, this);

            this.cursor = this.input.keyboard.createCursorKeys();

            this.world.setBounds(0, 0, 2000, 2000);

            this.npcs = this.game.add.group(this.world, "npcs");

            for (var i = 0; i < 100; i++) {
                var npc = new Game.Npc(this.game, this.world.randomX, this.world.randomY, this);
                this.npcs.add(npc);
                this.mobiles.push(npc);
            }

            //  Stop the following keys from propagating up to the browser
            this.input.keyboard.addKeyCapture([
                Phaser.Keyboard.LEFT,
                Phaser.Keyboard.RIGHT,
                Phaser.Keyboard.UP,
                Phaser.Keyboard.DOWN,
                Phaser.Keyboard.SPACEBAR]);

            var player = new Game.Player(this.game, this.world.centerX, this.world.centerY);
            this.player = player;
            this.mobiles.push(player);

            this.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);
        };

        PhaserGameState.prototype.update = function () {
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

            for (var i in this.mobiles) {
                this.mobiles[i].update();
            }

            this.hud.update();
        };

        PhaserGameState.prototype.render = function () {
            this.hud.render();
            //var text = "Energy: ";
            // var style = { font: "14px Arial", fill: "#ff0044", align: "center" };
            //renderText(text: string, x: number, y: number, color?: string, font?: string): void;
            // this.debug.renderText(text, 10, 10, 'black', '14px Arial');
            //this.game.debug.renderSpriteCorners(this.player.Sprite, false, true);
            //this.game.debug.renderSpriteInfo(this.player.Sprite, 20, 32);
        };
        return PhaserGameState;
    })(Phaser.State);
    Game.PhaserGameState = PhaserGameState;

    var Hud = (function (_super) {
        __extends(Hud, _super);
        function Hud(game, state) {
            _super.call(this, game, game.world, "Hud");

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
        Hud.prototype.update = function () {
        };

        Hud.prototype.render = function () {
            var text = "In Range: " + Phaser.Math.roundTo(this.state.player.inRange).toString();
            this.state.debug.renderText(text, 10, 10, 'black', '14px Arial');

            var text = "Energy: " + Phaser.Math.roundTo(this.state.player.energy, -2).toString();
            this.state.debug.renderText(text, 100, 10, 'black', '14px Arial');
            //this.energyBar.crop.width = this.energyBar.body.width / 10 * this.state.player.energy;
        };
        return Hud;
    })(Phaser.Group);
})(Game || (Game = {}));
///<reference path="phaser/phaser.d.ts"/>
///<reference path="app.ts"/>
var Game;
(function (Game) {
    var Mobile = (function (_super) {
        __extends(Mobile, _super);
        function Mobile(game, x, y, key, frame) {
            _super.call(this, game, x, y, key, frame);

            if (game.state.states[game.state.current] instanceof Game.PhaserGameState) {
                this.state = game.state.states[game.state.current];
            } else {
                console.error("ERROR: state is not of type PhaserGameState");
            }
        }
        Mobile.prototype.update = function () {
        };
        return Mobile;
    })(Phaser.Sprite);
    Game.Mobile = Mobile;

    // TODO: Should be a sprite
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(game, x, y) {
            var _this = this;
            _super.call(this, game, x, y, 'player');
            this.energyPerSec = 1;
            this.inRange = 0;
            this.energy = 10;
            this.body.collideWorldBounds = true;
            this.anchor.setTo(0.5, 0.5);

            this.game.input.mouse.mouseDownCallback = (function (e) {
                return _this.mouseClick(e);
            });
        }
        Player.prototype.mouseClick = function (event) {
            //this.bubbleText("LANG");
        };

        Player.prototype.update = function () {
            this.inRange = this.countInRange();

            var elapsedSec = this.game.time.elapsed / 1000;
            this.gainEnergy(elapsedSec);
        };

        Player.prototype.gainEnergy = function (elapsedSec) {
            var old = this.energy;
            this.energy += elapsedSec * this.energyGainPerSec;
            this.energy = Math.max(0, this.energy);

            if (Math.floor(this.energy) < Math.floor(old)) {
                this.bubbleText("-1");
            }

            if (Math.floor(this.energy) > Math.floor(old)) {
                this.bubbleText("+1");
            }
        };

        Player.prototype.bubbleText = function (msg) {
            var _this = this;
            var body = this.body;

            var text = this.game.add.bitmapText(body.x, body.y - 30, msg, { font: '28px Desyrel', align: 'center' });
            var moveTween = this.game.add.tween(text).to({ y: body.y - 80 }, 1000, Phaser.Easing.Cubic.Out, true);
            var hideTween = this.game.add.tween(text).to({ alpha: 0 }, 200, Phaser.Easing.Quadratic.InOut, true, 500);

            hideTween.onComplete.addOnce(function () {
                _this.game.world.remove(text);
            });
        };

        Object.defineProperty(Player.prototype, "energyGainPerSec", {
            get: function () {
                var optimal = 3;
                var diff = Math.abs(optimal - this.inRange);

                if (diff == 0)
                    return this.energyPerSec;
                else if (diff > 1) {
                    return -this.energyPerSec;
                }
                return 0;
            },
            enumerable: true,
            configurable: true
        });

        Player.prototype.countInRange = function () {
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
        };
        return Player;
    })(Mobile);
    Game.Player = Player;

    var Npc = (function (_super) {
        __extends(Npc, _super);
        function Npc(game, x, y, state) {
            _super.call(this, game, x, y, 'target');
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
        Npc.prototype.buildEmitter = function (sprite) {
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
        };

        Npc.prototype.update = function () {
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
        };

        Npc.prototype.moveTo = function (sprite) {
            if (this.state.physics.distanceBetween(sprite, this.state.player) < 10) {
                sprite.kill();
                return;
            }

            this.state.physics.moveToObject(sprite, this.state.player, 500);
        };
        return Npc;
    })(Mobile);
    Game.Npc = Npc;
})(Game || (Game = {}));
//# sourceMappingURL=final.js.map
