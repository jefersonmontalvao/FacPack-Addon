// External imports
import { world } from '@minecraft/server';

// Internal imports
import { COMMAND_LIST } from './features/commands';
import { ChatFormatter } from './features/chat_formatter';
import { sendAdviceToEntity } from './modules/system.utils';
import { text } from './conf/lang.conf';

// Initialize few variables.
let worlds_master = undefined;
const banned_from_broadcast_str = [];

// Set world's master value.
if (worlds_master === undefined) {
    worlds_master = world.getAllPlayers()[0];
    sendAdviceToEntity(worlds_master, text.system.worldMasterInfo, 'info');
}

/* CommandLine event listener */
for (let cmd of COMMAND_LIST) {
    const executable = new cmd();
    banned_from_broadcast_str.push(executable.prefix + executable.command_id);
}

/* Chat formating system */
const formating_chat = new ChatFormatter(banned_from_broadcast_str);