///<reference path="phaser/phaser.d.ts"/>
///<reference path="app.ts"/>
///<reference path="Mobiles.ts"/>
///<reference path="Entities.ts"/>

module Game {

    export class ComponentManager {
        entities:Array<IEntity> = [];
        components:Map<string, Array<IEntity>> = new Map<string, Array<IEntity>>();
       // components: { [component: string]: IEntity; } = { };

        public getEntitiesWith(componentType:string) : Array<IEntity> {
            return this.components[componentType];
        }

        public register(entity:IEntity) {
            this.entities.push(entity);
            for (var i in entity.components) {
                 var component = <IComponent>entity.components[i];
                if (!this.components.has[component.getType()]) {
                    this.components.set(component.getType(), new Array<IEntity>());
                }
                this.components.set[component.getType()].push(entity);
            }
        }
    }

    export interface IComponent {
        getType(): string;
    }

// TODO: Find/Create a Phaser Interface with the usual update/render/etc. functions and implement it
    export class Component implements IComponent {
        game:Phaser.Game;
        getType():string {
            return 'undefined';
        }

        constructor(game:Phaser.Game) {
            this.game = game;
        }

        update(entity:Entity) {
        }
    }

    export class Spawn extends Component {
        getType():string {
            return 'Spawn';
        }

        private onSpawn:Function
        private started:number;

        public spawnDelaySec:number = 0;
        public active:boolean = false;

        constructor(game:Phaser.Game, onSpawn:Function) {
            super(game);
            this.onSpawn = onSpawn;
        }

        public start() {
            this.started = this.game.time.elapsed;
            this.active = true;
        }

        update() {
            if (!this.active) return;
            if (this.started != null && this.game.time.elapsedSecondsSince(this.started) > this.spawnDelaySec) {
                console.info("spawn!");
                this.active = false;
            }
        }
    }
}