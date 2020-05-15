/* todo:
add range to spawn in var, and put it in: actual=250,  next=500, spawn= <500
*/


var roleHa = require ('role.ha');
var roleUp = require ('role.up');
var roleBu = require ('role.bu');
var roleRe = require ('role.re');
var roleDi = require ('role.di');
var roleMi = require ('role.mi');
var roleTr = require ('role.tr');
var roleAttacker = require ('role.attacker');
var roleClaimer = require ('role.claimer');
//var roleSdi = require ('role.sdi');

module.exports.loop = function () {
    // check for memory entries of died creeps by iterating over Memory.creeps
    for (let name in Memory.creeps) {
        // and checking if the creep is still alive
        if (Game.creeps[name] == undefined) {
            // if not, delete the memory entry
            delete Memory.creeps[name];
        }
    }
    
    Game.spawns.Spawn1.memory.phase = 2;
    Game.spawns.Spawn2.memory.phase = 1;
    
    Game.spawns.Spawn1.memory.minDiN = 3;
    Game.spawns.Spawn1.memory.minDiW = 2;
    Game.spawns.Spawn1.memory.minDiS = 0;
    Game.spawns.Spawn1.memory.minDiE = 0;
    
    Game.spawns.Spawn2.memory.minDiN = 0;
    Game.spawns.Spawn2.memory.minDiW = 2;
    Game.spawns.Spawn2.memory.minDiS = 2;
    Game.spawns.Spawn2.memory.minDiE = 0;
    
    
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
        else if (creep.memory.role == 'miner') {
            roleMi.run(creep);
        }
        else if (creep.memory.role == 'transporter') {
            roleTr.run(creep);
        }
        else if (creep.memory.role == 'attacker') {
            roleAttacker.run(creep);
        }
        else if (creep.memory.role == 'claimer') {
            roleClaimer.run(creep);
        }
    }
    var home = Game.spawns.Spawn1.room.name;
    var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
    for (let tower of towers) {
        var target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        var notWall = tower.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART});
        var lowWall = tower.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.hits < 300000 && (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART)});
        
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
    
    for (let spawnName in Game.spawns) {
        let spawn = Game.spawns[spawnName];
        let creepsInRoom = spawn.room.find(FIND_MY_CREEPS);
        
        // control the number of cs
        
        var energyCap = spawn.room.energyCapacityAvailable
        var name = undefined;
        
        
        /*var minHa = 5
        var minUp = 4
        var minBu = 2
        var minRe = 3
        */
        
        var numHa = _.sum(creepsInRoom, (c) => c.memory.role == 'harvester');
        var numUp = _.sum(creepsInRoom, (c) => c.memory.role == 'upgrader');
        var numBu = _.sum(creepsInRoom, (c) => c.memory.role == 'builder');
        var numRe = _.sum(creepsInRoom, (c) => c.memory.role == 'repairer');
        var numDi = _.sum(Game.creeps, (c) => c.memory.role == 'distant harvester');
        
        var numMi = _.sum(creepsInRoom, (c) => c.memory.role == 'miner');
        var numTr = _.sum(creepsInRoom, (c) => c.memory.role == 'transporter');
        
        var numDiN = _.sum(Game.creeps, (c) => c.memory.compas == 'north');
        var numDiW = _.sum(Game.creeps, (c) => c.memory.compas == 'west');
        var numDiS = _.sum(Game.creeps, (c) => c.memory.compas == 'south');
        var numDiE = _.sum(Game.creeps, (c) => c.memory.compas == 'east');
        
        var minDiN = Game.spawns.Spawn1.memory.minDiN
        var minDiW = Game.spawns.Spawn1.memory.minDiW
        var minDiS = Game.spawns.Spawn1.memory.minDiS
        var minDiE = Game.spawns.Spawn1.memory.minDiE
                
        var minDi = minDiN + minDiW + minDiS + minDiE
        
        /*
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
        */
        
        var bank = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: (s) => (s.structureType == STRUCTURE_STORAGE) 
        });
        
        if (spawn.memory.phase == 2) {
            // if room has container, code will spawn other creeps with other condition
            // console.log(spawn.name)
            
            spawn.memory.minMi = spawn.room.find(FIND_SOURCES).length;
            spawn.memory.minTr = spawn.memory.minMi + 1;
            spawn.memory.minHa = 0;
            spawn.memory.minUp = 1;
            spawn.memory.minBu = 3;
            spawn.memory.minRe = 1;
            
            if (spawn.memory.minMi == 0) {
                spawn.memory.minHa = 1
            }
            
            // spawn more upgrader if storage is huge
            
            var X = 50000
            
            var bankX = spawn.room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] > X
            });
            if (spawn.room.storage != undefined) {
                if (bankX != undefined) {
                    spawn.memory.minUp = (spawn.memory.minUp + (Math.floor(spawn.room.storage.store.energy / X)));
                }
            }
            
            // spawn
            
            homeSpawn = spawn.room.name
            
            if (name == undefined) {
                
                if (numMi < spawn.memory.minMi) {
                    for (let source of spawn.room.find(FIND_SOURCES)) {
                        if (!_.some(creepsInRoom, c => c.memory.role == 'miner' && c.memory.sourceId == source.id)) {
                            // check whether or not the source has a container
                            let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                                filter: s => s.structureType == STRUCTURE_CONTAINER
                            });
                            // if there is a container next to the source
                            if (containers.length > 0) {
                                // spawn a miner
                                name = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,MOVE], undefined,
                                    {role: 'miner', sourceId: source.id});
                                var NewRole = 'miner';
                            }
                        }
                    }
                }
                else if (numTr < spawn.memory.minTr) {
                    // try to spawn one transporter
                    name = spawn.createCreep([CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], undefined,
                        {role: 'transporter', working: false});
                    var NewRole = 'transporter';
                }
                else if (numUp < spawn.memory.minUp) {
                    if (energyCap >= 1500) {
                        // try to spawn one upgrader
                        // 9 Work part, 7 Carry, 5 move : 1500 energy
                        name = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], undefined,
                            {role: 'upgrader', working: false});
                    }
                    else {
                        name = spawn.createCreep([WORK,CARRY,MOVE], undefined, 
                            {role: 'upgrader', working: false});
                    }
                    var NewRole = 'upgrader';
                }
                else if (numDi < minDi) {
                    if (numDiN < minDiN) {
                        name = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], undefined,
                            {role: 'distant harvester', working: false, compas: 'north', HomeSpawn: homeSpawn});
                        var NewRole = 'distant harvester north';
                    }
                    else if (numDiW < minDiW) {
                        name = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], undefined,
                            {role: 'distant harvester', working: false, compas: 'west', HomeSpawn: homeSpawn});
                        var NewRole = 'distant harvester west';
                    }
                    else if (numDiS < minDiS) {
                        name = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], undefined,
                            {role: 'distant harvester', working: false, compas: 'south', HomeSpawn: homeSpawn});
                        var NewRole = 'distant harvester south';
                    }
                    else if (numDiE < minDiE) {
                        name = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], undefined,
                            {role: 'distant harvester', working: false, compas: 'east', HomeSpawn: homeSpawn});
                        var NewRole = 'distant harvester east';
                    }
                    else {
                        console.log("if this got print that's bad");
                    }
                }
                else if (numRe < spawn.memory.minRe) {
                    if (energyCap >= 900) {
                        // try to spawn one repairer
                        // 5 Work part, 5 Carry, 3 move : 900 energy
                        name = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], undefined,
                            {role: 'repairer', working: false});
                    }
                    else {
                        name = spawn.createCreep([WORK,CARRY,MOVE], undefined, 
                            {role: 'repairer', working: false});
                    }
                    var NewRole = 'repairer';
                }
                else if (numBu < spawn.memory.minBu) {
                    if (energyCap >= 1500) {
                        // try to spawn one builder
                        // 10 Work part, 6 Carry, 4 move : 1500 energy
                        name = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], undefined,
                            {role: 'builder', working: false});
                    }
                    else {
                        name = spawn.createCreep([WORK,CARRY,MOVE], undefined, 
                            {role: 'builder', working: false});
                    }
                    var NewRole = 'builder';
                }
                else {
                    name = -1;
                }
            }
            if (!(name < 0)) {
                console.log('Spawn ' + name + ': ' + NewRole + ', in ' + spawnName);
            }
        }
        else {
            // transfer to memory of each spawner
            
            spawn.memory.minHa = 1
            spawn.memory.minUp = 4
            spawn.memory.minBu = 4
            spawn.memory.minRe = 3
            
            if (energyCap == 300) {
                spawn.memory.minHa = 10    
            }
            
            if (energyCap <= 550) {
                spawn.memory.minHa = 2
                spawn.memory.minUp = 4
                spawn.memory.minBu = 1
                spawn.memory.minRe = 2
            }
            
            if (energyCap >= 1150 && energyCap <= 1400) {
                spawn.memory.minUp = 4
            }
            
            if (towers != undefined) {
                spawn.memory.minRe = 1
            }
            
            if (numDi > 5) {
                spawn.memory.minHa = 1
            }
            
            if (numDi < 1) {
                spawn.memory.minHa = 2
                spawn.memory.minUp = 1
            }
            
            // last var needed
                if (numUp < 1) {
                spawn.memory.minHa = 1
            }
            if (numBu < 1) {
                spawn.memory.minHa = 2
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
                        if (name == ERR_NOT_ENOUGH_ENERGY && numHa == 0 && numDi == 0) {
                        // spawn one with what is available
                        name = spawn.createCreep([WORK,CARRY,MOVE], undefined,
                            {role: 'harvester', working: false});
                        var NewRole = 'first harvester because all die'};
                    }
                    else if (energyCap <= 650) {
                        // Second step, 5 extension
                        name = spawn.Spawn1.createCreep([WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined,
                            {role: 'harvester', working: false});
                        var NewRole = 'harvester';
                        // if no one is left
                        if (name == ERR_NOT_ENOUGH_ENERGY && numHa == 0 && numDi == 0) {
                        // spawn one with what is available
                        name = spawn.Spawn1.createCreep([WORK,CARRY,MOVE], undefined,
                            {role: 'harvester', working: false});
                        var NewRole = 'first harvester because all died'};
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
                        var NewRole = 'first harvester because all die'};
                    }
                    else if (energyCap <= 1250) {
                        // fourth step, 15 extension
                        name = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], undefined,
                            {role: 'harvester', working: false});
                        var NewRole = 'harvester';
                        // if no one is left
                        if (name == ERR_NOT_ENOUGH_ENERGY && numHa == 0 && numDi == 0) {
                        // spawn one with what is available
                        name = spawn.createCreep([WORK,CARRY,MOVE], undefined,
                            {role: 'harvester', working: false});
                        var NewRole = 'first harvester because all die'};
                    }
                    else if (energyCap <= 1400) {
                        // fifth step, 20 extension
                        name = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], undefined,
                            {role: 'harvester', working: false});
                        var NewRole = 'harvester';
                        // if no one is left
                        if (name == ERR_NOT_ENOUGH_ENERGY && numHa == 0 && numDi == 0) {
                        // spawn one with what is available
                        name = spawn.createCreep([WORK,CARRY,MOVE], undefined,
                            {role: 'harvester', working: false});
                        var NewRole = 'first harvester because all die'};
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
                    else if (energyCap <= 1250) {
                        name = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], undefined,
                            {role: 'upgrader', working: false});
                        var NewRole = 'upgrader';
                    }
                    else if (energyCap <= 1400) {
                        name = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], undefined,
                            {role: 'upgrader', working: false});
                        var NewRole = 'upgrader';
                    }
                }
                else if (numDi < minDi && energyCap >= 550) {
                    /*
                    if (numDiN < spawn.memory.minDiN) {
                        var compasV = 'north';
                    }
                    else if (numDiW < spawn.memory.minDiW) {
                        var compasV = 'west';
                    }
                    else if (numDiS < spawn.memory.minDiS) {
                        var compasV = 'south';
                    }
                    else if (numDiE < spawn.memory.minDiE) {
                        var compasV = 'east';
                    }
                    else {
                        var compasV = 'east';
                    }
                    */
                    if ((energyCap >= 550) && (energyCap < 900)) {
                        if (numDiN < minDiN) {
                        name = spawn.createCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE], undefined,
                            {role: 'distant harvester', working: false, compas: 'north', HomeSpawn: homeSpawn});
                        var NewRole = 'distant harvester north';
                        }
                        else if (numDiW < minDiW) {
                            name = spawn.createCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE], undefined,
                                {role: 'distant harvester', working: false, compas: 'west', HomeSpawn: homeSpawn});
                            var NewRole = 'distant harvester west';
                        }
                        else if (numDiS < minDiS) {
                            name = spawn.createCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE], undefined,
                                {role: 'distant harvester', working: false, compas: 'south', HomeSpawn: homeSpawn});
                            var NewRole = 'distant harvester south';
                        }
                        else if (numDiE < minDiE) {
                            name = spawn.createCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE], undefined,
                                {role: 'distant harvester', working: false, compas: 'east', HomeSpawn: homeSpawn});
                            var NewRole = 'distant harvester east';
                        }
                        else {
                            console.log("if this got print that's bad");
                        }
                    }
                    else if (energyCap >= 900) {
                        if (numDiN < minDiN) {
                        name = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], undefined,
                            {role: 'distant harvester', working: false, compas: 'north', HomeSpawn: homeSpawn});
                        var NewRole = 'distant harvester north';
                        }
                        else if (numDiW < minDiW) {
                            name = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], undefined,
                                {role: 'distant harvester', working: false, compas: 'west', HomeSpawn: homeSpawn});
                            var NewRole = 'distant harvester west';
                        }
                        else if (numDiS < minDiS) {
                            name = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], undefined,
                                {role: 'distant harvester', working: false, compas: 'south', HomeSpawn: homeSpawn});
                            var NewRole = 'distant harvester south';
                        }
                        else if (numDiE < minDiE) {
                            name = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], undefined,
                                {role: 'distant harvester', working: false, compas: 'east', HomeSpawn: homeSpawn});
                            var NewRole = 'distant harvester east';
                        }
                        else {
                            console.log("if this got print that's bad");
                        }
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
                    else if (energyCap <= 1250) {
                        name = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], undefined,
                            {role: 'repairer', working: false});
                        var NewRole = 'repairer';
                    }
                    else if (energyCap <= 1400) {
                        name = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], undefined,
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
                    else if (energyCap <= 1250) {
                        name = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], undefined,
                            {role: 'builder', working: false});
                        var NewRole = 'builder';
                    }
                    else if (energyCap <= 1400) {
                        name = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE], undefined,
                            {role: 'builder', working: false});
                        var NewRole = 'builder';
                    }
                }
                
                else if (numDi > 0 
                    && numHa > 0
                    && numUp >= spawn.memory.minUp
                    && numBu >= spawn.memory.minBu
                    && numRe > 0) {
                    
                    var numTotal = (_.sum(Game.creeps, (c) => c.memory.working == true) + _.sum(Game.creeps, (c) => c.memory.working == false))
                    // console.log('enough creeps: ' + numTotal)
                    
                    name = -1;
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
            if (!(name < 0) && name != undefined) {
                console.log('Spawn ' + name + ': ' + NewRole + ', in ' + spawnName);
            }
        }
    }
};
