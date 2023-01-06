import { eventBeforeChat } from '../modules/mc_system.utils';

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

        this.command; // command that was typed by sender.
        this.sender;
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
                this.command = chat.message
                    .slice(this.prefix.length)
                    .split(" ")[0];

                this.sender = chat.sender;
                this.full_command = chat.message;
                
                if (this.command === this.command_id) {
                    chat.cancel = true; // do not broadcast
                    this.commandCallback();
                }
            }
        })
    }
}

export { CommandHandler };