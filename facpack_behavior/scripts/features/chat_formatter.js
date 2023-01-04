import { FactionHandler } from "../handlers/factions_handler";
import { eventBeforeChat } from "../modules/mc_system.utils";
import { runMCCommandByEntity, getPlayerHierarchy } from "../modules/player_utils";

class ChatFormatter {
    constructor(command_list) {
        this.sender;
        this.message;
        this.tags = {
            member: "§8Member§f",
            builder: "§bBuilder§f",
            admin: "§aAdmin§f",
            owner: "§4Master§f"
        }
        this.message_template = '§8[§9%faction%§8][%tag%§8]§7%sender%§r§8> §7%message%';

        eventBeforeChat(event => {
            if (!this.chatEventIsCommand(event, command_list)) {
                event.cancel = true;
                runMCCommandByEntity(`tellraw @a {"rawtext": [{"text": "${this.formatTemplate(this.message_template)}"}]}`, this.sender);
            }
        });
    }

    chatEventIsCommand(event_, command_list) {
        this.sender = event_.sender;
        this.message = event_.message;

        for (let cmd of command_list) {
            if (cmd === this.message.split(' ')[0]) {
                return true;
            }
        }
        return false;
    }

    formatTemplate(template) {
        let faction = (FactionHandler.playerHasFaction(this.sender) ? FactionHandler.getPlayerFaction(this.sender) : '');
        let tag = this.tags[getPlayerHierarchy(this.sender)];
        let sender = this.sender.name;
        let message = this.message;

        let formated_template = template
            .replace('%faction%', faction)
            .replace('%tag%', tag)
            .replace('%sender%', sender.replaceAll(/§./g, ''))
            .replace('%message%', message)
            .replaceAll('\\', '\\\\')
            .replaceAll('"', '\\"');

        return formated_template;
    }
 
}

export { ChatFormatter };