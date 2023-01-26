import { world } from '@minecraft/server';
import { OtherExceptions } from '../system/exceptions';

/**
 * This function retuns if player has some tag as
 * __admin__ or __owner__, and return the hierachy
 * using a string.
 */
function getPlayerHierarchy(player) {
    if (playerHasTag(player, '__builder__')) {
        return 'builder';
    } else if (playerHasTag(player, '__admin__')) {
        return 'admin';
    } else if (playerHasTag(player, '__owner__')) {
        return 'owner';
    } else if (playerHasTag(player, '__member__')) {
        return 'member';
    } else {
        return 'guest';
    }
}

/**
 * Test if player has some specific tag.
 */
function playerHasTag(player, tag) {
    return player.hasTag(tag)
}

/**
 * Run a command by an entity object.
 * Returns the number of sucessfull executions.
 */
function runMCCommandByEntity(cmd, entity) {
    return entity.runCommandAsync(cmd);
}

function tryToAutocompletePlayerName(name) {
    const namePattern = new RegExp(name, 'i');
    const match = world.getAllPlayers().filter(player => {
        if (namePattern.test(player.name)) {
            return player.name;
        }
    });
    
    if (match.length === 1) {
        return match[0].name;
    } else {
        return name;
    }
}

/**
 * Returns player object if online.
 */
function getPlayerByName(name) {
    const onlinePlayers = world.getAllPlayers();
    for (let player of onlinePlayers) {
        if (player.name === name) {
            return player;
        }
    }
    throw Error(OtherExceptions.OfflinePlayer);

}

export { getPlayerHierarchy, playerHasTag, runMCCommandByEntity, getPlayerByName, tryToAutocompletePlayerName }