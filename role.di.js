 module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        
        for (let spawnName in Game.spawns) {
            let spawn = Game.spawns[spawnName];
            let creepsInRoom = spawn.room.find(FIND_CREEPS);
            
            
            
            var home = creep.memory.HomeSpawn;
            var cut = [];
            
            var le = home.length;
            var i = 0;
            
            for (i = 0; i < le; i++) {
                if (isNaN(home.charAt(i)) == true) {
                    cut.push(home.charAt(i))
                }
                else {
                    if (!isNaN(home.charAt(i - 1)) == true) {
                        cut.push(number + (home.charAt(i)))
                    }
                    else {
                        var number = home.charAt(i);
                    }
                }
            }
            
            var WE = cut[0];
            var WEX = cut[1]
            var NS = cut[2]
            var NSX = cut[3]
            
            var Gn = NSX - 1;
            var Gw = WEX + 1;
            var Gs = NSX + 1;
            var Ge = WEX - 1;
            
            // console.log('Base is: ' + WE + WEX + NS + NSX)
            // console.log('north is: ' + WE + WEX + NS + Gn)
            
            if (creep.memory.compas = 'north') {
                var outside = WE + WEX + NS + Gn
            }
            else if (creep.memory.compas = 'west') {
                var outside = WE + Gw + NS + NSX
            }
            else if (creep.memory.compas = 'south') {
                var outside = WE + WEX + NS + Gs
            }
            else if (creep.memory.compas = 'east') {
                var outside = WE + Ge + NS + NSX
            }
            
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
                if (creep.room.name == home) {
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
                }
                else {
                    creep.say('🌏');
                    var exitDir = Game.map.findExit(outside, home);
                    var exit = creep.pos.findClosestByPath(exitDir);
                    creep.moveTo(exit);
                }
            }
            // code of up
            // try to upgrade the controller
            // if (creep.upgradeController(Game.getObjectById('5bbcab839099fc012e633aaa')) == ERR_NOT_IN_RANGE) {
            // if not in range, move towards the controller
            // creep.moveTo(Game.getObjectById('5bbcab839099fc012e633aaa'), {visualizePathStyle: {stroke: '#15ff00'}});
            // if creep is supposed to harvest energy from source
            else {
                // if in target room
                if (creep.room.name == creep.memory.target) {            
                    // find closest source
                    creep.say('📥');
                    var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                    // try to harvest energy, if the source is not in range
                    if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        // move towards the source
                        creep.moveTo(source, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
                else {
                    creep.say('🌏');
                    var exitDir = Game.map.findExit(home, outside);
                    var exit = creep.pos.findClosestByPath(exitDir);
                    creep.moveTo(exit)
                }
            }
        }
    }
 };