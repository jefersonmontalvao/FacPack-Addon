/**
 * In this file we can create any translation we want and insert into variable named as the lang id.
 * To change the translation of addon we just need to import the translation to ./lang.conf.js/ and insert
 * the exported translation to variable text there...
 */

// Templates
export const tag_templates = {
    fac: {
        fac_name: '%fac_name%',
        sender: '%sender%',
        target: '%target%'
    }
}

// Languages
export const pt_br = {
    system: {
        worldMasterInfo: 'Você foi definido como mestre do mundo.'
    },
    fac: {
        create_success: 'Criado com sucesso!',
        create_fail: {
            id_fail: 'Não foi possível criar sua facção. Tente novamente, lembre-se que o nome da facção precisa ter de 3 a 16 caracteres e só pode conter letras, números e espaços.',
            exists_fail: 'A facção que você está tentando criar já existe.',
            has_faction_fail: 'Você atualmente já participa de uma facção.'
        },
        delete_success: 'Facção apagada com sucesso.',
        delete_fail: {
            uncaught_fail: 'Não foi possível deletar a facção.',
            has_not_faction: 'Você não têm uma facção.',
            not_leader_fail: 'Você não é o lider da facção qual está tentando deletar.'
        },
        invite_success: 'Você convidou %target% para sua facção.',
        invite_fail: {
            player_has_faction: 'O jogador(a) já possui uma facção.',
            not_leader_fail: 'Você não é lider de uma facção. Convites só podem ser feitos por líderes.',
            inviting_yourself_fail: 'Você não pode convidar a sí mesmo.',
            busy_target: 'O jogador não pode aceitar o convite no momento, pois já está sob outra solicitação.'
        },
        invite_receive: 'Você recebeu um convite para entrar na facção §7%fac_name%§r, digite !fac accept para aceitar, ou !fac deny para recusar.',
        invite_response_timer_start: 'Você tem 30 segundos para dar sua resposta.',
        invite_response_timer_expired: 'O tempo de resposta terminou, a o convite foi recusado automaticamente.',
        invite_refused: 'O convite foi recusado.',
        accept_success: {
            to_member: 'Você acaba de entrar na facção %fac_name%.',
            to_leader: 'O jogador(a) %sender% acaba de entrar no seu clã.'
        },
        accept_fail: {
            uncaught_fail: 'Não foi possível entrar na facção.',
            no_invitations: 'Você não foi convidado pra nenhuma facção.'
        },
        deny_success: 'O convite foi recusado.',
        deny_fail: {
            no_invitations: 'Não há solicitações para recusar.'
        },
        leave_success: 'Você saiu da facção %fac_name%.',
        leave_fail: {
            no_faction: 'Você não está em nenhuma facção.',
            fac_leader: 'Você atualmente é lider de uma facção, experimente o comando !fac delete para apagar sua facção.'
        },
        kick_success: {
            to_leader: 'Você expulsou %target% da facção.',
            to_kicked: 'Você foi expulso da facção %fac_name%, pelo lider %sender%.'
        },
        kick_fail: {
            member_offline: 'O jogador qual você está tentando expulsar está offline.',
            not_member: 'O jogador %target% não está em sua facção.',
            not_leader: 'Você não têm permissão para expulsar o jogador %target% pois você não é o lider do clã.',
            no_faction: 'Você não está participando de uma facção'
        },
        setbase_success: 'A localização da base da facção foi definida com sucesso.',
        setbase_fail: {
            no_faction: 'Você não está participando de uma facção.',
            not_leader: 'Apenas o lider pode definir a localização da base do clã',
            not_in_overworld: 'Você precisa estar no overworld para marcar a localização da base de sua faction.'
        },
        base_success: 'Você foi teleportado para a base de sua faction.',
        base_fail: {
            no_faction: 'Você não está participando de nenhuma faction.',
            not_defined: 'Sua facção não definiu uma base ainda.'
        }
        ,
        help: `FactionManager Help:
          !fac create <nome> - Cria uma facção.
          !fac delete - Apagar uma facção.
          !fac invite <jogador> - Convida um jogador para a facção.
          !fac accept - Aceita um convite de facção.
          !fac deny - Recusa um convite de facção.
          !fac leave - Deserta uma facção.
          !fac kick <jogador>  - Expulsa alguém de uma facção.
          !fac setbase - Define a localização atual como base da facção.
          !fac base - Teleporta você para a localização da base.`
    }
}

export const en_us = {

}