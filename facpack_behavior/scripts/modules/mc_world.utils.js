import { world, MinecraftDimensionTypes } from '@minecraft/server'

function runMCCommandAtOverworld(cmd) {
    return world.getDimension(MinecraftDimensionTypes.overworld).runCommandAsync(cmd);
}

function runMCCommandAtNether(cmd) {
    return world.getDimension(MinecraftDimensionTypes.nether).runCommandAsync(cmd);
}

function runMCCommandAtEnd(cmd) {
    return world.getDimension(MinecraftDimensionTypes.theEnd).runCommandAsync(cmd);
}

export {runMCCommandAtOverworld, runMCCommandAtNether, runMCCommandAtEnd}