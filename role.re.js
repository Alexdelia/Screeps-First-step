var roleBu = require('role.bu');

module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        
        var canFillTower = true
        
        // if creep is trying to complete a constructionSite but has no energy left
        if (creep.memory.working == true && creep.carry.energy == 0) {
            // switch state
            creep.memory.working = false;
            creep.say('🔄')
        }
        // if creep is harvesting energy but is full
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            // switch state
            creep.memory.working = true;
            creep.say('🔧')
        }

         // if creep is supposed to repair something
        if (creep.memory.working == true) {
            // find closest structure with less than max hits
            // Exclude walls because they have way too many max hits and would keep
            // our repairers busy forever. We have to find a solution for that later.
            var structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                // the second argument for findClosestByPath is an object which takes
                // a property called filter which can be a function
                // we use the arrow operator to define it
                filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL
            });
            // if we find one
            var towerNotFill = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            // find only tower
            filter: (s) => (s.structureType == STRUCTURE_TOWER) && s.energy < s.energyCapacity});
            
            if (towerNotFill != undefined && canFillTower == true) {
                creep.say('🕋')
                // try to transfer energy, if it is not in range
                if (creep.transfer(towerNotFill, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(towerNotFill);
                }
            }
            
            if (structure != undefined) {
                // try to repair it, if it is out of range
                if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(structure, {visualizePathStyle: {stroke: '#ffc300'}});
                }
            }
            
            // if we can't fine one
            else {
                // look for construction sites
                roleBu.run(creep);
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            // find closest source
            var dropSource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
            let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 500
            });
            var bank = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
               filter: (s) => (s.structureType == STRUCTURE_STORAGE) 
            });
            var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            
            if(dropSource != undefined) {
                if(creep.pickup(dropSource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(dropSource, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if (container != undefined) {
                if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards the source
                    creep.moveTo(container, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if (bank != undefined) {
                if (creep.withdraw(bank, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards the source
                    creep.moveTo(bank, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if (source != undefined) {
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    // move towards the source
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
    }
};