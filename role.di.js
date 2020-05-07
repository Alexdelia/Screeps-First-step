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
            creep.say('📤');
            // creep.moveTo(new RoomPosition(21, 3,'W26S28'));
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
            else {
            // if he doesn't find the source, he need to move to the right room
            creep.say('🌏');
            var exitDir = Game.map.findExit('W26S28', 'W26S29');
            var exit = creep.pos.findClosestByPath(exitDir);
            creep.moveTo(exit)
            }
        }
        // code of up
        // try to upgrade the controller
        // if (creep.upgradeController(Game.getObjectById('5bbcab839099fc012e633aaa')) == ERR_NOT_IN_RANGE) {
        // if not in range, move towards the controller
        // creep.moveTo(Game.getObjectById('5bbcab839099fc012e633aaa'), {visualizePathStyle: {stroke: '#15ff00'}});
        // if creep is supposed to harvest energy from source
        else {
            if (creep.room != 'W26S29') {
                creep.say('🌏');
                var exitDir = Game.map.findExit('W26S29', 'W26S28');
                var exit = creep.pos.findClosestByPath(exitDir);
                creep.moveTo(exit)
            }
            else {
                // find closest source
                creep.say('📥');
                var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                // try to harvest energy, if the source is not in range
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    // move towards the source
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
    }
 };