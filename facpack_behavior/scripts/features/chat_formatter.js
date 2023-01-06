import { FactionHandler } from "../handlers/factions_handler";
import { eventBeforeChat } from "../modules/mc_system.utils";
import { runMCCommandByEntity, getPlayerHierarchy } from "../modules/player_utils";

class ChatFormatter {
    constructor(command_list) {
        // Init few variables
        this.sender;
        this.message;
        this.tags = {
            guest: "§eGuest§r",
            member: "§8Member§r",
            builder: "§bBuilder§r",
            admin: "§aAdmin§r",
            owner: "§4Master§r"
        }
        this.message_template = '§8[§9%faction%§8][%tag%§8]§7%sender%§r§8> §7%message%';

        // Initialize an event callback function
        eventBeforeChat(chat => {
            // Set value of few variables.
            this.sender = chat.sender;
            this.message = chat.message;

            if (!this.chatEventIsCommandOfList(command_list)) {
                /**
                 * Cancel the message broadcast and send a formated message by tellraw mc command.
                 */
                chat.cancel = true;
                runMCCommandByEntity(`tellraw @a {"rawtext": [{"text": "${this.formatTemplate(this.message_template)}"}]}`, this.sender);
            }
        });
    }

    /** Tests whether the sent message is a command */
    chatEventIsCommandOfList(command_list) {
        for (let cmd of command_list) {
            if (cmd === this.message.split(' ')[0]) {
                return true;
            }
        }
        return false;
    }

    /**
     * This function formats the message template and
     * returns the formated template.
     */
    formatTemplate(template) {
        // Init few variables.
        let faction = (FactionHandler.playerHasFaction(this.sender) ? FactionHandler.getPlayerFaction(this.sender).id : '');
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