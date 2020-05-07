module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        // if creep is bringing energy to the spawn but has no energy left
        if (creep.memory.working == true && creep.store[RESOURCE_ENERGY] == 0) {
            // switch state
            creep.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (creep.memory.working == false && creep.store.getFreeCapacity() == 0) {
            // switch state
            creep.memory.working = true;
        }
                // if creep is supposed to transfer energy to the spawn or an extension
        if (creep.memory.working == true) {
            creep.say('📤🌏');
            // find closest spawn or extension which is not full
            var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                // the second argument for findClosestByPath is an object which takes
                // a property called filter which can be a function
                // we use the arrow operator to define it
                filter: (s) => (s.structureType == STRUCTURE_SPAWN
                             || s.structureType == STRUCTURE_EXTENSION
                             || s.structureType == STRUCTURE_TOWER)
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
        }
        // if creep is supposed to harvest energy from source
        else {
            creep.say('📥🌏')
            
            var diSource1 = Game.getObjectById('5bbcab839099fc012e633aa5')
            
            if (creep.harvest.diSource1(diSource == ERR_NOT_IN_RANGE)) {
                // if not in range, move towards the distant source
                creep.moveTo(diSource1, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    }
};