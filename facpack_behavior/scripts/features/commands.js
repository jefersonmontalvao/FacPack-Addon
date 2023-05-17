// Internal imports
import { Spawn } from "../conf/enumerations.conf"
import { CommandHandler } from "../handlers/command_handler";
import { getOverworld, runMCCommandAtOverworld, BlockLocation } from "../modules/mc_world.utils";
import { parseArrayToString, playSoundToPlayer, sendAdviceToEntity, trimAllWS } from "../modules/system.utils"
import { FactionHandler } from "../handlers/factions_handler";
import { text } from "../conf/lang.conf";
import { tag_templates } from '../conf/advices.texts'
import { FactionHandlerException, OtherExceptions } from "../system/exceptions";
import { DatabaseHandler } from "../handlers/database_handler";
import { getPlayerByName, runMCCommandByEntity, tryToAutocompletePlayerName } from "../modules/player_utils";
import { setMcTimeout } from "../modules/mc_system.utils";

// External Imports
import { world } from '@minecraft/server';

/**
 * Teleports the command sender to spawn.
 * The spawn can bed changed by Spawn from conf/enumerations.conf
 */
class SpawnTeleport extends CommandHandler {
    constructor(prefix = '!') {
        super(prefix, 'lobby');
    }

    commandCallback() {
        // This command is running at overworld.
        runMCCommandAtOverworld(`tp ${this.sender.name} ${Spawn.x} ${Spawn.y} ${Spawn.z}`);
        runMCCommandByEntity(`tellraw @s {"rawtext": [{"text": "§e${text.lobby.teleported}§r"}]}`, this.sender);
        playSoundToPlayer(this.sender, 'success')
    }
}

/**
 * Command for manage factions by players.
 */
class FactionManager extends CommandHandler {
    constructor(prefix = '!') {
        super(prefix, 'fac');
    }

    commandCallback() {
        const subcommand = this.getSubCommand();
        const params = this.getCommandParams(true);
        const db = new DatabaseHandler(this.constructor.name);

        // Run the respective sub command.
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
                        this.sendFactionAdvice(this.sender, text.fac.create_success);
                        playSoundToPlayer(this.sender, 'success');
                    } catch (exc) {
                        /**Do error advices. */
                        if (exc === FactionHandlerException.CantCreateExistingFaction) {
                            this.sendFactionAdvice(this.sender, text.fac.create_fail.exists_fail);
                            playSoundToPlayer(this.sender, 'error');
                        } else if (exc === FactionHandlerException.InvalidFactionId) {
                            this.sendFactionAdvice(this.sender, text.fac.create_fail.id_fail);
                            playSoundToPlayer(this.sender, 'error');
                        }
                    }
                } else {
                    /**Do error advice */
                    this.sendFactionAdvice(this.sender, text.fac.create_fail.has_faction_fail);
                    playSoundToPlayer(this.sender, 'error');
                }
                break;
            case 'delete':
                /**A faction will be deleted only if player is the leader of the faction. */
                if (FactionHandler.playerHasFaction(this.sender)) {
                    // Get player faction instance.
                    const player_faction = FactionHandler.getPlayerFaction(this.sender);
                    this.faction = { id: player_faction.id }

                    if (FactionHandler.isPlayerLeader(this.sender, player_faction)) {
                        try {
                            // Remove the faction base location from database before delete faction.
                            let query = {
                                header: {
                                    type: 'Coordinates',
                                    origin: this.constructor.name
                                },
                                data: {
                                    owner: this.faction.id
                                }
                            };
                            if (db.getData(query).length > 0) {
                                db.removeDataByQuery(query);
                            }

                            // Delete.
                            FactionHandler.deleteFaction(player_faction);

                            // Send a success advice.
                            this.sendFactionAdvice(this.sender, text.fac.delete_success);
                            playSoundToPlayer(this.sender, 'success');

                        } catch {
                            this.sendFactionAdvice(this.sender, text.fac.delete_fail.uncaught_fail);
                            playSoundToPlayer(this.sender, 'error');
                        }
                    } else {
                        this.sendFactionAdvice(this.sender, text.fac.delete_fail.not_leader_fail);
                        playSoundToPlayer(this.sender, 'error');
                    }
                } else {
                    this.sendFactionAdvice(this.sender, text.fac.delete_fail.has_not_faction);
                    playSoundToPlayer(this.sender, 'error');
                }
                break;
            case 'invite':
                // Init few variables.
                this.target = function () {
                    const param = parseArrayToString(params);
                    const targetName = param
                        .replaceAll('"', '')
                        .replaceAll('@', '');
                    return getPlayerByName(tryToAutocompletePlayerName(targetName));
                }();

                // Test if player is has a faction and is the leader of the faction.
                if (FactionHandler.playerHasFaction(this.sender)) {
                    if (FactionHandler.isPlayerLeader(this.sender, FactionHandler.getPlayerFaction(this.sender))) {
                        // Avoid Invite to yourself.
                        if (this.sender.name !== this.target.name) {
                            if (!FactionHandler.playerHasFaction(this.target)) {
                                this.faction = FactionHandler.getPlayerFaction(this.sender);
                                const query = {
                                    header:
                                    {
                                        origin:
                                            this.constructor.name
                                    }, data:
                                    {
                                        secondary:
                                            this.target.name
                                    }
                                }
                                if ((db.getData(query).length === 0)) {
                                    const linkPlayersInstance = db.LinkPlayers(this.sender.name, this.target.name);
                                    db.insertData(linkPlayersInstance);

                                    setMcTimeout(() => {
                                        if (db.getData(linkPlayersInstance.assets).length > 0) {
                                            db.removeDataByInstance(linkPlayersInstance);

                                            // Requester advices.
                                            this.sendFactionAdvice(this.sender, text.fac.invite_refused);
                                            playSoundToPlayer(this.sender, 'info');

                                            // Receiver adivices.
                                            this.sendFactionAdvice(this.target, text.fac.invite_response_timer_expired);
                                            playSoundToPlayer(this.target, 'info');
                                        }
                                    }, 30);

                                    // Do advices to players.
                                    // Requester
                                    this.sendFactionAdvice(this.sender, text.fac.invite_success);
                                    playSoundToPlayer(this.sender, 'success');

                                    // Receiver
                                    this.sendFactionAdvice(this.target, text.fac.invite_receive);
                                    this.sendFactionAdvice(this.target, text.fac.invite_response_timer_start);
                                    playSoundToPlayer(this.target, 'info');
                                } else {
                                    // Target is already in a request.
                                    this.sendFactionAdvice(this.sender, text.fac.invite_fail.busy_target);
                                    playSoundToPlayer(this.sender, 'error');
                                }
                            } else {
                                // Advice, target has faction.
                                this.sendFactionAdvice(this.sender, text.fac.invite_fail.player_has_faction);
                                playSoundToPlayer(this.sender, 'error');
                            }
                        } else {
                            // Advice, can't invite yourself.
                            this.sendFactionAdvice(this.sender, text.fac.invite_fail.inviting_yourself_fail);
                            playSoundToPlayer(this.sender, 'error');
                        }
                    } else {
                        // Advice, you are not leader of a faction.
                        this.sendFactionAdvice(this.sender, text.fac.invite_fail.not_leader_fail);
                        playSoundToPlayer(this.sender, 'error');
                    }
                } else {
                    // Advice, you are not leader of a faction.
                    this.sendFactionAdvice(this.sender, text.fac.invite_fail.not_leader_fail);
                    playSoundToPlayer(this.sender, 'error');
                }
                break;
            case 'accept':
                let query = {
                    header: {
                        type: 'LinkPlayers',
                        origin: this.constructor.name
                    },
                    data: {
                        secondary: this.sender.name
                    }
                }
                let data_set = db.getData(query);

                if (data_set.length === 1) {
                    this.target = getPlayerByName(data_set[0].data.primary);
                    try {
                        let faction = FactionHandler.getPlayerFaction(this.target);
                        db.removeDataByQuery(query);
                        FactionHandler.addMember(this.sender, faction);

                        // Advices
                        // Requester
                        this.sendFactionAdvice(this.sender, text.fac.accept_success.to_member);
                        playSoundToPlayer(this.sender, 'success');
                        // target
                        this.sendFactionAdvice(this.target, text.fac.accept_success.to_leader);
                        playSoundToPlayer(this.target, 'success');
                    } catch (exc) {
                        this.sendFactionAdvice(this.sender, text.fac.accept_fail.uncaught_fail);
                        playSoundToPlayer(this.sender, 'error');
                    }
                } else {
                    // No requests advice
                    this.sendFactionAdvice(this.sender, text.fac.accept_fail.no_invitations);
                    playSoundToPlayer(this.sender, 'error');
                }
                break;
            case 'deny':
                let query_ = {
                    header: {
                        origin: this.constructor.name
                    },
                    data: {
                        secondary: this.sender.name
                    }
                }
                const data_set_ = db.getData(query_);

                if (data_set_.length === 1) {
                    this.target = getPlayerByName(data_set_[0].data.primary);
                    db.removeDataByQuery(data_set_[0]);

                    this.sendFactionAdvice(this.sender, text.fac.deny_success);
                    playSoundToPlayer(this.sender, 'success');

                    this.sendFactionAdvice(this.target, text.fac.invite_refused);
                    playSoundToPlayer(this.target, 'info');
                } else {
                    this.sendFactionAdvice(this.sender, text.fac.deny_fail.no_invitations);
                    playSoundToPlayer(this.sender, 'error');
                }
                break;
            case 'leave':
                if (FactionHandler.playerHasFaction(this.sender)) {
                    this.faction = FactionHandler.getPlayerFaction(this.sender)
                    if (!FactionHandler.isPlayerLeader(this.sender, this.faction)) {
                        FactionHandler.removeMember(this.sender, this.faction);

                        // Success Advice.
                        this.sendFactionAdvice(this.sender, text.fac.leave_success);
                        playSoundToPlayer(this.sender, 'success');
                    } else {
                        // Advice, about deleting faction.
                        this.sendFactionAdvice(this.sender, text.fac.leave_fail.fac_leader);
                        playSoundToPlayer(this.sender, 'info');
                    }
                } else {
                    // Player has not faction advice.
                    this.sendFactionAdvice(this.sender, text.fac.leave_fail.no_faction);
                    playSoundToPlayer(this.sender, 'error');
                }
                break;
            case 'kick':
                this.target = function () {
                    const param = parseArrayToString(params);
                    const targetName = param
                        .replaceAll('"', '')
                        .replaceAll('@', '');
                    return getPlayerByName(tryToAutocompletePlayerName(targetName));
                }();

                if (FactionHandler.playerHasFaction(this.sender)) {
                    this.faction = FactionHandler.getPlayerFaction(this.sender);
                    if (FactionHandler.isPlayerLeader(this.sender, this.faction)) {
                        try {
                            if (FactionHandler.isMemberOf(this.target, this.faction)) {
                                FactionHandler.removeMember(this.target, this.faction);

                                // Advice success players
                                this.sendFactionAdvice(this.sender, text.fac.kick_success.to_leader);
                                playSoundToPlayer(this.sender, 'success');

                                this.sendFactionAdvice(this.target, text.fac.kick_success.to_kicked);
                                playSoundToPlayer(this.target, 'info');

                            } else {
                                // Not member of your faction advice.
                                this.sendFactionAdvice(this.sender, text.fac.kick_fail.not_member);
                                playSoundToPlayer(this.sender, 'error');
                            }
                        } catch {
                            // Offline target.advice
                            this.sendFactionAdvice(this.sender, text.fac.kick_fail.member_offline);
                            playSoundToPlayer(this.sender, 'error');
                        }
                    } else {
                        // Not leader advice.
                        this.sendFactionAdvice(this.sender, text.fac.kick_fail.not_leader);
                        playSoundToPlayer(this.sender, 'error');
                    }
                } else {
                    // Advice sender has no faction.
                    this.sendFactionAdvice(this.sender, text.fac.kick_fail.no_faction);
                    playSoundToPlayer(this.sender, 'error');
                }
                break;
            case 'setbase':
                if (FactionHandler.playerHasFaction(this.sender)) {
                    this.faction = FactionHandler.getPlayerFaction(this.sender);
                    if (FactionHandler.isPlayerLeader(this.sender, this.faction)) {
                        const coordinates_instance = db.Coordinates(this.faction.id, this.sender.location);

                        // Remove the actual base location.
                        let query = {
                            header: {
                                type: 'Coordinates',
                                origin: this.constructor.name
                            },
                            data: {
                                owner: this.faction.id
                            }
                        };
                        if (db.getData(query).length > 0) {
                            db.removeDataByQuery(query);
                        }

                        // Check if player is in overworld.
                        let overworld_dimension = getOverworld();
                        for (let player of overworld_dimension.getPlayers()) {
                            if (player === this.sender) {
                                // Insert the data in db.
                                db.insertData(coordinates_instance);
                            }
                        }

                        if (db.getData(query).length > 0) {
                            // Success Advice.
                            this.sendFactionAdvice(this.sender, text.fac.setbase_success);
                            playSoundToPlayer(this.sender, 'success');
                        } else {
                            // Not in overworld error.
                            this.sendFactionAdvice(this.sender, text.fac.setbase_fail.not_in_overworld);
                            playSoundToPlayer(this.sender, 'error');
                        }

                    } else {
                        // Advice about not leader of the faction.
                        this.sendFactionAdvice(this.sender, text.fac.setbase_fail.not_leader);
                        playSoundToPlayer(this.sender, 'error');
                    }
                } else {
                    // Advice about not participing of a faction.
                    this.sendFactionAdvice(this.sender, text.fac.setbase_fail.no_faction);
                    playSoundToPlayer(this.sender, 'error');
                }
                break;
            case 'base':
                // Check if player has a faction.
                if (FactionHandler.playerHasFaction(this.sender)) {
                    this.faction = FactionHandler.getPlayerFaction(this.sender);

                    // Check if the player faction has a defined base.
                    let query = {
                        header: {
                            type: 'Coordinates',
                            origin: this.constructor.name
                        },
                        data: {
                            owner: this.faction.id
                        }
                    };
                    let coordinates = db.getData(query)
                    if (coordinates.length > 0) {
                        let coordiante = coordinates[0].data.coordinates.split(';');
                        coordiante = coordiante.map((c => {
                            return Number(c);
                        }));

                        let base_location = new BlockLocation(coordiante[0], coordiante[1], coordiante[2]);

                        runMCCommandAtOverworld(`tp "${this.sender.name}" ${base_location.x} ${base_location.y} ${base_location.z}`)

                        playSoundToPlayer(this.sender, 'success');
                        this.sendFactionAdvice(this.sender, text.fac.base_success);
                    } else {
                        // No base defined advice.
                        this.sendFactionAdvice(this.sender, text.fac.base_fail.not_defined)
                        playSoundToPlayer(this.sender, 'error');
                    }
                } else {
                    // Not paticiping of a faction advice.
                    this.sendFactionAdvice(this.sender, text.fac.base_fail.no_faction);
                    playSoundToPlayer(this.sender, 'error');
                }
                break;
            default:
                sendAdviceToEntity(this.sender, text.fac.help);
                playSoundToPlayer(this.sender, 'success');
        }
    }

    /**
     * Send a formated advice to some player.
     *  Target: Player Object.
     *  Text: A string.
     */
    sendFactionAdvice(target__, text) {
        const sender = this.sender.name;
        let target = undefined;
        if (this.target !== undefined) {
            target = this.target !== undefined ? this.target.name : 'undefined';
        }
        const faction = this.faction !== undefined ? this.faction.id : 'undefined';

        let FormatedText = text
            .replaceAll(tag_templates.fac.sender, sender)
            .replaceAll(tag_templates.fac.fac_name, faction);

        if (this.target !== undefined) {
            FormatedText = FormatedText.replaceAll(tag_templates.fac.target, target)
        }

        FormatedText = `[§8${this.constructor.name}§r] ${FormatedText}`;

        sendAdviceToEntity(target__, FormatedText);
    }

    /**
     * Returns the sub-command.
     * example: !faction create -> create
     */
    getSubCommand() {
        return this.full_command.split(' ')[1];
    }

    /**
     * Returns a list of params that was typed after
     * main command or sub-command if param has_sub_cmd
     * is true, the default is false.
     */
    getCommandParams(has_sub_cmd = false) {
        if (has_sub_cmd) {
            return this.full_command.split(' ').slice(2);
        } else {
            return this.full_command.split(' ').slice(1);
        }
    }
}

/**
 * Send a teleport request to some player.
 */
class TeleportAction extends CommandHandler {
    constructor(prefix = '!') {
        super(prefix, ['tpa', 'tpahere', 'tpaccept', 'tpdeny',]);
    }

    commandCallback() {
        // Init few variables.
        const db = new DatabaseHandler(this.constructor.name);

        // Test what the command of choice.
        switch (this.playerCommandRequest) {
            case 'tpa':
                // Init few variables.
                this.target = this.getTargetObject();

                // Check if target is not the sender.
                if (this.target === this.sender) {
                    tpaAdvice(text.tpa.tpa_fail.can_not_teleport_to_yourself, this.sender);
                    playSoundToPlayer(this.sender, 'error'); 
                    break;
                }

                // Check if target is online.
                if (this.target !== undefined) {
                    // Query to check in db if target is not on a request of tpa.
                    const query = {
                        header: {
                            type: 'LinkPlayers',
                            origin: this.constructor.name
                        },
                        data: {
                            secondary: this.target.name
                        }
                    }

                    if (db.getData(query).length === 0) {
                        // Create the request data and insert it on database.
                        const linkPlayers_instance = db.LinkPlayers(this.sender.name, this.target.name);
                        db.insertData(linkPlayers_instance);

                        // Advice sender about created request.
                        tpaAdvice(text.tpa.tpa_success.request_sent, this.sender, {target: this.target.name});
                        playSoundToPlayer(this.sender, 'success');

                        // Advice target about created request.
                        tpaAdvice(text.tpa.tpa_success.request_received, this.target, {sender: this.sender.name});
                        tpaAdvice(text.tpa.tpa_success.request_autorefuse_info, this.target, {sender: this.sender.name});
                        playSoundToPlayer(this.sender, 'info');


                        // Auto refuse after 20 seconds
                        setMcTimeout(() => {
                            if (db.getData(query).length !== 0) {
                                db.removeDataByInstance(linkPlayers_instance);
                                tpaAdvice(text.tpa.tpa_success.request_autorefuse, this.sender);
                                tpaAdvice(text.tpa.tpa_success.request_autorefuse, this.target);
                            }
                        }, 30);
                    } else {
                        // Advice that player is already in a request.
                        tpaAdvice(text.tpa.tpa_fail.target_busy, this.sender);
                        playSoundToPlayer(this.sender, 'error');
                    }
                } else {
                    // Requested player is offline advice.
                    tpaAdvice(text.tpa.tpa_fail.target_offline, this.sender);
                    playSoundToPlayer(this.sender, 'error');
                }
                break;
            case 'tpahere':
                break;
            case 'tpaccept':
                // Init few variables.
                const query = {
                    header: {
                        type: 'LinkPlayers',
                        origin: this.constructor.name
                    },
                    data: {
                        secondary: this.sender.name
                    }
                }

                // Check for requests to the sender player.
                const requestData = db.getData(query);

                if (requestData.length !== 0) {
                    // Remove data from database.
                    db.removeDataByQuery(requestData[0]);
                    
                    // get primary and secondary player value.
                    let sender = getPlayerByName(requestData[0].data.primary);
                    let target = getPlayerByName(requestData[0].data.secondary);

                    // Do teleport
                    runMCCommandByEntity(`tp "${target.name}"`, sender);
                    tpaAdvice(text.tpa.tpa_success.teleported_to_sender, target, {target: sender.name});
                    tpaAdvice(text.tpa.tpa_success.target_teleported, sender, {sender: target.name});
                    playSoundToPlayer(sender, 'success');
                    playSoundToPlayer(target, 'success');
                }
                break;
            case 'tpdeny':
                break;
        }

        function tpaAdvice(broadcast_text, target, args={}) {
            if (args !== undefined) {
                if (args.sender !== undefined) {
                    broadcast_text = broadcast_text.replaceAll(tag_templates.tpa.sender, args.sender);
                } 
                if (args.target !== undefined) {
                    broadcast_text = broadcast_text.replaceAll(tag_templates.tpa.target, args.target);
                }
            }

            runMCCommandByEntity(`tellraw @s {"rawtext": [{"text": "[§9TeleportAction§f] ${broadcast_text}"}]}`, target);
        }
    }

    /**
     * Returns the player target.
     */
    getTargetObject() {
        const typed_target = parseArrayToString(this.full_command.split(' ').slice(1));

        try {
            const target = getPlayerByName(tryToAutocompletePlayerName(typed_target));
            return target;
        } catch {
            return undefined;
        }
    }
}

/**
 * Send a text about using of commands in command list variable.
 */
class CommandsHelper extends CommandHandler {
    constructor(prefix = '!') {
        super(prefix, 'help');
    }

    commandCallback() {
        sendAdviceToEntity(this.sender, text.help);
        playSoundToPlayer(this.sender, 'success');
    }
}

const COMMAND_LIST = [SpawnTeleport, FactionManager, TeleportAction, CommandsHelper]

export { COMMAND_LIST }