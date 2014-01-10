///<reference path="phaser/phaser.d.ts"/>
///<reference path="app.ts"/>
///<reference path="Mobiles.ts"/>
///<reference path="Components.ts"/>

module Game {

    export interface IEntity {
        components:Array<IComponent>;
        addComponent(component:IComponent);
        getComponent(componentType:string);
    }

    export class Entity {
        public components:Array<IComponent> = [];

        // TODO: ref by id instead of just pointers

        public addComponent(component:IComponent) {
            this.components.push(component);
        }

        public getComponent(componentType:string) {
            for (var i in this.components) {
                var component = this.components[i];
                if (componentType == component.getType()) {
                    return component;
                }
            }
        }
    }

    export class SpawnerEntity extends Entity {

        constructor(spawn:Spawn) {
            super();
            this.addComponent(spawn);
        }
    }

}