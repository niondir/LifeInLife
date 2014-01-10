///<reference path="phaser/phaser.d.ts"/>
///<reference path="app.ts"/>
///<reference path="Entities.ts"/>
///<reference path="Components.ts"/>

module Game {

    export interface ISystem {

    }

    export class System implements ISystem {
        components:ComponentManager;
        componentMatchType:string;

        constructor(components:ComponentManager) {
            this.components = components;
        }

        getEntities() : Array<IEntity> {
            return this.components.getEntitiesWith(this.componentMatchType);
        }

        update() {
            var matches = this.getEntities();
            for(var i in matches) {
                this.updateComponent(matches[i], matches[i].getComponent(this.componentMatchType));
            }
        }

        updateComponent(entity:IEntity, component:IComponent) {
        }
    }

    export class SpawnSystem extends System {

        constructor(components:ComponentManager) {
            super(components);

            this.componentMatchType = 'Spawn';
            // maybe we want to know what components we want to see to save the check in the update function
        }

        updateComponent(entity:IEntity, component:IComponent) {

        }
    }

}