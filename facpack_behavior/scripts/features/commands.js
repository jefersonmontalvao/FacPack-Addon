// Internal imports
import { Spawn } from "../conf/enumarations.conf"
import { CommandHandler } from "../handlers/command_handler";
import { runMCCommandAtOverworld } from "../modules/mc_world.utils";

/**
 * Teleports the command sender to spawn.
 */
class SpawnTeleport extends CommandHandler {
    constructor(prefix = '!') {
        super(prefix, 'spawn');
    }

    commandCallback() {
        runMCCommandAtOverworld(`tp ${this.sender.name} ${Spawn.x} ${Spawn.y} ${Spawn.z}`);
    }
}

const command_list = [SpawnTeleport]

export { command_list }