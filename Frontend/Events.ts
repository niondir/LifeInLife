module Events {

    export class EventArgs {
        static Empty: EventArgs = new EventArgs();
    }

    export interface EventListener {
        (evt: EventArgs): void;
    }

    export class EventHandler {
        private _events: EventListener[] = [];

        public hasEventListener(listener: EventListener): Boolean {
            var listeners = this._events;
            if (listeners) {
                for (var i = 0, l = listeners.length; i < l; i++) {
                    if (listeners[i] === listener) {
                        return true;
                    }
                }
            }
            return false;
        }

        public addEventListener(listener: EventListener): void {
            // Not sure you absolutely need this test
            if (!this.hasEventListener(listener)) {
                var listeners = this._events;
                if (!listeners) {
                    listeners = this._events = [];
                }
                listeners.push(listener);
            }
        }

        public removeEventListener(listener: EventListener): void {
            var listeners = this._events;
            if (listeners) {
                for (var i = 0, l = listeners.length; i < l; i++) {
                    if (listeners[i] === listener) {
                        listeners.splice(i, 1);
                        break;
                    }
                }
            }
        }

        public invoke(sender = {}, e: EventArgs = EventArgs.Empty): void {
            var listeners = this._events;
            if (listeners) {
                for (var i = 0, l = listeners.length; i < l; i++) {
                    listeners[i].call(sender, e);
                }
            }
        }
    }

}