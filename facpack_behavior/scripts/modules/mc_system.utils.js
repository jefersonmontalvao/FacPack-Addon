import { world, system } from '@minecraft/server';

/**
 * This function adds an Event Before Chat.
 * The callback arg is a functino that will run
 * when the event occour.
 */
function eventBeforeChat(callback) {
    world.events.beforeChat.subscribe(callback);
}

/**
 * This function runs a void function
 * when timeout(seconds).
 * It runs only one time.
 */
function setMcTimeout(void_, timeout) {
    timeout = timeout * 20;

    const timer = system.runTimeout(function () {
        void_();
        system.clearRun(timer);
    }, timeout);
}

export { eventBeforeChat, setMcTimeout };