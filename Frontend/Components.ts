///<reference path="phaser/phaser.d.ts"/>
///<reference path="app.ts"/>
///<reference path="Mobiles.ts"/>
///<reference path="Entities.ts"/>

module Game {

    export class ComponentManager {
        entities:Array<IEntity> = [];

        // Maybe possible in ES6 ?
        //components:Map<string, Array<IEntity>> = new Map<string, Array<IEntity>>();
        components:{ [component: string]: Array<IEntity>
        } = { };

        public getEntitiesWith(componentType:string):Array<IEntity> {
            return this.components[componentType];
        }

        // TODO: our cache will not be accurate, if you add a entity before it has all it's components!
        public register(entity:IEntity) {
            this.entities.push(entity);
            for (var i in entity.components) {
                if (!entity.components.hasOwnProperty(i)) continue;
                var component = <IComponent>entity.components[i];

                if (this.components[component.getType()] == undefined) {
                    this.components[component.getType()] = [];
                }
                this.components[component.getType()].push(entity);
            }
        }
    }

    export interface IComponent {
        getType(): string;
    }

    export class Component implements IComponent {
      //  public static type:string = 'none';

        getType():string {
            return 'none';
        }
    }

    export class Spawn extends Component {
        public static type:string = 'Spawn';

        getType():string {
            return 'Spawn';
        }

        started:number;
        spawnDelaySec:number = 0;
        active:boolean = false;

        constructor() {
            super();
        }
    }

    export class Sprite extends Component {
        public static type:string = 'Sprite';

        sprite:Phaser.Sprite;

        constructor(sprite:Phaser.Sprite) {
            super();
            this.sprite = sprite;
        }

        getType():string {
            return 'Sprite';
        }

    }


    export class NeighbourCount extends Component {
        public static type:string = 'NeighbourCount';

        lookupGroups:Array<Phaser.Group> = [];

        constructor(group:Phaser.Group) {
            super();
            this.lookupGroups.push(group);
        }

        getType():string {
            return 'NeighbourCount';
        }



        count:number;
    }
}