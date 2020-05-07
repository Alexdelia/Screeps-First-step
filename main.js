var roleHa = require ('role.ha');
var roleUp = require ('role.up');
var roleBu = require ('role.bu');
var roleRe = require ('role.re');
var roleDi = require ('role.di');

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
    
    var towers = Game.rooms.W26S29.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType == STRUCTURE_TOWER
    });
    for (let tower of towers) {
        var target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target != undefined) {
            tower.attack(target);
        }
    }
    
    // control the number of cs
    
    var energyCap = Game.rooms.W26S29.energyCapacityAvailable
    
    var minHa = 5
    var minUp = 4
    var minBu = 2
    var minRe = 3
    var minDi = 5
    
    var numHa = _.sum(Game.creeps, (c) => c.memory.role == 'harvester');
    var numUp = _.sum(Game.creeps, (c) => c.memory.role == 'upgrader');
    var numBu = _.sum(Game.creeps, (c) => c.memory.role == 'builder');
    var numRe = _.sum(Game.creeps, (c) => c.memory.role == 'repairer');
    var numDi = _.sum(Game.creeps, (c) => c.memory.role == 'distant harvester');
    
    if (energyCap == 300) {
        var minHa = 10    
    }
    if (numUp < 1) {
        var minHa = 1
    }
    if (numBu < 1) {
        var minHa = 4
        var minUp = 1
        var minRe = 0
    }

    if (numHa < minHa) {
        // try to spawn one harvester
        if (energyCap == 300) {
            // First step, no extension
            name = Game.spawns.Spawn1.createCreep([WORK,WORK,CARRY,MOVE], undefined,
                {role: 'harvester', working: false});
            var NewRole = 'harvester';
            // if no one is left
            if (name == ERR_NOT_ENOUGH_ENERGY && numHa == 0) {
            // spawn one with what is available
            name = Game.spawns.Spawn1.createCreep([WORK,CARRY,MOVE], undefined,
                {role: 'harvester', working: false});
            var NewRole = 'first harvester because all die'
            };
        }
        else if (energyCap <= 550) {
            // Second step, 5 extension
            name = Game.spawns.Spawn1.createCreep([WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined,
                {role: 'harvester', working: false});
            var NewRole = 'harvester';
            // if no one is left
            if (name == ERR_NOT_ENOUGH_ENERGY && numHa == 0) {
            // spawn one with what is available
            name = Game.spawns.Spawn1.createCreep([WORK,CARRY,MOVE], undefined,
                {role: 'harvester', working: false});
            var NewRole = 'first harvester because all die'
            };
        }
        else if (energyCap <= 800) {
            // Third step, 10 extension
            name = Game.spawns.Spawn1.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], undefined,
                {role: 'harvester', working: false});
            var NewRole = 'harvester';
            // if no one is left
            if (name == ERR_NOT_ENOUGH_ENERGY && numHa == 0) {
            // spawn one with what is available
            name = Game.spawns.Spawn1.createCreep([WORK,CARRY,MOVE], undefined,
                {role: 'harvester', working: false});
            var NewRole = 'first harvester because all die'
            };
        }
    }
    else if (numUp < minUp) {
        if (energyCap == 300) {
            name = Game.spawns.Spawn1.createCreep([WORK,CARRY,MOVE,MOVE,MOVE], undefined,
                {role: 'upgrader', working: false});
            var NewRole = 'upgrader';
        }
        else if (energyCap <= 550) {
            name = Game.spawns.Spawn1.createCreep([WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], undefined,
                {role: 'upgrader', working: false});
            var NewRole = 'upgrader';
        }
        else if (energyCap <= 800) {
            name = Game.spawns.Spawn1.createCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], undefined,
                {role: 'upgrader', working: false});
            var NewRole = 'upgrader';
        }
    }
    else if (numRe < minRe) {
        if (energyCap == 300) {
            name = Game.spawns.Spawn1.createCreep([WORK,WORK,CARRY,MOVE], undefined,
                {role: 'repairer', working: false});
            var NewRole = 'repairer';
        }
        else if (energyCap <= 550) {
            name = Game.spawns.Spawn1.createCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE], undefined,
                {role: 'repairer', working: false});
            var NewRole = 'repairer';
        }
        else if (energyCap <= 800) {
            name = Game.spawns.Spawn1.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], undefined,
                {role: 'repairer', working: false});
            var NewRole = 'repairer';
        }
    }
    else if (numBu < minBu) {
        if (energyCap == 300) {
            name = Game.spawns.Spawn1.createCreep([WORK,WORK,CARRY,MOVE], undefined,
                {role: 'builder', working: false});
            var NewRole = 'builder';
        }
        else if (energyCap <= 550) {
            name = Game.spawns.Spawn1.createCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE], undefined,
                {role: 'builder', working: false});
            var NewRole = 'builder';
        }
        else if (energyCap <= 800) {
            name = Game.spawns.Spawn1.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], undefined,
                {role: 'builder', working: false});
            var NewRole = 'builder';
        }
    }
    else if (numDi < minDi) {
        if (energyCap == 300) {
            name = Game.spawns.Spawn1.createCreep([WORK,WORK,CARRY,MOVE], undefined,
                {role: 'distant harvester', working: false});
            var NewRole = 'distant harvester';
        }
        else if (energyCap <= 550) {
            name = Game.spawns.Spawn1.createCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE], undefined,
                {role: 'distant harvester', working: false});
            var NewRole = 'bdistant harvesteruilder';
        }
        else if (energyCap <= 800) {
            name = Game.spawns.Spawn1.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], undefined,
                {role: 'distant harvester', working: false});
            var NewRole = 'distant harvester';
        }
    }
    else {
        if (energyCap == 300) {
            name = Game.spawns.Spawn1.createCreep([WORK,WORK,CARRY,MOVE], undefined,
                {role: 'builder', working: false});
            var NewRole = 'builder';
        }
        else if (energyCap <= 550) {
            name = Game.spawns.Spawn1.createCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE], undefined,
                {role: 'builder', working: false});
            var NewRole = 'builder';
        }
        else if (energyCap <= 800) {
            name = Game.spawns.Spawn1.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], undefined,
                {role: 'builder', working: false});
            var NewRole = 'builder';
        }
    }
    // write name of cs spawn with role
    if (!(name < 0)) {
        console.log('Spawn ' + name + ': ' + NewRole);
    }
};