import { world } from "@minecraft/server";
import { runMCCommandByEntity } from "../modules/player_utils";
import { trimAllWS } from "../modules/system.utils";

import { FactionHandlerException } from "../system/exceptions";

class FactionHandler {
    static playerHasFaction(player) {
        const factions_list = this.getFactionsList();
        for (let faction of factions_list) {
            for (let participant of faction.getParticipants()) {
                if (participant.getEntity() === player) {
                    return true;
                }
            }
        }
        return false;
    }
    
    static getPlayerFaction(player) {
        try {
            const factions = this.getFactionsList();
            for (let faction of factions) {
                for (let score of faction.getScores()) {
                    if (score.participant.getEntity() === player) {
                        return faction;
                    }
                }
            }
            throw FactionHandlerException.PlayerHasNotFaction;
        } catch(exc) {
            return undefined;
        }
    }

    /**Create a faction and set the creator as leader. */
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

    static deleteFaction(faction) {
        world.scoreboard.removeObjective(faction)
    }

    static doFactionExists(faction_name) {
        const factions = this.getFactionsList();
        let fac_identifiers = [];
        for (let faction of factions) {
            fac_identifiers.push(faction.id);
        }
        return fac_identifiers.includes(faction_name);
    }

    /**
     * Returns true if player is the faction leader.
     */
    static isPlayerLeader(player, faction) {
        /**Init few importante variables. */
        const scores_data = faction.getScores();
        let player_score = undefined;

        for (let score of scores_data) {
            if (score.participant.getEntity() === player) {
                player_score = score.score;
                break;
            }
        }
        if (player_score === undefined) {
            throw FactionHandlerException.NotMemberError
        } else {
            if (player_score === -1) {
                return true;
            } else {
                return false;
            }
        }
    }

    static getFactionByName(faction_name) {
        const factions = this.getFactionsList();
        let query;
        for (let faction of factions) {
            if (faction.id === faction_name) {
                query = faction;
                break;
            }
        }
        return query;
    }

    static getFactionsList() {
        const objectives = world.scoreboard.getObjectives(); // Return a list of objetives
        const factions = objectives.filter(objective => {
            const fac_display_pattern = new RegExp('leader:.+');
            return fac_display_pattern.test(objective.displayName);
        });
        return factions;
    }
}

export { FactionHandler }
