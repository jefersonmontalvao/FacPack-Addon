import { world } from '@minecraft/server'

function eventBeforeChat(callback) {
    world.events.beforeChat.subscribe(callback);
}

export { eventBeforeChat }