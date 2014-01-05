///<reference path="Events.ts"/>
module Events {

    export class KeyboardHandler {

        moveLeft: Events.EventHandler = new Events.EventHandler();
        moveRight: Events.EventHandler = new Events.EventHandler();
        moveUp: Events.EventHandler = new Events.EventHandler();
        moveDown: Events.EventHandler = new Events.EventHandler();


        constructor() {
            document.onkeydown = (e) => this.keyListener(e);
        }

        keyListener(e) {
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

        }

    }

}