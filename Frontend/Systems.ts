///<reference path="phaser/phaser.d.ts"/>
///<reference path="app.ts"/>
///<reference path="Entities.ts"/>
///<reference path="Components.ts"/>

module Game {

    export interface ISystem {

    }

    export class System<T> implements ISystem {
        components:ComponentManager;
        componentMatchType:string;

        constructor(components:ComponentManager) {
            this.components = components;
        }

        getEntities() : Array<IEntity> {
            return this.components.getEntitiesWith(this.componentMatchType);
        }

        update() {
            var entities = this.getEntities();
            for(var i in entities) {
                this.updateComponent(entities[i], entities[i].getComponent(this.componentMatchType));
            }
        }

        updateComponent(entity:IEntity, component:T) {
        }
    }

    export class SpawnSystem extends System<Spawn> {
        game:Phaser.Game;
        constructor(game:Phaser.Game, components:ComponentManager) {
            super(components);

            this.game = game;
            this.componentMatchType = 'Spawn';
            // maybe we want to know what components we want to see to save the check in the update function
        }

        updateComponent(entity:IEntity, c:Spawn) {
            if (!c.active) return;
            if (c.started != null && this.game.time.elapsedSecondsSince(c.started) > c.spawnDelaySec) {
                console.info("spawn!");
                c.active = false;
            }
        }
    }

}