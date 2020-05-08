module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        
        // if no constructionSite is found
        var towerNotFill = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            // find only tower
            filter: (s) => (s.structureType == STRUCTURE_TOWER) && s.energy < s.energyCapacity});
            
        // if creep is bringing energy to the spawn but has no energy left
        if (creep.memory.working == true && creep.store[RESOURCE_ENERGY] == 0) {
            // switch state
            creep.memory.working = false;
            creep.say('📥')
        }
        // if creep is harvesting energy but is full
        else if (creep.memory.working == false && creep.store.getFreeCapacity() == 0) {
            // switch state
            creep.memory.working = true;
            creep.say('📤');
        }
                // if creep is supposed to transfer energy to the spawn or an extension
        if (creep.memory.working == true) {
            // find closest spawn or extension which is not full
            var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                // the second argument for findClosestByPath is an object which takes
                // a property called filter which can be a function
                // we use the arrow operator to define it
                filter: (s) => (s.structureType == STRUCTURE_SPAWN
                             || s.structureType == STRUCTURE_EXTENSION)
                             && s.energy < s.energyCapacity
            });
            // if we found one
            if (structure != undefined) {
                // try to transfer energy, if it is not in range
                if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(structure);
                }
            }
            else if (towerNotFill != undefined) {
                creep.say('🕋')
                // try to transfer energy, if it is not in range
                if (creep.transfer(towerNotFill, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(towerNotFill);
                }
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            // find closest source
            var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            // try to harvest energy, if the source is not in range
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                // move towards the source
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    }
};