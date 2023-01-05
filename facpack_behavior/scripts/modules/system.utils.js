import { OtherExceptions } from "../system/exceptions";

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
            text_color = '§f';
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

export { sendAdviceToEntity, trimAllWS };