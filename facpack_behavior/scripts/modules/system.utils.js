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
function sendAdviceToEntity(target, message, advice_type) {
    message = message
        .replaceAll('\\', '\\\\')
        .replaceAll('"', '\\"');
    let text_color;

    switch (advice_type) {
        case 'info':
            text_color = '§6';
            return runMCCommandByEntity(`tellraw @s {"rawtext": [{"text": "${text_color}${message}"}]}`, target);
        case 'error':
            text_color = '§c';
            return runMCCommandByEntity(`tellraw @s {"rawtext": [{"text": "${text_color}${message}"}]}`, target);
        case 'success':
            text_color = '§a';
            return runMCCommandByEntity(`tellraw @s {"rawtext": [{"text": "${text_color}${message}"}]}`, target);
        case 'none': 
            text_color = '';
            return runMCCommandByEntity(`tellraw @s {"rawtext": [{"text": "${text_color}${message}"}]}`, target);
        default:
            throw OtherExceptions.InvalidArgument;
    }
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

export { sendAdviceToEntity, trimAllWS, parseArrayToString };