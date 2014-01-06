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
    var game = new Game.PhaserGame();
};

var Game;
(function (Game) {
    var PhaserGame = (function () {
        function PhaserGame() {
            var state = new PhaserGameState();
            this.game = new Phaser.Game(800, 600, Phaser.CANVAS, 'content', state, true, true); // antialias
        }
        return PhaserGame;
    })();
    Game.PhaserGame = PhaserGame;

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
        };

        PhaserGameState.prototype.create = function () {
            this.cameraAnchor = this.add.sprite(0, 0, 'empty');
            this.cameraAnchor.fixedToCamera = true;

            //{ font: '64px desyrel', align: 'center' }
            this.hud = new Hud(this);

            this.cursor = this.input.keyboard.createCursorKeys();

            this.world.setBounds(0, 0, 2000, 2000);

            this.npcs = new Phaser.Group(this.game, null, "npc's", false);
            for (var i = 0; i < 100; i++) {
                var npc = new Game.Npc(this.world.randomX, this.world.randomY, this);

                //this.npcs.add(npc.Sprite);
                this.mobiles.push(npc);
            }

            //  Stop the following keys from propagating up to the browser
            this.input.keyboard.addKeyCapture([
                Phaser.Keyboard.LEFT,
                Phaser.Keyboard.RIGHT,
                Phaser.Keyboard.UP,
                Phaser.Keyboard.DOWN,
                Phaser.Keyboard.SPACEBAR]);

            var player = new Game.Player(this.world.centerX, this.world.centerY, this);
            this.player = player;
            this.mobiles.push(player);

            this.camera.follow(this.player.Sprite, Phaser.Camera.FOLLOW_PLATFORMER);
        };

        PhaserGameState.prototype.update = function () {
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

    var Hud = (function () {
        function Hud(state) {
            this.state = state;
        }
        Hud.prototype.update = function () {
        };

        Hud.prototype.render = function () {
            var text = "In Range: " + Phaser.Math.roundTo(this.state.player.inRange).toString();
            this.state.debug.renderText(text, 10, 10, 'black', '14px Arial');

            var text = "Energy: " + Phaser.Math.roundTo(this.state.player.energy, -2).toString();
            this.state.debug.renderText(text, 100, 10, 'black', '14px Arial');
        };
        return Hud;
    })();

    var Target = (function (_super) {
        __extends(Target, _super);
        function Target(x, y) {
            this.Graphic = new EndGate.Graphics.Circle(x, y, Target._targetRadius, Target._targetBodyColor);

            _super.call(this, this.Graphic.GetDrawBounds());

            // Make a border around our base graphic
            this.Graphic.Border(5, Target._targetColor);

            // Add a vertical rectangle to the base graphic
            this.Graphic.AddChild(new EndGate.Graphics.Rectangle(0, 0, 5, 40, Target._targetColor));

            // Add a horizontal rectangle to the base graphic
            this.Graphic.AddChild(new EndGate.Graphics.Rectangle(0, 0, 40, 5, Target._targetColor));
        }
        Target.prototype.Collided = function (data) {
            // We cannot collide with other targets because all targets have static positions.  Adding a collidable with a static position to the
            // CollisionManager will optimize collision detection AND prevent other static collidables from colliding with each other.
            // Will remove the target from the collision manager
            this.Dispose();

            // Will remove the target from the scene (will no longer be drawn)
            this.Graphic.Dispose();

            _super.prototype.Collided.call(this, data);
        };
        Target._targetRadius = 30;
        Target._targetColor = EndGate.Graphics.Color.Green;
        Target._targetBodyColor = EndGate.Graphics.Color.Transparent;
        return Target;
    })(EndGate.Collision.Collidable);
})(Game || (Game = {}));
///<reference path="phaser/phaser.d.ts"/>
///<reference path="app.ts"/>
var Game;
(function (Game) {
    var Mobile = (function () {
        function Mobile() {
        }
        Mobile.prototype.update = function () {
        };
        return Mobile;
    })();
    Game.Mobile = Mobile;

    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(x, y, state) {
            var _this = this;
            _super.call(this);
            this.energyPerSec = 1;
            this.inRange = 0;
            this.energy = 10;
            this.Sprite = state.add.sprite(x, y, 'player');
            this.Sprite.body.collideWorldBounds = true;
            this.state = state;

            this.state.input.mouse.mouseDownCallback = (function (e) {
                return _this.mouseClick(e);
            });
        }
        Player.prototype.mouseClick = function (event) {
            //this.bubbleText("LANG");
        };

        Player.prototype.update = function () {
            this.inRange = this.countInRange();

            var elapsedSec = this.state.time.elapsed / 1000;
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
            var body = this.Sprite.body;

            var text = this.state.add.bitmapText(body.x, body.y - 30, msg, { font: '28px Desyrel', align: 'center' });
            var tween = this.state.add.tween(text).to({ y: body.y - 80 }, 1000, Phaser.Easing.Cubic.Out, true);
            this.state.add.tween(text).to({ alpha: 0 }, 200, Phaser.Easing.Quadratic.InOut, true, 500);

            // TODO: Better destroy
            tween.onComplete.addOnce(function () {
                text.visible = false;
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
            var player = this.state.player.Sprite.center;
            var count = 0;
            for (var i in this.state.mobiles) {
                var mob = this.state.mobiles[i].Sprite.center;

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
        function Npc(x, y, state) {
            _super.call(this);
            this.state = state;

            this.Sprite = state.add.sprite(x, y, 'target');
            this.Sprite.body.collideWorldBounds = true;
            this.Sprite.body.velocity.x = this.state.game.rnd.frac() * 100;
            this.Sprite.body.velocity.y = this.state.game.rnd.frac() * 100;
            this.Sprite.body.bounce.setTo(1, 1);

            this.emitterGreen = this.buildEmitter('energy_green');
            this.emitterYellow = this.buildEmitter('energy_yellow');
            this.emitterRed = this.buildEmitter('energy_red');
        }
        Npc.prototype.buildEmitter = function (sprite) {
            var emitter = this.state.add.emitter(this.Sprite.x, this.Sprite.y, 100);
            emitter.gravity = 0;

            //keys: string[], frames: string[], quantity: number, collide: boolean, collideWorldBounds: boolean
            emitter.makeParticles([sprite], [], 2, false, false);
            emitter.x = this.Sprite.x;
            emitter.y = this.Sprite.y;
            emitter.minParticleScale = 2;
            emitter.maxParticleScale = 2;
            emitter.start(false, 2000, 100, 0);
            emitter.on = false;
            return emitter;
        };

        Npc.prototype.update = function () {
            this.emitterRed.x = this.Sprite.x;
            this.emitterRed.y = this.Sprite.y;
            this.emitterYellow.x = this.Sprite.x;
            this.emitterYellow.y = this.Sprite.y;
            this.emitterGreen.x = this.Sprite.x;
            this.emitterGreen.y = this.Sprite.y;

            var inRange = this.state.physics.distanceBetween(this.Sprite, this.state.player.Sprite) < 100;

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
            if (this.state.physics.distanceBetween(sprite, this.state.player.Sprite) < 10) {
                sprite.kill();
                return;
            }

            this.state.physics.moveToObject(sprite, this.state.player.Sprite, 500);
        };
        return Npc;
    })(Mobile);
    Game.Npc = Npc;
})(Game || (Game = {}));
//# sourceMappingURL=final.js.map
