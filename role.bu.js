var roleUp = require('role.up');

module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        
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
            else if (towerNotFill != undefined) {
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
            var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            // try to harvest energy, if the source is not in range
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                // move towards the source
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    }
};