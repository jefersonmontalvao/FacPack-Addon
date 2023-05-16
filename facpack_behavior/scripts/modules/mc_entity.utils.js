import { world, MinecraftDimensionTypes } from "@minecraft/server";

/** 
 * Get entity by tag name.
 * Return entity object array.
 * Entity needs to be rendered.
 */
function getEntitiesByTagName(tag) {
    const overworld = world.getDimension(MinecraftDimensionTypes.overworld);
    const entities = Array.from(overworld.getEntities());

    const query = entities.filter(entity => {
        if (entity.hasTag(tag)) {
            return entity;
        }
    })
    return query;
}

/**
 * Test if entity has a specified tag.
 */
function entityHasTag(entity, tag) {
    return entity.hasTag(tag);
}

/**
 * Kill an entity.
 */
function killEntity(entity) {
    entity.kill();
}

export { getEntitiesByTagName, entityHasTag, killEntity };
