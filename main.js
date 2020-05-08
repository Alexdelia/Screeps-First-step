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
            // find closest structure with less than max hits
            // Exclude walls because they have way too many max hits and would keep
            // our repairers busy forever. We have to find a solution for that later.
            var structure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            // the second argument for findClosestByPath is an object which takes
            // a property called filter which can be a function
            // we use the arrow operator to define it
                filter: (s) => s.hits < s.hitsMax});
            // if we find one
            if (structure != undefined) {
                tower.repair(structure)
            }
        }
    }
    
    Game.spawns.Spawn1.memory.minDiN = 0
    Game.spawns.Spawn1.memory.minDiW = 0
    Game.spawns.Spawn1.memory.minDiS = 0
    Game.spawns.Spawn1.memory.minDiE = 0
    
    for (let spawnName in Game.spawns) {
        let spawn = Game.spawns[spawnName];
        let creepsInRoom = spawn.room.find(FIND_MY_CREEPS);
        
        // control the number of cs
        
        var energyCap = spawn.room.energyCapacityAvailable
        
        var minHa = 5
        var minUp = 4
        var minBu = 2
        var minRe = 3
        
        var minDiN = 0
        var minDiW = 0
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
        
        if (energyCap == 300) {
            var minHa = 10    
        }
        
        if (energyCap <= 550) {
            var minHa = 2
            var minUp = 4
            var minBu = 1
            var minRe = 2
            var minDi = 7
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
        spawn.memory.minUp = 4
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
        
        homeSpawn = spawn.room.name
        
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
                var NewRole = 'first harvester because all die'
                };
            }
            else if (energyCap <= 900) {
                // Third step, 10 extension
                name = spawn.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], undefined,
                    {role: 'harvester', working: false});
                var NewRole = 'harvester';
                // if no one is left
                if (name == ERR_NOT_ENOUGH_ENERGY && numHa == 0) {
                // spawn one with what is available
                name = spawn.Spawn1.createCreep([WORK,CARRY,MOVE], undefined,
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
                name = spawn.createCreep([WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], undefined,
                    {role: 'upgrader', working: false});
                var NewRole = 'upgrader';
            }
            else if (energyCap <= 800) {
                name = spawn.createCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], undefined,
                    {role: 'upgrader', working: false});
                var NewRole = 'upgrader';
            }
        }
        else if (numDi < minDi) {
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
        else {
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
        // write name of cs spawn with role
        if (!(name < 0)) {
            console.log('Spawn ' + name + ': ' + NewRole + ', in ' + spawnName);
        }
    }
};
