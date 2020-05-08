var roleHa = require ('role.ha');
var roleUp = require ('role.up');
var roleBu = require ('role.bu');
var roleRe = require ('role.re');
var roleDi = require ('role.di');
var roleSdi = require ('role.sdi');

module.exports.loop = function () {
    // check for memory entries of died creeps by iterating over Memory.creeps
    for (let name in Memory.creeps) {
        // and checking if the creep is still alive
        if (Game.creeps[name] == undefined) {
            // if not, delete the memory entry
            delete Memory.creeps[name];
        }
    }
    
    for (let name in Game.creeps) {
        var creep = Game.creeps[name];
        
        // if creep is harvester, call harvester script
        if (creep.memory.role == 'harvester') {
            roleHa.run(creep);
        }
         // if creep is upgrader, call upgrader script
        else if (creep.memory.role == 'upgrader') {
            roleUp.run(creep);
        }
        else if (creep.memory.role == 'builder') {
            roleBu.run(creep);
        }
        else if (creep.memory.role == 'repairer') {
            roleRe.run(creep);
        }
        else if (creep.memory.role == 'distant harvester') {
            roleDi.run(creep);
        }
    }
    var home = Game.spawns.Spawn1.room.name;
    var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
    for (let tower of towers) {
        var target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        var notWall = tower.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL});
        var lowWall = tower.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.hits < 300000 && s.structureType == STRUCTURE_WALL})
        if (target != undefined) {
            tower.attack(target);
        }
        else if (notWall !=undefined) {
            tower.repair(notWall);
        }
        else if (lowWall != undefined) {
            tower.repair(lowWall);
        }
        else {
            // if we find one
            if (notWall != undefined) {
                tower.repair(notWall)
            }
        }
    }
    
    Game.spawns.Spawn1.memory.minDiN = 5
    Game.spawns.Spawn1.memory.minDiW = 3
    Game.spawns.Spawn1.memory.minDiS = 0
    Game.spawns.Spawn1.memory.minDiE = 0
    
    for (let spawnName in Game.spawns) {
        let spawn = Game.spawns[spawnName];
        let creepsInRoom = spawn.room.find(FIND_MY_CREEPS);
        
        // control the number of cs
        
        var energyCap = spawn.room.energyCapacityAvailable
        var name = undefined;
        
        
        var minHa = 5
        var minUp = 4
        var minBu = 2
        var minRe = 3
        
        var minDiN = 5
        var minDiW = 3
        var minDiS = 0
        var minDiE = 0
        
        var minDi = minDiN + minDiW + minDiS + minDiE
        
        var numHa = _.sum(creepsInRoom, (c) => c.memory.role == 'harvester');
        var numUp = _.sum(creepsInRoom, (c) => c.memory.role == 'upgrader');
        var numBu = _.sum(creepsInRoom, (c) => c.memory.role == 'builder');
        var numRe = _.sum(creepsInRoom, (c) => c.memory.role == 'repairer');
        var numDi = _.sum(Game.creeps, (c) => c.memory.role == 'distant harvester');
        
        var numDiN = _.sum(Game.creeps, (c) => c.memory.compas == 'north');
        var numDiW = _.sum(Game.creeps, (c) => c.memory.compas == 'west');
        var numDiS = _.sum(Game.creeps, (c) => c.memory.compas == 'south');
        var numDiE = _.sum(Game.creeps, (c) => c.memory.compas == 'east');
        
        var numDi = numDiN + numDiW + numDiS + numDiE
        
        if (energyCap == 300) {
            var minHa = 10    
        }
        
        if (energyCap <= 550) {
            var minHa = 2
            var minUp = 4
            var minBu = 1
            var minRe = 2
        }
        
        if (towers != undefined) {
            var minRe = 1
        }
        
        // last var needed
            if (numUp < 1) {
            var minHa = 1
        }
        if (numBu < 1) {
            var minHa = 4
            var minUp = 1
            var minRe = 0
        }
        // to this point
        
        // transfer to memory of each spawner
        
        spawn.memory.minHa = 5
        spawn.memory.minUp = 6
        spawn.memory.minBu = 2
        spawn.memory.minRe = 3
        
        if (energyCap == 300) {
            spawn.memory.minHa = 10    
        }
        
        if (energyCap <= 550) {
            spawn.memory.minHa = 2
            spawn.memory.minUp = 4
            spawn.memory.minBu = 1
            spawn.memory.minRe = 2
            spawn.memory.minDi = 7
        }
        
        if (towers != undefined) {
            spawn.memory.minRe = 1
        }
        
        if (numDi > 5) {
            spawn.memory.minHa = 1
        }
        
        // last var needed
            if (numUp < 1) {
            spawn.memory.minHa = 1
        }
        if (numBu < 1) {
            spawn.memory.minHa = 4
            spawn.memory.minUp = 1
            spawn.memory.minRe = 0
        }
        // to this point
        
        // check if enough of distant harvester in each direction
        
        // i don't know if something is buggy here but sometime distant harvest spawn without homeSpawn and compas in memory
        
        // console.log('numDiN: ' + numDiN + ', ninDiN: ' + spawn.memory.minDiN)
        
        
        //if (numDiN < spawn.memory.minDiN) {
        //    var compasV = 'north';
        //}
        //else if (numDiW < spawn.memory.minDiW) {
        //    var compasV = 'west'
        //}
        //else if (numDiS < spawn.memory.minDiS) {
        //    var compasV = 'south'
        //}
        //else if (numDiE < spawn.memory.minDiE) {
        //    var compasV = 'east'
        //}
        //else {
        //    console.log('enough distant harvester on each direction, (compasV: ' + compasV + ')')
        //}
        
        // console.log('compasV: ' + compasV)
        
        homeSpawn = spawn.room.name
        
        if (name == undefined) {
            if (numHa < spawn.memory.minHa) {
                // try to spawn one harvester
                if (energyCap <=400) {
                    // First step, no extension
                    name = spawn.createCreep([WORK,WORK,CARRY,MOVE], undefined,
                        {role: 'harvester', working: false});
                    var NewRole = 'harvester';
                    // if no one is left
                    if (name == ERR_NOT_ENOUGH_ENERGY && numHa == 0) {
                    // spawn one with what is available
                    name = spawn.createCreep([WORK,CARRY,MOVE], undefined,
                        {role: 'harvester', working: false});
                    var NewRole = 'first harvester because all die'
                    };
                }
                else if (energyCap <= 650) {
                    // Second step, 5 extension
                    name = spawn.Spawn1.createCreep([WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined,
                        {role: 'harvester', working: false});
                    var NewRole = 'harvester';
                    // if no one is left
                    if (name == ERR_NOT_ENOUGH_ENERGY && numHa == 0) {
                    // spawn one with what is available
                    name = spawn.Spawn1.createCreep([WORK,CARRY,MOVE], undefined,
                        {role: 'harvester', working: false});
                    var NewRole = 'first harvester because all died'
                    };
                }
                else if (energyCap <= 900) {
                    // Third step, 10 extension
                    name = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], undefined,
                        {role: 'harvester', working: false});
                    var NewRole = 'harvester';
                    // if no one is left
                    if (name == ERR_NOT_ENOUGH_ENERGY && numHa == 0 && numDi == 0) {
                    // spawn one with what is available
                    name = spawn.createCreep([WORK,CARRY,MOVE], undefined,
                        {role: 'harvester', working: false});
                    var NewRole = 'first harvester because all die'
                    };
                }
            }
            else if (numUp < spawn.memory.minUp) {
                if (energyCap == 300) {
                    name = spawn.createCreep([WORK,CARRY,MOVE,MOVE,MOVE], undefined,
                        {role: 'upgrader', working: false});
                    var NewRole = 'upgrader';
                }
                else if (energyCap <= 550) {
                    name = spawn.createCreep([WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE], undefined,
                        {role: 'upgrader', working: false});
                    var NewRole = 'upgrader';
                }
                else if (energyCap <= 800) {
                    name = spawn.createCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], undefined,
                        {role: 'upgrader', working: false});
                    var NewRole = 'upgrader';
                }
            }
            else if (numDi < minDi) {
                
                if (numDiN < spawn.memory.minDiN) {
                    var compasV = 'north';
                }
                else if (numDiW < spawn.memory.minDiW) {
                    var compasV = 'west'
                }
                else if (numDiS < spawn.memory.minDiS) {
                    var compasV = 'south'
                }
                else if (numDiE < spawn.memory.minDiE) {
                    var compasV = 'east'
                }
                else {
                    console.log('enough distant harvester on each direction, (compasV: ' + compasV + ')')
                }
                
                if (energyCap == 300) {
                    name = spawn.createCreep([WORK,CARRY,CARRY,MOVE,MOVE], undefined,
                        {role: 'distant harvester', working: false, compas: compasV, HomeSpawn: homeSpawn});
                    var NewRole = 'distant harvester';
                }
                else if (energyCap <= 550) {
                    name = spawn.createCreep([WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE], undefined,
                        {role: 'distant harvester', working: false, compas: compasV, HomeSpawn: homeSpawn});
                    var NewRole = 'distant harvester';
                }
                else if (energyCap <= 800) {
                    name = spawn.createCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], undefined,
                        {role: 'distant harvester', working: false, compas: compasV, HomeSpawn: homeSpawn});
                    var NewRole = 'distant harvester';
                }
            }
            else if (numRe < spawn.memory.minRe) {
                if (energyCap == 300) {
                    name = spawn.createCreep([WORK,WORK,CARRY,MOVE], undefined,
                        {role: 'repairer', working: false});
                    var NewRole = 'repairer';
                }
                else if (energyCap <= 550) {
                    name = spawn.createCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE], undefined,
                        {role: 'repairer', working: false});
                    var NewRole = 'repairer';
                }
                else if (energyCap <= 800) {
                    name = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], undefined,
                        {role: 'repairer', working: false});
                    var NewRole = 'repairer';
                }
            }
            else if (numBu < spawn.memory.minBu) {
                if (energyCap == 300) {
                    name = spawn.createCreep([WORK,WORK,CARRY,MOVE], undefined,
                        {role: 'builder', working: false});
                    var NewRole = 'builder';
                }
                else if (energyCap <= 550) {
                    name = spawn.createCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE], undefined,
                        {role: 'builder', working: false});
                    var NewRole = 'builder';
                }
                else if (energyCap <= 800) {
                    name = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], undefined,
                        {role: 'builder', working: false});
                    var NewRole = 'builder';
                }
            }
            
            else if (numDi > 0 
                && numHa > 0
                && numUp >= 6
                && numBu >= 2
                && numRe > 0) {
                
                var numTotal = (_.sum(Game.creeps, (c) => c.memory.working == true) + _.sum(Game.creeps, (c) => c.memory.working == false))
                // console.log('enough creeps: ' + numTotal)
                
                name = -1
            }
            
            else {
                name = -1;
            }
        }
        
        // else {
        //    if (energyCap == 300) {
        //        name = spawn.createCreep([WORK,WORK,CARRY,MOVE], undefined,
        //            {role: 'builder', working: false});
        //        var NewRole = 'builder';
        //    }
        //    else if (energyCap <= 550) {
        //        name = spawn.createCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE], undefined,
        //            {role: 'builder', working: false});
        //        var NewRole = 'builder';
        //    }
        //    else if (energyCap <= 800) {
        //        name = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], undefined,
        //            {role: 'builder', working: false});
        //        var NewRole = 'builder';
        //    }
        //}
        
        // write name of cs spawn with role
        if (!(name < 0)) {
            if (NewRole == 'distant harvester') {
                console.log('Spawn ' + name + ': ' + NewRole + ' ' + compasV +', in ' + spawnName);
            }
            else {
                console.log('Spawn ' + name + ': ' + NewRole + ', in ' + spawnName);
            }
        }
    }
};
