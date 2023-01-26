import { world } from "@minecraft/server";
import { getEntitiesByTagName } from "../modules/mc_entity.utils";
import { DatabaseHandlerException } from "../system/exceptions"

/**
 * This class controls a simples database in minecraft.
 * The data will be store in an entity type facpack dummy
 * but to really works, the master needs to use the function
 * facpack/setup.
 */
class DatabaseHandler {
    constructor(origin) {
        // Initialize few variables.
        this.origin = origin;
        this.main_db_tag = '__facpack_schema-manager__';
        this.db = this.getOnlineDb();
    }

    /**
     * Returns true if database is found
     * else returns false.
     */
    isDbOnline() {
        const entities_set = getEntitiesByTagName(this.main_db_tag);
        if (entities_set.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Returns the first dummy entity that the script find using
     * the main database tag, else throws error exception.
     */
    getOnlineDb() {
        if (this.isDbOnline()) {
            return getEntitiesByTagName(this.main_db_tag)[0];
        } else {
            throw DatabaseHandlerException.OfflineDatabase;
        }
    }

    // DB Functions:
    /**
     * Insert data into db.
     */
    insertData(schema_instance) {
        if (this.isDbOnline()) {
            this.db.addTag(JSON.stringify(schema_instance.assets));
        } else {
            throw DatabaseHandlerException.OfflineDatabase;
        }
    }

    /** 
     * Remove a specified Data from db.
     */
    removeDataByInstance(schema_instance) {
        this.db.removeTag(JSON.stringify(schema_instance.assets));
    }

    /**
     * Remove data filtered by a query object
     */
    removeDataByQuery(query) {
        const data_set = this.getData(query);
        for (let data of data_set) {
            this.db.removeTag(JSON.stringify(data));
        }
    }

    /**
     * Get data filtering data interting a query object.
     */
    getData(query) {
        /**Array of json, that is stored in
         * a database entity. */
        const dataSetJson = this.db.getTags()
            .filter(data => {
                if (/^{.*|\n}$/.test(data)) {
                    return data;
                }
            });
        /**Array of objects.
         * This array was a json that become an object.
        */
        const dataObjectSet = dataSetJson.map(data => {
            return JSON.parse(data);
        });

        /**This variable will save the objects that match the query. */
        const match_set = [];

        /**Test all elements of dataSetObject. */
        const query_external_keys = Object.keys(query);
        const sucesses = function () {
            // Calculate the success count.
            let counter = 0;
            for (const query_external_key of query_external_keys) {
                const query_internal_keys = Object.keys(query[query_external_key]);
                counter += query_internal_keys.length;
            }
            return counter;
        } ();
        
        for (const dataObject of dataObjectSet) {
            let failures = 0;

            for (const query_external_key of query_external_keys ) {
                /**data object of this respective external key. */
                const respective_object = dataObject[query_external_key];
                /**query object of this respective external key. */
                const respective_query = query[query_external_key];
                if (respective_object !== undefined) {
                    const query_internal_keys = Object.keys(query[query_external_key]);
                    for (const query_internal_key of query_internal_keys) {
                        if (respective_object[query_internal_key] !== respective_query[query_internal_key]) {
                            failures += 1;
                            break;
                        }
                    }
                } else {
                    failures += 1
                    break;
                }
                // If Fail, stops this object matching and go to next.
                if (failures > 0) {
                    break;
                }
            }
            if (failures === 0) {
                // Save in match set if everything matches.
                match_set.push(dataObject);
            }
        }
        return match_set;
    }

    // DB Schemas:
    /**
    * Database schema that links two players.
    * returns data.
    */
    LinkPlayers(player1, player2) {
        class LinkPlayers {
            constructor(player1, player2, origin) {
                // Assets are used to be the data. It will be inserted into database.
                this.assets = {
                    header: {
                        type: this.constructor.name,
                        origin: origin
                    },
                    data: {
                        primary: player1,
                        secondary: player2
                    }
                };
            }
        }
        const link_instance = new LinkPlayers(player1, player2, this.origin);
        return link_instance;
    }

    /**
     * Database schema that save a coordinate and set owner.
     * returns data.
     */
    Coordinates(owner, mcBlockLocation) {
        class Coordinates {
            constructor(owner, mcBlockLocation, origin) {
                this.assets = {
                    header: {
                        type: this.constructor.name,
                        origin: origin
                    },
                    data: {
                        owner: owner,
                        coordinates: `${mcBlockLocation.x};${mcBlockLocation.y};${mcBlockLocation.z}`
                    }
                };
            }
        }
        
        const coordinates_instance = new Coordinates(owner, mcBlockLocation, this.origin);
        return coordinates_instance;
    }
}

export { DatabaseHandler };