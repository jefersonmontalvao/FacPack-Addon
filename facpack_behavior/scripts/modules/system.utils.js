import { OtherExceptions } from "../system/exceptions";
import { runMCCommandByEntity } from "./player_utils";

/**
 * An easy way to use tellraw to send a message to some player.
 * This function avoid errors by special characters in the text.
 * Advice Types:
 * info -> §6
 * error -> §c
 * success -> §a
 * none -> default chat color.
 */
function sendAdviceToEntity(target, message) {
    message = message
        .replaceAll('\\', '\\\\')
        .replaceAll('"', '\\"');
        
    runMCCommandByEntity(`tellraw @s {"rawtext": [{"text": "${message}"}]}`, target);
}

/**
 * Trim all whites spaces in a text.
 * Example: " Hello  World " -> "Hello World"
 */
function trimAllWS(text) {
    let text_as_list = text.trim().split(' ');
    let filtered_list = text_as_list.filter(word => {
        if (word !== '') {
            return word;
        }
    });
    let formated_text = '';
    filtered_list.forEach(word => {
        formated_text += word + ' ';
    });
    return formated_text.trim();
}

/**
 * This function make a text from a array of strings.
 * It will make join white spaces between elements of array.
 * Return a string formated.
 */
function parseArrayToString(array) {
    let arrayAsString = array[0];
    array.slice(1).forEach(element => {
        arrayAsString += ' ' + element.toString();
    });
    return arrayAsString;
}

/**
 * Play a sound to player.
 */
function playSoundToPlayer(target, soundType = undefined, soundPath = undefined) {
    switch (soundType) {
        case 'info':
            runMCCommandByEntity('playsound mob.witch.death @s ~ ~ ~ 1', target);
            break;
        case 'error':
            runMCCommandByEntity('playsound note.bass @s ~ ~ ~ 1', target);
            break;
        case 'success':
            runMCCommandByEntity('playsound note.pling @s ~ ~ ~ 1', target);
            break;
        case undefined:
            if (soundPath !== undefined) {
                runMCCommandByEntity(`playsound ${soundPath} @s ~ ~ ~ 1`, target);
            } else {
                throw Error(OtherExceptions.InvalidArgument);
            }
            break;
        default:
            throw Error(OtherExceptions.InvalidArgument);
    }
}

export { sendAdviceToEntity, trimAllWS, parseArrayToString, playSoundToPlayer };