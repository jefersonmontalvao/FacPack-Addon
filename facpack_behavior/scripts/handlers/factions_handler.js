import { world } from "@minecraft/server";
import { runMCCommandByEntity } from "../modules/player_utils";
import { trimAllWS } from "../modules/system.utils";
import { FactionHandlerException } from "../system/exceptions";

/** That's the class that controls everything about factions. */
class FactionHandler {
    /**
     * Test if player has a faction.
     */
    static playerHasFaction(player) {
        const factions_list = this.getFactionsList();

        // Check if player is participating of some faction from factions list.
        for (let faction of factions_list) {
            for (let participant of faction.getParticipants()) {
                if (participant.getEntity() === player) {
                    return true;
                }
            }
        }
        return false;
    }

    /** Return the player faction object.*/
    static getPlayerFaction(player) {
        const factions_list = this.getFactionsList();

        for (let faction of factions_list) {
            let faction_scores = faction.getScores();
            for (let faction_score of faction_scores) {
                if (faction_score.participant.getEntity() === player) {
                    return faction;
                }
            }
        }
        throw Error(FactionHandlerException.PlayerHasNotFaction);
    }

    /** Create a faction and set the creator as leader. */
    static createFaction(faction_name, creator) {
        /**Trim all white spaces of faction name. */
        faction_name = trimAllWS(faction_name);

        /**Faction name rules
         * Min Length: 3
         * Max Length: 16
         * Allowed Characters: [A-Za-z], [0-9] and [\s]
         */
        if (/^[a-zA-Z]([a-zA-Z0-9]|\s){2,15}$/.test(faction_name)) {
            /**
             * If faction name do not exists, faction will be created.
             *  Faction Schema
             * scoreboard.id will contain the faction name.
             * scoreboard.displayName will contain a formated string 'leader:%leader-name%'
             */
            if (!this.doFactionExists(faction_name)) {
                // Creating
                world.scoreboard.addObjective(faction_name, `leader:${creator.name}`);
                // Set leader
                runMCCommandByEntity(`scoreboard players set @s "${faction_name}" -1`, creator);
            } else {
                throw FactionHandlerException.CantCreateExistingFaction;
            }
        } else {
            throw FactionHandlerException.InvalidFactionId;
        }
    }

    /** Delete faction */
    static deleteFaction(faction) {
        try {
            world.scoreboard.removeObjective(faction)
        } catch {
            throw FactionHandlerException.FactionDeleteError;
        }
    }

    /** Test if faction exists */
    static doFactionExists(faction_name) {
        // Init few variables
        const factions_list = this.getFactionsList();
        const faction_ids = [];

        for (let faction of factions_list) {
            faction_ids.push(faction.id);
        }
        return faction_ids.includes(faction_name);
    }

    /**
     * Returns true if player is the faction leader.
     */
    static isPlayerLeader(player, faction) {
        /** Init few importante variables. */
        const scores_data = faction.getScores();
        let player_score = undefined;

        for (let score of scores_data) {
            if (score.participant.getEntity() === player) {
                player_score = score.score;
                break;
            }
        }
        if (player_score === undefined) {
            throw Error(FactionHandlerException.NotMemberError)
        } else {
            if (player_score === -1) {
                return true;
            } else {
                return false;
            }
        }
    }

    /**
     * Returns the faction with the respective name.
     */
    static getFactionByName(faction_name) {
        const factions_list = this.getFactionsList();
        let query;


        for (let faction of factions_list) {
            if (faction.id === faction_name) {
                query = faction;
                break;
            }
        }
        if (query !== undefined) {
            return query;
        } else {
            throw FactionHandlerException.FactionDoesNotExists;
        }
    }

    static getFactionsList() {
        const objectives_list = world.scoreboard.getObjectives();

        // Filter all objective that keep the display name pattern.
        const factions_list = objectives_list.filter(objective => {
            const pattern = new RegExp('leader:.+');
            return pattern.test(objective.displayName);
        });
        return factions_list;
    }

    static addMember(player, faction) {
        if (!this.playerHasFaction(player)) {
            runMCCommandByEntity(`scoreboard players set @s "${faction.id}" 1`, player);
        } else {
            throw Error(FactionHandlerException.PlayerHasFaction);
        }
    }

    static removeMember(player, faction) {
        if (this.playerHasFaction(player)) {
            runMCCommandByEntity(`scoreboard players reset @s "${faction.id}"`, player);
        } else {
            throw Error(FactionHandlerException.PlayerHasNotFaction);
        }
    }

    static isMemberOf(player, faction) {
        if (this.playerHasFaction(player)) {
            const playerFaction = this.getPlayerFaction(player);
            if (playerFaction.id === faction.id) {
                return true;
            }
        }
        return false;
    }
}

export { FactionHandler };
