var roleUp = require('role.up');

module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        
        var canFillTower = false
        
        // if target is defined and creep is not in target room
        if (creep.memory.target != undefined && creep.room.name != creep.memory.target) {
            // find exit to target room
            var exit = creep.room.findExitTo(creep.memory.target);
            // move to exit
            creep.moveTo(creep.pos.findClosestByRange(exit));
            // return the function to not do anything else
            return;
        }
        
        // if no constructionSite is found
        var towerNotFill = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            // find only tower
            filter: (s) => (s.structureType == STRUCTURE_TOWER) && s.energy < s.energyCapacity});
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
        }

        // if creep is supposed to complete a constructionSite
        if (creep.memory.working == true) {
            creep.say('🚧')
            // find closest constructionSite
            var constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            // if one is found
            if (constructionSite != undefined && constructionSite == STRUCTURE_EXTENSION) {
                // try to build, if the constructionSite is not in range
                if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                    // move towards the constructionSite
                    creep.moveTo(constructionSite, {visualizePathStyle: {stroke: '#ff8c00'}});
                }  
            }
            else if (constructionSite != undefined) {
                // try to build, if the constructionSite is not in range
                if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                    // move towards the constructionSite
                    creep.moveTo(constructionSite, {visualizePathStyle: {stroke: '#ff8c00'}});
                }
            }
            else if (towerNotFill != undefined && canFillTower == true) {
                creep.say('🕋')
                // try to transfer energy, if it is not in range
                if (creep.transfer(towerNotFill, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(towerNotFill);
                }
            }
            else {
                // go upgrading the controller
                roleUp.run(creep);
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
            
            if (dropSource != undefined) {
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
            else {
                if (creep.withdraw(bank, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards the source
                    creep.moveTo(bank, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
    }
};