class OtherExceptions {
    static InvalidArgument = "the value of the argument is invalid";
}

class FactionHandlerException {
    static PlayerHasNotFaction = "the player does not have a faction";

    static NotMemberError = "the player is not member member of this faction";

    static CantCreateExistingFaction = "you're trying to create an existing faction";

    static InvalidFactionId = "invalid faction id";
}

export { OtherExceptions, FactionHandlerException };