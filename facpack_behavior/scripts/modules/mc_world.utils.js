import { world, MinecraftDimensionTypes } from '@minecraft/server';

/**
 * Run a command using overworld object.
 * The overworld starts at coordinate 0 0 0.
 */
function runMCCommandAtOverworld(cmd) {
    return world.getDimension(MinecraftDimensionTypes.overworld).runCommandAsync(cmd);
}

/**
 * Run a command by nether dimesion.
 */
function runMCCommandAtNether(cmd) {
    return world.getDimension(MinecraftDimensionTypes.nether).runCommandAsync(cmd);
}

/**
 * Run a command by theend dimension.
 */
function runMCCommandAtEnd(cmd) {
    return world.getDimension(MinecraftDimensionTypes.theEnd).runCommandAsync(cmd);
}

export { runMCCommandAtOverworld, runMCCommandAtNether, runMCCommandAtEnd };