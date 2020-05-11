 module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        
        for (let spawnName in Game.spawns) {
            let spawn = Game.spawns[spawnName];
            let creepsInRoom = spawn.room.find(FIND_MY_CREEPS);
            
            /*
            var minDiN = Game.spawns.Spawn1.memory.minDiN
            var minDiW = Game.spawns.Spawn1.memory.minDiW
            var minDiS = Game.spawns.Spawn1.memory.minDiS
            var minDiE = Game.spawns.Spawn1.memory.minDiE
            
            var minDi = minDiN + minDiW + minDiS + minDiE
            
            var numDi = _.sum(Game.creeps, (c) => c.memory.role == 'distant harvester');
            
            var numDiN = _.sum(Game.creeps, (c) => c.memory.compas == 'north');
            var numDiW = _.sum(Game.creeps, (c) => c.memory.compas == 'west');
            var numDiS = _.sum(Game.creeps, (c) => c.memory.compas == 'south');
            var numDiE = _.sum(Game.creeps, (c) => c.memory.compas == 'east');
            
            var numDi = numDiN + numDiW + numDiS + numDiE
            
            for (let name in Game.creeps) {
                var creep = Game.creeps[name];
                
                if (numDiN < spawn.memory.minDiN && creep.memory.role == 'distant harvester') {
                    creep.memory.compas = 'north';
                }
                else if (numDiW < spawn.memory.minDiW && creep.memory.role == 'distant harvester') {
                    creep.memory.compas = 'west';
                }
                else if (numDiS < spawn.memory.minDiS && creep.memory.role == 'distant harvester') {
                    creep.memory.compas = 'south';
                }
                else if (numDiE < spawn.memory.minDiE && creep.memory.role == 'distant harvester') {
                    creep.memory.compas ='east';
                }
            }
            */
            
                if (creep.memory.role == 'distant harvester') {
                var home = creep.memory.HomeSpawn;
                var cut = [];
                
                // var le = Object.keys(creep.memory.HomeSpawn).length;
                // var le = 6
                
                // if (creep.memory.HomeSpawn != undefined) {
                //    le = home.length
                //}
                //else {
                //    var le = 6
                //}
                
                var le = home.length
                
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
                
                var Gn = parseInt(NSX) - 1;
                var Gw = parseInt(WEX) + 1;
                var Gs = parseInt(NSX) + 1;
                var Ge = parseInt(WEX) - 1;
                
                // console.log('Base is: ' + WE + WEX + NS + NSX)
                // console.log('north is: ' + WE + WEX + NS + Gn)
                
                if (creep.memory.compas == 'north') {
                    var outside = WE + WEX + NS + Gn
                }
                else if (creep.memory.compas == 'west') {
                    var outside = WE + Gw + NS + NSX
                }
                else if (creep.memory.compas == 'south') {
                    var outside = WE + WEX + NS + Gs
                }
                else if (creep.memory.compas == 'east') {
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
                                     || s.structureType == STRUCTURE_CONTAINER)
                                     && (s.energy < s.energyCapacity 
                                     || s.store.energy < s.store.energy)
                        });
                        var findTower = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                        // the second argument for findClosestByPath is an object which takes
                        // a property called filter which can be a function
                        // we use the arrow operator to define it
                        filter: (s) => (s.structureType == STRUCTURE_TOWER)
                                     && s.energy < s.energyCapacity
                        });
                        
                        if (findTower != undefined) {
                            // try to transfer energy, if it is not in range
                            if (creep.transfer(findTower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                // move towards it
                                creep.moveTo(findTower);
                            }
                        }
                        // if we found one
                        else if (structure != undefined) {
                            // try to transfer energy, if it is not in range
                            if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                // move towards it
                                creep.moveTo(structure);
                            }
                        }
                    }
                    else {
                        creep.say('🌏 ' + home);
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
                    if (creep.room.name == outside) {            
                        // find closest source
                        creep.say('📥');
                        
                        var dropSource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
                        var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                        // try to harvest energy, if the source is not in range
                        if(dropSource != undefined) {
                            if(creep.pickup(dropSource) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(dropSource, {visualizePathStyle: {stroke: '#ffffff'}});
                            }
                        }
                        // try to harvest energy, if the source is not in range
                        else if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                            // move towards the source
                            creep.moveTo(source, {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    }
                    else {
                        creep.say('🌏 ' + outside);
                        var exitDir = Game.map.findExit(home, outside);
                        var exit = creep.pos.findClosestByPath(exitDir);
                        creep.moveTo(exit)
                    }
                }
            }
        }
    }
 };