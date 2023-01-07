/**
 * In this file we can create any translation we want and insert into variable named as the lang id.
 * To change the translation of addon we just need to import the translation to ./lang.conf.js/ and insert
 * the exported translation to variable text there...
 */

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
            not_leader_fail: 'Você não é o lider da facção qual está tentando deletar'
        }
    }
}

export const en_us = {

}