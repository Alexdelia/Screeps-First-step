module.exports = {
    run: function(creep) {
        
        let flagA = Game.flags.flagAttack;
        var ennemiesSpawn = creep.pos.findClosestByRange(FIND_HOSTILE_SPAWNS);
        var ennemiesCreep = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        var wall = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART)});
        
        if (creep.room.name != creep.memory.target) {
            creep.say('🌏 ' + creep.memory.target);
            // find exit to target room
            var exit = creep.room.findExitTo(creep.memory.target);
            // move to exit
            creep.moveTo(creep.pos.findClosestByRange(exit));
        }
        else {
            creep.say('Attack');
            
            if (ennemiesSpawn != undefined) {
                if (creep.attack(ennemiesSpawn) == ERR_NOT_IN_RANGE) {
                // move
                creep.moveTo(ennemiesSpawn);
                }
            }
            else if (ennemiesCreep != undefined) {
                if (creep.attack(ennemiesCreep) == ERR_NOT_IN_RANGE) {
                creep.moveTo(ennemiesCreep);
                }
            }
            else if (wall != undefined) {
                if (creep.attack(wall) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(wall)
                }
            }
            else {
                creep.say('Stand by')
            }
        }
    }
};
/*
module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        // if in target room
        if (creep.room.name != creep.memory.target) {
            // find exit to target room
            var exit = creep.room.findExitTo(creep.memory.target);
            // move to exit
            creep.moveTo(creep.pos.findClosestByRange(exit));
        }
        else {
            // try to claim controller
            if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                // move towards the controller
                creep.moveTo(creep.room.controller);
            }
        }
    }
};
*/