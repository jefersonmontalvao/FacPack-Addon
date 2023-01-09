/** 
 * Exceptions for uncaught errors.
 */
class OtherExceptions {
    static InvalidArgument = "the value of the argument is invalid";
}

/**
 * Exceptions for factions handler.
 */
class FactionHandlerException {
    static PlayerHasNotFaction = "the player does not have a faction";

    static NotMemberError = "the player is not member member of this faction";

    static CantCreateExistingFaction = "you're trying to create an existing faction";

    static InvalidFactionId = "invalid faction id";

    static FactionDeleteError = "error to delete faction";

    static FactionDoesNotExists = "the faction does not exists";
}

class DatabaseHandlerException {
    static OfflineDatabase = "no database online";
}

export { OtherExceptions, FactionHandlerException, DatabaseHandlerException };