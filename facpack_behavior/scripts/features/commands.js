// Internal imports
import { Spawn } from "../conf/enumarations.conf"
import { CommandHandler } from "../handlers/command_handler";
import { runMCCommandAtOverworld } from "../modules/mc_world.utils";
import { runMCCommandByEntity } from "../modules/player_utils";
import { parseArrayToString, sendAdviceToEntity, trimAllWS } from "../modules/system.utils"
import { FactionHandler } from "../handlers/factions_handler";
import { text } from "../conf/lang.conf";
import { FactionHandlerException } from "../system/exceptions";

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

/**
 * Command for manage factions by players.
 */
class FactionManager extends CommandHandler {
    constructor(prefix = '!') {
        super(prefix, 'faction');
    }

    commandCallback() {
        const subcommand = this.getSubCommand();
        const params = this.getCommandParams();

        switch (subcommand) {
            case 'create':
                /**
                 * Create a faction if player has not a factions, it also apply some rules of
                 * creation name format and do some advices abaut faction creation or errors.
                 */
                if (!FactionHandler.playerHasFaction(this.sender)) {
                    try {
                        /**Trim white spaces of faction name to avoid error on param of scoreboard mc command. */
                        const faction_name = trimAllWS(parseArrayToString(params))
                            .replaceAll('"', ''); 

                        /**Create faction and set the sender as leader by adding "-1" points of this scoreboard. */
                        FactionHandler.createFaction(faction_name, this.sender);

                        /**Do success advice to sender. */
                        sendAdviceToEntity(this.sender, text.fac.create_success, 'success');
                    } catch (exc) {
                        /**Do error advices. */
                        if (exc === FactionHandlerException.CantCreateExistingFaction) {
                            sendAdviceToEntity(this.sender, text.fac.create_fail.exists_fail, 'error');
                        } else if (exc === FactionHandlerException.InvalidFactionId) {
                            sendAdviceToEntity(this.sender, text.fac.create_fail.id_fail, 'error');
                        }
                    }
                } else {
                    /**Do error advice */
                    sendAdviceToEntity(this.sender, text.fac.create_fail.has_faction_fail, 'error');
                }
                break
            case 'delete':
                /**A faction will be deleted only if player is the leader of the faction. */
                if (FactionHandler.playerHasFaction(this.sender)) {
                    // Get player faction instance.
                    const player_faction = FactionHandler.getPlayerFaction(this.sender);

                    if (FactionHandler.isPlayerLeader(this.sender, player_faction)) {
                        try {
                            // Delete.
                            FactionHandler.deleteFaction(player_faction);
                            // Send a success advice.
                            sendAdviceToEntity(this.sender, text.fac.delete_success, 'success');
                        } catch (exc) {
                            sendAdviceToEntity(this.sender, text.fac.delete_fail.uncaught_fail, 'error');
                        }
                    } else {
                        sendAdviceToEntity(this.sender, text.fac.delete_fail.not_leader_fail, 'error');
                    }
                } else {
                    sendAdviceToEntity(this.sender, text.fac.delete_fail.has_not_faction, 'error');
                }
                break
            case 'invite':
                break
            case 'accept':
                break
            case 'deny':
                break
            case 'leave':
                break
        }
    }

    getSubCommand() {
        return this.full_command.split(' ')[1];
    }

    getCommandParams() {
        return this.full_command.split(' ').slice(2);
    }
}

const command_list = [SpawnTeleport, FactionManager]

export { command_list }