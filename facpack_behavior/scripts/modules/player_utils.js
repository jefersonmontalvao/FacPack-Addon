function getPlayerHierarchy(player) {
    if (playerHasTag(player, '__builder__')) {
        return 'builder';
    } else if (playerHasTag(player, '__admin__')) {
        return 'admin';
    } else if (playerHasTag(player, '__owner__')) {
        return 'owner';
    } else {
        return 'member';
    }
}

function playerHasTag(player, tag) {
    return player.hasTag(tag)
}

function runMCCommandByEntity(cmd, entity) {
    return entity.runCommandAsync(cmd);
}

export { getPlayerHierarchy, playerHasTag, runMCCommandByEntity }