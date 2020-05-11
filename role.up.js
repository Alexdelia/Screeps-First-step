module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        // if creep is bringing energy to the controller but has no energy left
        if (creep.memory.working == true && creep.carry.energy == 0) {
            // switch state
            creep.memory.working = false;
            creep.say('🔄')
        }
        // if creep is harvesting energy but is full
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            // switch state
            creep.memory.working = true;
        }
        
        // if creep is supposed to transfer energy to the controller
        if (creep.memory.working == true) {
            creep.say('⚡')
            // instead of upgraderController we could also use:
            // if (creep.transfer(creep.room.controller, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            
            // try to upgrade the controller
            if (creep.upgradeController(Game.getObjectById('5bbcab839099fc012e633aaa')) == ERR_NOT_IN_RANGE) {
                // if not in range, move towards the controller
                creep.moveTo(Game.getObjectById('5bbcab839099fc012e633aaa'), {visualizePathStyle: {stroke: '#15ff00'}});
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            var dropSource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
            var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
            });
            let containerV = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s => s.structureType == STRUCTURE_CONTAINER
            });
            
            if (dropSource != undefined) {
                if(creep.pickup(dropSource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(dropSource, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if (container != undefined) {
                if (creep.withdraw(container,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards the source
                    creep.moveTo(container, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if (source != undefined) {
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    // move towards the source
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if (creep.withdraw(containerV, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                // move towards the source
                creep.moveTo(containerV, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    }
};