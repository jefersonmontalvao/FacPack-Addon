import { eventBeforeChat } from '../modules/mc_system.utils';
import { runMCCommandByEntity } from '../modules/player_utils';
import { playSoundToPlayer } from '../modules/system.utils';
import { tag_templates } from '../conf/advices.texts';
import { text } from '../conf/lang.conf';
import { COMMAND_LIST } from '../features/commands';
import { entityHasTag } from '../modules/mc_entity.utils';

/**
 * Thats the class that controls everything about 
 * addon commands. Needs to be inherited by a specific command
 * class.
 */
class CommandHandler {
    constructor(prefix = '!', id) {
        // Init few variables.
        this.prefix = prefix;
        this.command_id = id;

        this.playerCommandRequest; // command that was typed by sender.
        this.sender;
        this.target;
        this.full_command;

        this.execute();
    }

    /**
     * This function is used to be subscribed to execute this block
     * by execute function.
     */
    commandCallback() {
        throw 'undefined callback';
    }

    /**
     * This function run callback function if command id is typed by user.
     */
    execute() {
        eventBeforeChat(chat => {
            // Check if prefix was typed.
            if (chat.message.startsWith(this.prefix)) {
                chat.cancel = true; // do not broadcast the command in the chat.

                // Define the initial values of some variables.
                this.playerCommandRequest = chat.message
                    .slice(this.prefix.length)
                    .split(" ")[0];

                this.sender = chat.sender;
                this.full_command = chat.message;
                const ExecutedSignal = '__CommandExecutedSignal__';
                

                if (typeof this.command_id === 'string') {
                    if (this.playerCommandRequest === this.command_id) {
                        this.sender.addTag(ExecutedSignal); // Add a executed signal tag to player. This tag is temp.
                        this.commandCallback(); // Run the command function.
                    } else {
                        if (this.constructor.name === COMMAND_LIST[COMMAND_LIST.length - 1].name) {
                            if (!entityHasTag(this.sender, ExecutedSignal)) {
                                sendNonExistentCommandAdvice(this.sender, this.playerCommandRequest);
                            } else {
                                this.sender.removeTag(ExecutedSignal);// Remove the temp executed signal tag.
                            }
                        }
                    }
                } else if (Array.isArray(this.command_id)) {
                    // Dectect if the callback was called.
                    let runned = false;
                    for (let id of this.command_id) {
                        if (this.playerCommandRequest === id) {
                            this.sender.addTag(ExecutedSignal); // Add a executed signal tag to player. This tag is temp.
                            this.commandCallback(); // Run the command function.
                            runned = true;
                            break;
                        }
                    }
                    if (!runned && this.constructor.name === COMMAND_LIST[COMMAND_LIST.length - 1].name) {
                        if (!entityHasTag(this.sender, ExecutedSignal)) {
                            sendNonExistentCommandAdvice(this.sender, this.playerCommandRequest);
                        } else {
                            this.sender.removeTag(ExecutedSignal);// Remove the temp executed signal tag.
                        }
                    }
                }
            }
        })
        
        /**
         * Send an advice about that command do not exists.
         */
        function sendNonExistentCommandAdvice(sender, requested_command) {
            let text_template = text.system.non_existent_command
                .replaceAll(tag_templates.system.player_command_request, requested_command);

            runMCCommandByEntity(`tellraw @s {"rawtext": [{"text": "§c${text_template}§r"}]}`, sender);
            playSoundToPlayer(sender, 'error');
        }
    }
}

export { CommandHandler };