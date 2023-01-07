import { world, MinecraftDimensionTypes, BlockLocation } from "@minecraft/server";

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

export { getEntitiesByTagName };
