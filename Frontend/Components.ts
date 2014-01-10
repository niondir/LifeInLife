///<reference path="phaser/phaser.d.ts"/>
///<reference path="app.ts"/>
///<reference path="Mobiles.ts"/>
///<reference path="Entities.ts"/>

module Game {

    export class ComponentManager {
        entities:Array<IEntity> = [];

        // Maybe possible in ES6 ?
        //components:Map<string, Array<IEntity>> = new Map<string, Array<IEntity>>();
        components: { [component: string]: Array<IEntity>; } = { };

        public getEntitiesWith(componentType:string) : Array<IEntity> {
            return this.components[componentType];
        }

        // TODO: our cache will not be accurate, if you add a entity before it has all it's components!
        public register(entity:IEntity) {
            this.entities.push(entity);
            for (var i in entity.components) {
                 var component = <IComponent>entity.components[i];

                if (this.components[component.getType()] == undefined) {
                    this.components[component.getType()] = new Array<IEntity>();
                }
                this.components[component.getType()].push(entity);
            }
        }
    }

    export interface IComponent {
        getType(): string;
    }

    export class Spawn implements IComponent {
        getType():string {
            return 'Spawn';
        }

        started:number;
        spawnDelaySec:number = 0;
        active:boolean = false;

        constructor() {
        }
    }
}