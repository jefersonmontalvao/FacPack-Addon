import { world } from '@minecraft/server';

/**
 * This function adds an Event Before Chat.
 * The callback arg is a functino that will run
 * when the event occour.
 */
function eventBeforeChat(callback) {
    world.events.beforeChat.subscribe(callback);
}

export { eventBeforeChat };