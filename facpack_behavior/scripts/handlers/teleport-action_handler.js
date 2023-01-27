import { tag_templates } from "../conf/advices.texts";
import { runMCCommandByEntity } from "../modules/player_utils";
import { sendAdviceToEntity } from "../modules/system.utils";

class TeleportActionHandler {
    constructor(sender, target) {
        this.sender = sender;
        this.target = target !== undefined ? target : { name: 'undefined' };
    }

    doDefaultTeleport() {
        runMCCommandByEntity(`tp ${this.target.name}`, this.sender);
    }

    doToHereTeleport() {
        runMCCommandByEntity(`tp ${this.sender.name}`, this.target);
    }

    doTeleportActionAdvice(msg_target, msg) {
        const title = '[§8Teleport System§f]';
        const message = msg
            .replaceAll(tag_templates.tpa.sender, this.sender.name)
            .replaceAll(tag_templates.tpa.target, this.target.name);
        const template = title + ' ' + message;
        sendAdviceToEntity(msg_target, template);
    }
}

export { TeleportActionHandler };