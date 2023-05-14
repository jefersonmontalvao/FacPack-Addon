import { eventBeforeChat } from '../modules/mc_system.utils';
import { runMCCommandByEntity } from '../modules/player_utils';
import { playSoundToPlayer } from '../modules/system.utils';
import { tag_templates } from '../conf/advices.texts';
import { text, text } from '../conf/lang.conf';

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
                // Define the initial values of some variables.
                this.playerCommandRequest = chat.message
                    .slice(this.prefix.length)
                    .split(" ")[0];

                this.sender = chat.sender;
                this.full_command = chat.message;
                
                if (typeof this.command_id === 'string') {
                    if (this.playerCommandRequest === this.command_id) {
                        chat.cancel = true; // do not broadcast
                        this.commandCallback();
                    } else {
                        sendNonExistentCommandAdvice();
                    }
                } else if (Array.isArray(this.command_id)) {
                    // Dectect if the callback was called.
                    let runned = false;
                    for (id of this.command_id) {
                        if (this.playerCommandRequest === id) {
                            chat.cancel = true; // do not broadcast
                            this.commandCallback();
                            runned = true;
                            break;
                        }
                    }
                    if (!runned) {
                        sendNonExistentCommandAdvice();
                    }
                }
            }
        })
        
        /**
         * Send an advice about that command do not exists.
         */
        let sender = this.sender;
        function sendNonExistentCommandAdvice() {
            let text_template = text.system.non_existent_command
                .replaceAll(tag_templates.system.player_command_request, sender);

            runMCCommandByEntity(text_template, sender);
            playSoundToPlayer(sender, 'error');
        }
    }
}

export { CommandHandler };