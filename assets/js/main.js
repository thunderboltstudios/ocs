// All commands
function help() {
    pushMsg("List of commands:<br><span style = 'text-decoration:underline'>help</span>- Displays this list<br><span style = 'text-decoration:underline'>begin</span>- Begins a battle with the AI<br><span style = 'text-decoration:underline'>attack</span> [position] [stepsx] [stepsy]- Moves a unit to the <em>relative</em> position, or fires at the enemy currently situated at the <em>relative</em> position<br><span style = 'text-decoration:underline'>configure</span>- Allows you to configure your army's starting position (only usable while not in battle)<br><span style = 'text-decoration:underline'>buy</span> [unit] [quantity]- Purchase a unit");
};

function attack(params) {
    if(turn == null) {
        pushMsg("This command may only be used while in battle.");
        return false;
    } else if(turn == "enemy") {
        pushMsg("It's not your turn.");
        return false;
    }
    if(params.length !== 3 || (params[1] == 0 && params[2] == 0)) {
        pushMsg("Faulty order!");
        actions++;
        postAction();
        return false;
    };
    var x = params[0].substring(0, params[0].indexOf("-"));
    var y = params[0].substring(params[0].indexOf("-") + 1, params[0].length);
    var curCell = getCell(y, x);
    if(!curCell.dataset.unit && !curCell.dataset.enemyunit) {
        pushMsg("Faulty order!");
        actions++;
        postAction();
        return false;
    };
    var curType = curCell.innerHTML.charAt(0);
    var xmove = 0;
    var ymove = 0;
    if(Math.abs(params[1]) > unitDesc[curType].speed) {
        if(params[1] > 0) {
            xmove = unitDesc[curType].speed;
        } else if(params[1] < 0) {
            xmove = -1 * unitDesc[curType].speed;
        };
    } else {
        if(params[1] > 0) {
            xmove = Math.floor(params[1]);
        } else if(params[1] < 0) {
            xmove = Math.ceil(params[1]);
        } else {
            xmove = 0;
        };
    };
    if(Math.abs(params[2]) > unitDesc[curType].speed) {
        if(params[2] > 0) {
            ymove = unitDesc[curType].speed;
        } else if(params[2] < 0) {
            ymove = -1 * unitDesc[curType].speed;
        };
    } else {
        if(params[2] > 0) {
            ymove = Math.floor(params[2]);
        } else if(params[2] < 0) {
            ymove = Math.ceil(params[2]);
        } else {
            ymove = 0;
        };
    };
    if((Number(y) + ymove) <= 0 || (Number(x) + xmove) <= 0) {
        pushMsg("Faulty order!");
        actions++;
        postAction();
        return false;
    };
    if(getCell(Number(y) + ymove, Number(x) + xmove) == undefined) {
        pushMsg("Faulty order!");
        actions++;
        postAction();
        return false;
    };
    var enemyat = false;
    for(var i = 0; i < enemyunits.length; i++) {
        if(enemyunits[i].xpos == (Number(x) + xmove) && enemyunits[i].ypos == (Number(y) + ymove)) {
            enemyat = i;
            break;
        };
    };
    if(enemyat !== false) {
        var crit = Math.random();
        var multiplier;
        if(crit < 0.35) {
            multiplier = (Math.random() * 0.5) + 0.5;
        } else if(crit >= 0.35 && crit < 0.85) {
            multiplier = (Math.random() * 1.6) + 1;
        } else {
            multiplier = (Math.random() * 1.2) + 2.6;
        };
        var defense = (Math.random() * (unitDesc[enemyunits[enemyat].type].speed * 1.5 - unitDesc[enemyunits[enemyat].type].speed * 0.5) + unitDesc[enemyunits[enemyat].type].speed * 0.5);
        var damage = ((unitDesc[units[curCell.dataset.unit - 1].type].strength * multiplier) - (unitDesc[enemyunits[enemyat].type].def * defense))
            .toFixed(2);
        if(Math.random() + (unitDesc[enemyunits[enemyat].type].speed * (Math.random() * 0.1)) > unitDesc[enemyunits[enemyat].type].accuracy || damage <= 0) {
            pushMsg("Player " + unitDesc[units[curCell.dataset.unit - 1].type].name + " tried to fire at Enemy " + unitDesc[enemyunits[enemyat].type].name + ", but missed.");
            actions++;
            postAction();
            return false;
        } else {
            enemyunits[enemyat].hp = (enemyunits[enemyat].hp - damage)
                .toFixed(2);
            if(enemyunits[enemyat].hp <= 0) {
                pushMsg("Player " + unitDesc[units[curCell.dataset.unit - 1].type].name + " fired at Enemy " + unitDesc[enemyunits[enemyat].type].name + ", <b>who was destroyed</b> after receiving " + damage + " damage.");
                document.querySelectorAll("[data-enemyunit='" + enemyat + "']")[0].innerHTML = "";
                document.querySelectorAll("[data-enemyunit='" + enemyat + "']")[0].className = "cell-unknown";
                delete document.querySelectorAll("[data-enemyunit='" + enemyat + "']")[0].dataset.enemyunit;
                enemyunits[enemyat] = new Unit("Dead", 0, 0, "none", 0, 0);
                updateCells();
                var eliminated = true;
                for(var i = 0; i < enemyunits.length; i++) {
                    if(enemyunits[i].hp !== 0) {
                        eliminated = false;
                        break;
                    };
                };
                if(eliminated) {
                    battle = false;
                    turn = false;
                    pushMsg("<b>You won the battle!</b>");
                    return false;
                } else {
                    actions++;
                    postAction();
                    return false;
                };
            } else {
                pushMsg("Player " + unitDesc[units[curCell.dataset.unit - 1].type].name + " fired at Enemy " + unitDesc[enemyunits[enemyat].type].name + " and dealt " + damage + " damage. Enemy " + unitDesc[enemyunits[enemyat].type].name + "'s HP is now " + enemyunits[enemyat].hp + ".");
                actions++;
                postAction();
                return false;
            };
        };
    };
    if(getCell(Number(y) + ymove, Number(x) + xmove)
        .innerHTML !== "") {
        pushMsg("Faulty order!");
        actions++;
        postAction();
        return false;
    };
    curCell.innerHTML = "";
    curCell.className = "cell-unknown";
    getCell((Number(y) + ymove), (Number(x) + xmove))
        .innerHTML = units[curCell.dataset.unit - 1].type;
    getCell((Number(y) + ymove), (Number(x) + xmove))
        .dataset.unit = curCell.dataset.unit;
    units[curCell.dataset.unit - 1].xpos = (Number(x) + xmove);
    units[curCell.dataset.unit - 1].ypos = (Number(y) + ymove);
    delete curCell.dataset.unit;
    updateCells();
    pushMsg("Unit moved!");
    actions++;
    postAction();
};

// Define helper functions/objects

function pushMsg(msg) {
    document.getElementById("dialogue")
        .innerHTML += "<p>" + msg + "</p>";
    document.getElementById("dialogue")
        .scrollTop = document.getElementById("dialogue")
        .scrollHeight;
};

String.prototype.toNormalCase = function() {
    return this.charAt(0)
        .toUpperCase() + this.slice(1);
}

var commands = ["help", "begin", "attack", "configure", "buy"];

function execCmd(event) {
    if(event.keyCode == 13) {
        var cmd = document.querySelectorAll("#action-center > input")[0].value;
        if(cmd == "") {
            return false;
        };
        if(cmd.charAt(0) !== "/") {
            pushMsg("Error: invalid command syntax");
            document.querySelectorAll("#action-center > input")[0].value = "";
            return false;
        };
        var cmdName;
        var params;
        if(cmd.indexOf(" ") == -1) {
            cmdName = cmd.substring(1, cmd.length);
            params = "";
        } else {
            cmdName = cmd.substring(1, cmd.indexOf(" "));
            params = cmd.substring(cmd.indexOf(" ") + 1, cmd.length);
        }
        if(commands.indexOf(cmdName) == -1) {
            pushMsg("Error: No such command " + cmdName.toNormalCase());
        } else {
            window[cmdName](params.split(" "));
        }
        document.querySelectorAll("#action-center > input")[0].value = "";
    };
};

function getCell(row, col) {
    return document.querySelectorAll("#playing-field > div > div#cell-" + row + "-" + col)[0];
};

var unitDesc = {
    "I": {
        strength: 3,
        def: 1,
        vision: 1,
        speed: 1,
        hp: 20,
        accuracy: 0.7,
        name: "Infantry"
    },
    "O": {
        strength: 3,
        def: 2,
        vision: 2,
        speed: 2,
        hp: 20,
        accuracy: 0.8,
        name: "Officer"
    },
    "T": {
        strength: 5,
        def: 3,
        vision: 2,
        speed: 1,
        hp: 35,
        accuracy: 0.75,
        name: "Tank"
    },
    "M": {
        strength: 4,
        def: 2,
        vision: 7,
        speed: 1,
        hp: 10,
        accuracy: 0.85,
        name: "Mortar"
    },
    "S": {
        strength: 2,
        def: 1,
        vision: 3,
        speed: 3,
        hp: 20,
        accuracy: 0.65,
        name: "Scout"
    },
    "A": {
        strength: 7,
        def: 7,
        vision: 5,
        speed: 4,
        hp: 45,
        accuracy: 0.85,
        name: "Airplane"
    },
    "W": {
        strength: 10,
        def: 8,
        vision: 3,
        speed: 3,
        hp: 45,
        accuracy: 0.85,
        name: "Warhead"
    },
    "N": {
        strength: 20,
        def: 2,
        vision: 3,
        speed: 4,
        hp: 20,
        accuracy: 1,
        name: "Nuclear Bomber"
    },
    "Dead": {
        strength: 0,
        def: 0,
        vision: 0,
        speed: 0,
        hp: 0,
        accuracy: 0,
        name: "Dead"
    }
};

function Unit(type, lvl, hp, side, xpos, ypos) {
    this.type = type;
    this.lvl = lvl;
    if(side == undefined) {
        this.side = "player";
    } else {
        this.side = side;
    };
    if(hp == undefined) {
        this.hp = unitDesc[type].hp;
    } else {
        this.hp = hp;
    };
};

function updateCells() {
    var discovered = document.querySelectorAll(".cell-discovered");
    for(var i = 0; i < discovered.length; i++) {
        discovered[i].className = "cell-unknown";
    };
    var enemycell = document.querySelectorAll("[data-enemyunit]");
    for(var i = 0; i < enemycell.length; i++) {
        enemycell[i].className = "cell-unknown";
        enemycell[i].innerHTML = "";
        delete enemycell[i].dataset.enemyunit;
    };
    for(var i = 1; i <= 10; i++) {
        for(var j = 1; j <= 16; j++) {
            if(getCell(i, j)
                .className.indexOf("cell-enemy") !== -1) {
                continue;
            };
            var curCell = unitDesc[getCell(i, j)
                .innerHTML];
            var vision = 0;
            if(curCell !== undefined) {
                vision = curCell.vision;
            };
            var discoveredCells = [];
            if(vision == 1) {
                discoveredCells[discoveredCells.length] = [i - 1, j - 1];
                discoveredCells[discoveredCells.length] = [i - 1, j];
                discoveredCells[discoveredCells.length] = [i - 1, j + 1];
                discoveredCells[discoveredCells.length] = [i, j - 1];
                discoveredCells[discoveredCells.length] = [i, j];
                discoveredCells[discoveredCells.length] = [i, j + 1];
                discoveredCells[discoveredCells.length] = [i + 1, j - 1];
                discoveredCells[discoveredCells.length] = [i + 1, j];
                discoveredCells[discoveredCells.length] = [i + 1, j + 1];
            };
            if(vision == 2) {
                discoveredCells[discoveredCells.length] = [i - 1, j - 1];
                discoveredCells[discoveredCells.length] = [i - 1, j];
                discoveredCells[discoveredCells.length] = [i - 1, j + 1];
                discoveredCells[discoveredCells.length] = [i, j - 1];
                discoveredCells[discoveredCells.length] = [i, j];
                discoveredCells[discoveredCells.length] = [i, j + 1];
                discoveredCells[discoveredCells.length] = [i + 1, j - 1];
                discoveredCells[discoveredCells.length] = [i + 1, j];
                discoveredCells[discoveredCells.length] = [i + 1, j + 1];
                discoveredCells[discoveredCells.length] = [i - 2, j];
                discoveredCells[discoveredCells.length] = [i + 2, j];
                discoveredCells[discoveredCells.length] = [i, j - 2];
                discoveredCells[discoveredCells.length] = [i, j + 2];
                discoveredCells[discoveredCells.length] = [i + 2, j + 2];
                discoveredCells[discoveredCells.length] = [i + 2, j - 2];
                discoveredCells[discoveredCells.length] = [i - 2, j + 2];
                discoveredCells[discoveredCells.length] = [i - 2, j - 2];
                discoveredCells[discoveredCells.length] = [i - 2, j - 1];
                discoveredCells[discoveredCells.length] = [i - 2, j + 1];
                discoveredCells[discoveredCells.length] = [i + 2, j - 1];
                discoveredCells[discoveredCells.length] = [i + 2, j + 1];
                discoveredCells[discoveredCells.length] = [i - 1, j - 2];
                discoveredCells[discoveredCells.length] = [i + 1, j - 2];
                discoveredCells[discoveredCells.length] = [i - 1, j + 2];
                discoveredCells[discoveredCells.length] = [i + 1, j + 2];
            };
            for(var k = 0; k < discoveredCells.length; k++) {
                if(!((discoveredCells[k])[0] <= 0 || (discoveredCells[k])[1] <= 0)) {
                    if(getCell((discoveredCells[k])[0], (discoveredCells[k])[1])) {
                        var isenemy = false;
                        for(var l = 0; l < enemyunits.length; l++) {
                            if(enemyunits[l].xpos == (discoveredCells[k])[1] && enemyunits[l].ypos == (discoveredCells[k])[0]) {
                                isenemy = l;
                                break;
                            };
                        };
                        if(isenemy !== false) {
                            getCell((discoveredCells[k])[0], (discoveredCells[k])[1])
                                .className = "cell-enemy";
                            getCell((discoveredCells[k])[0], (discoveredCells[k])[1])
                                .innerHTML = enemyunits[isenemy].type;
                            getCell((discoveredCells[k])[0], (discoveredCells[k])[1])
                                .dataset.enemyunit = isenemy;
                        } else {
                            getCell((discoveredCells[k])[0], (discoveredCells[k])[1])
                                .className = "cell-discovered";
                        };
                    };
                };
            };
        };
    };
};

function checkEnemyCell(col, row) {
    var violated = false;
    if(col <= 0 || col > 10 || row <= 0 || row > 16) {
        return true;
    };
    for(var i = 0; i < enemyunits.length; i++) {
        if(enemyunits[i].xpos == col && enemyunits[i].ypos == row) {
            violated = true;
            break;
        };
    };
    return violated;
};

function enemyTurn(times) {
    var unitnum;
    var dirnum;
    var stepsnum;
    if(enemyunits.length == 4) {
        unitnum = Math.floor(Math.random() * 4) + 1;
    } else {
        unitnum = Math.floor(Math.random() * 9) + 1;
    };
    var spotted = [];
    for(var i = 0; i < enemyunits.length; i++) {
        var enemyvision = unitDesc[enemyunits[i].type].vision;
        for(var j = 0; j < units.length; j++) {
            if(Math.abs(units[j].xpos - enemyunits[i].xpos) <= enemyvision && Math.abs(units[j].ypos - enemyunits[i].ypos) <= enemyvision) {
                spotted[spotted.length] = [enemyunits[i], units[j], j];
            };
        };
    };
    if(spotted.length !== 0) {
        var greatest = 0;
        for(var i = 0; i < spotted.length; i++) {
            if(unitDesc[(spotted[i])[0].type].strength > greatest) {
                greatest = i;
            };
        };
        var crit = Math.random();
        var multiplier;
        if(crit < 0.35) {
            multiplier = (Math.random() * 0.5) + 0.5;
        } else if(crit >= 0.35 && crit < 0.85) {
            multiplier = (Math.random() * 1.6) + 1;
        } else {
            multiplier = (Math.random() * 1.2) + 2.6;
        };
        var defense = (Math.random() * (unitDesc[(spotted[greatest])[1].type].speed * 1.5 - unitDesc[(spotted[greatest])[1].type].speed * 0.5) + unitDesc[(spotted[greatest])[1].type].speed * 0.5);
        var damage = ((unitDesc[(spotted[greatest])[0].type].strength * multiplier) - (unitDesc[(spotted[greatest])[1].type].def * defense))
            .toFixed(2);
        if(Math.random() + (unitDesc[(spotted[greatest])[1].type].speed * (Math.random() * 0.1)) > unitDesc[(spotted[greatest])[0].type].accuracy || damage <= 0) {
            pushMsg("Enemy " + unitDesc[(spotted[greatest])[0].type].name + " spotted Player " + unitDesc[(spotted[greatest])[1].type].name + " and tried to fire, but missed.");
        } else {
            units[(spotted[greatest])[2]].hp = (units[(spotted[greatest])[2]].hp - damage)
                .toFixed(2);
            if(units[(spotted[greatest])[2]].hp <= 0) {
                pushMsg("Enemy " + unitDesc[(spotted[greatest])[0].type].name + " fired at Player " + unitDesc[(spotted[greatest])[1].type].name + ", <b>who was destroyed</b> after receiving " + damage + " damage.");
                document.querySelectorAll("[data-unit='" + ((spotted[greatest])[2] + 1) + "']")[0].innerHTML = "";
                delete document.querySelectorAll("[data-unit='" + ((spotted[greatest])[2] + 1) + "']")[0].dataset.unit;
                units[(spotted[greatest])[2]] = new Unit("Dead", 0, 0, "none", 0, 0);
                updateCells();
                var eliminated = true;
                for(var j = 0; j < units.length; j++) {
                    if(units[j].type !== "Dead") {
                        eliminated = false;
                        break;
                    };
                };
                if(eliminated) {
                    battle = false;
                    turn = false;
                    pushMsg("<b>The enemies won the battle!</b>");
                    for(var j = 0; j < enemyunits.length; j++) {
                        getCell(enemyunits[j].ypos, enemyunits[j].xpos)
                            .className = "cell-enemy";
                        getCell(enemyunits[j].ypos, enemyunits[j].xpos)
                            .innerHTML = enemyunits[j].type;
                    };
                    return false;
                };
            } else {
                pushMsg("Enemy " + unitDesc[(spotted[greatest])[0].type].name + " spotted Player " + unitDesc[(spotted[greatest])[1].type].name + " and dealt " + damage + " damage. Player " + unitDesc[(spotted[greatest])[1].type].name + "'s HP is now " + units[(spotted[greatest])[2]].hp + ".");
            };
        };
        playerTurn();
        return false;
    };
    dirnum = (Math.random() * 2);
    stepsnum = Math.floor(Math.random() * unitDesc[enemyunits[unitnum - 1].type].speed) + 1;
    if(dirnum <= 0.6) {
        if(!checkEnemyCell(enemyunits[unitnum - 1].xpos - stepsnum, enemyunits[unitnum - 1].ypos)) {
            enemyunits[unitnum - 1].xpos = enemyunits[unitnum - 1].xpos - stepsnum;
            playerTurn();
        } else {
            if(times !== 4) {
                enemyTurn(times++);
                return false;
            } else {
                playerTurn();
            };
        };
    } else if(dirnum > 0.6 && dirnum <= 1.2) {
        if(!checkEnemyCell(enemyunits[unitnum - 1].xpos, enemyunits[unitnum - 1].ypos - stepsnum)) {
            enemyunits[unitnum - 1].ypos = enemyunits[unitnum - 1].ypos - stepsnum;
            playerTurn();
        } else {
            if(times !== 4) {
                enemyTurn(times++);
                return false;
            } else {
                playerTurn();
            };
        };
    } else {
        var secondsteps = Math.floor(Math.random() * unitDesc[enemyunits[unitnum - 1].type].speed) + 1
        if(!checkEnemyCell(enemyunits[unitnum - 1].xpos - stepsnum, enemyunits[unitnum - 1].ypos - secondsteps)) {
            enemyunits[unitnum - 1].xpos = enemyunits[unitnum - 1].xpos - stepsnum;
            enemyunits[unitnum - 1].ypos = enemyunits[unitnum - 1].ypos - secondsteps;
            playerTurn();
        } else {
            if(times !== 4) {
                enemyTurn(times++);
                return false;
            } else {
                playerTurn();
            };
        };
    };
};

var units = [];
var enemyunits = [];

var turn = null;
var actions = 0;
var apt = 1;

function postAction() {
    if(actions = apt) {
        turn = "enemy";
        actions = 0;
        pushMsg("Turn over!");
        pushMsg("Enemy moving...");
        enemyTurn(0);
    } else {
        pushMsg("You have " + (apt - actions) + " moves left");
    };
};

function playerTurn() {
    setTimeout(function() {
        turn = "player";
        pushMsg("Enemy turn over!");
        pushMsg("Your turn!");
    }, 500);
};

// Initialize playing field + grid

for(var i = 0; i < 10; i++) {
    var sixteencells = "";
    for(var j = 0; j < 16; j++) {
        sixteencells += "<div class = 'cell-unknown' id = 'cell-" + (10 - i) + "-" + (j + 1) + "'></div>";
    };
    document.getElementById("playing-field")
        .innerHTML += "<div id = 'row-" + (10 - i) + "'>" + sixteencells + "</div>";
};

var startPos = [new Unit("I", 1, 20), new Unit("I", 1, 20), new Unit("I", 1), new Unit("I", 1, 20), new Unit("I", 1, 20), new Unit("I", 1, 20), new Unit("I", 1), new Unit("I", 1, 20), new Unit("O", 1, 20)];
var rowsCovered = 1;
for(var i = 1; i <= 9; i++) {
    if(i == 3 || i == 6 || i == 9) {
        getCell(rowsCovered, (i / rowsCovered))
            .innerHTML = startPos[i - 1].type;
        getCell(rowsCovered, (i / rowsCovered))
            .className = "cell-discovered";
        getCell(rowsCovered, (i / rowsCovered))
            .dataset.unit = i;
        units[units.length] = startPos[i - 1];
        units[units.length - 1].xpos = i / rowsCovered;
        units[units.length - 1].ypos = rowsCovered;
        rowsCovered++;
    } else {
        getCell(rowsCovered, (i % 3))
            .innerHTML = startPos[i - 1].type;
        getCell(rowsCovered, (i % 3))
            .className = "cell-discovered";
        getCell(rowsCovered, (i % 3))
            .dataset.unit = i;
        units[units.length] = startPos[i - 1];
        units[units.length - 1].xpos = i % 3;
        units[units.length - 1].ypos = rowsCovered;
    };
};
var enemyPos = [new Unit("I", 1, 20, "enemy"), new Unit("I", 1, 20, "enemy"), new Unit("I", 1, 20, "enemy"), new Unit("I", 1, 20, "enemy")];
if(enemyPos.length == 4) {
    getCell(9, 15)
        .className = "cell-enemy";
    getCell(9, 16)
        .className = "cell-enemy";
    getCell(10, 15)
        .className = "cell-enemy";
    getCell(10, 16)
        .className = "cell-enemy";
    enemyunits[0] = enemyPos[0];
    enemyunits[0].xpos = 15;
    enemyunits[0].ypos = 9;
    enemyunits[1] = enemyPos[1];
    enemyunits[1].xpos = 16;
    enemyunits[1].ypos = 9;
    enemyunits[2] = enemyPos[2];
    enemyunits[2].xpos = 15;
    enemyunits[2].ypos = 10;
    enemyunits[3] = enemyPos[3];
    enemyunits[3].xpos = 16;
    enemyunits[3].ypos = 10;
} else {
    getCell(8, 14)
        .className = "cell-enemy";
    getCell(8, 15)
        .className = "cell-enemy";
    getCell(8, 16)
        .className = "cell-enemy";
    getCell(9, 14)
        .className = "cell-enemy";
    getCell(9, 15)
        .className = "cell-enemy";
    getCell(9, 16)
        .className = "cell-enemy";
    getCell(10, 14)
        .className = "cell-enemy";
    getCell(10, 15)
        .className = "cell-enemy";
    getCell(10, 16)
        .className = "cell-enemy";
    enemyunits[0] = enemyPos[0];
    enemyunits[0].xpos = 14;
    enemyunits[0].ypos = 8;
    enemyunits[1] = enemyPos[1];
    enemyunits[1].xpos = 15;
    enemyunits[1].ypos = 8;
    enemyunits[2] = enemyPos[2];
    enemyunits[2].xpos = 16;
    enemyunits[2].ypos = 8;
    enemyunits[3] = enemyPos[3];
    enemyunits[3].xpos = 14;
    enemyunits[3].ypos = 9;
    enemyunits[0] = enemyPos[4];
    enemyunits[0].xpos = 15;
    enemyunits[0].ypos = 9;
    enemyunits[1] = enemyPos[5];
    enemyunits[1].xpos = 16;
    enemyunits[1].ypos = 9;
    enemyunits[2] = enemyPos[6];
    enemyunits[2].xpos = 14;
    enemyunits[2].ypos = 10;
    enemyunits[3] = enemyPos[7];
    enemyunits[3].xpos = 15;
    enemyunits[3].ypos = 10;
    enemyunits[0] = enemyPos[8];
    enemyunits[0].xpos = 16;
    enemyunits[0].ypos = 10;
};

updateCells();

// Initialize action center

pushMsg("Welcome to the Online Combat Simulator v0.9");
pushMsg("Progress: Level 1 (0/100 XP until Level 2)")
pushMsg("Your army: 8 Infantry 1 Officer");
pushMsg("Type /help to access a list of commands");

// Battle initialization

var battle = false;

function begin() {
    if(battle) {
        pushMsg("You are already in a battle");
        return false;
    };
    var enemies = document.querySelectorAll(".cell-enemy");
    for(var i = 0; i < enemies.length; i++) {
        enemies[i].className = "cell-unknown";
    };
    pushMsg("Battle has begun!");
    pushMsg("Enemy roster: 4 Infantry");
    pushMsg("Actions per Turn: " + apt);
    pushMsg("Your turn!");
    turn = "player";
    battle = true;
};