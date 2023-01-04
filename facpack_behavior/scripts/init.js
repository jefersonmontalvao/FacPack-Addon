// Internal imports
import { command_list } from './features/commands';
import { ChatFormatter } from './features/chat_formatter';

// Initialize few variables
let banned_from_broadcast_str = [];

/* CommandLine event listener */
for (let cmd of command_list) {
    const executable = new cmd();
    banned_from_broadcast_str.push(executable.prefix + executable.command_id);
}

/* Chat formating system */
const formating_chat = new ChatFormatter(banned_from_broadcast_str);