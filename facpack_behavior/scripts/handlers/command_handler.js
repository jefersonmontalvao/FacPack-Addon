import { eventBeforeChat } from '../modules/mc_system.utils';

class CommandHandler {
    constructor(prefix = '!', id) {
        this.prefix = prefix; // command prefix.
        this.command_id = id; // command identifier
        this.command; // command that was typed by sender
        this.sender; // sender objects. entity type.
        this.full_command; // full command with no formatation

        // run function block when class is a instance
        this.run();
    }

    commandCallback() {
        throw 'undefined callback';
    }

    run() {
        eventBeforeChat(chat_object => {
            if(chat_object.message.startsWith(this.prefix)) {
                this.sender = chat_object.sender; // dommand sender.
                this.full_command = chat_object.message; // full command.
                this.command = chat_object.message.slice(this.prefix.length).split(" ")[0]; // typed command.
                if (this.command === this.command_id) {
                    chat_object.cancel = true; // do not broadcast
                    this.commandCallback();
                }
            }
        })
    }
}

export { CommandHandler };