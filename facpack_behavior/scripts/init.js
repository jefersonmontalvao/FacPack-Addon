// External imports

// Internal imports
import { COMMAND_LIST } from './features/commands';
import { ChatFormatter } from './features/chat_formatter';

// Initialize few variables.
const banned_from_broadcast_str = [];

/* CommandLine event listener */
for (let cmd of COMMAND_LIST) {
    const executable = new cmd();
    banned_from_broadcast_str.push(executable.prefix + executable.command_id);
}

/* Chat formating system */
const formating_chat = new ChatFormatter(banned_from_broadcast_str);