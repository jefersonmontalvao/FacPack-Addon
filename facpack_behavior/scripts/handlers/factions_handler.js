import { world } from "@minecraft/server";

import { FactionHandlerException } from "../system/exceptions";

class FactionHandler {
    static playerHasFaction(player) {
        const participants = world.scoreboard.getParticipants();
        for (let participant of participants) {
            if (participant.getEntity() === player) {
                return true;
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

    static createFaction(faction_name, creator) {
        if (/^[a-zA-Z]([a-zA-Z0-9]|\s){2,15}$/.test(faction_name)) {
            let name_as_list = faction_name.strip().trim().split(' ');
            name_as_list = name_as_list.filter(word => {
                if (word !== '') {
                    return word;
                }
            });
            const formated_name = name_as_list.toString().replaceAll(',', ' ');

            if (!this.doFactionExists(formated_name)) {
                world.scoreboard.addObjective(faction_name, `leader:${creator.name}`)
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

    static isPlayerLeader(player, faction) {
        const scores = faction.getScores();
        const player_score = undefined;

        for (let score of scores) {
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
