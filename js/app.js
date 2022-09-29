// player object
let player = {
    playerId: 'player1',
    territories: [],
    units: [],
    commandsRemaining: 0
}


// combat dice
const dice = {
    '055555': [0, 5, 5, 5, 5, 5],
    '116666': [1, 1, 6, 6, 6, 6],
    '222777': [2, 2, 2, 7, 7, 7],
    '333388': [3, 3, 3, 3, 8, 8],
    '444449': [4, 4, 4, 4, 4, 9],
    roll: function (formation) {
        return dice[formation][randomRange(0, 5)]
    }
}


// turn counter
let turnCount = 0


// territory click state
let terrClickState = 'start-game'


// class for each map node
class Territory {
    constructor(mapId, nativePop, food) {
        this.mapId = mapId,
            this.nativePop = nativePop,
            this.food = food
    }
    owner = ''
    unitsPresent = []
    domObject = null
    // adjacents = []
}


// base class of all units
class Unit {
    constructor(type, location) {
        this.type = type,
            this.location = location
    }
    owner = ''
    strength = 0
    upkeepCost = 0
    powers = []
    fatigued = false
    domObject = null
}


// random number from min to max inclusive
const randomRange = (min, max) => {
    return Math.floor(Math.random() * (max + 1 - min) + min)
}

//You have great comments throughout your code!
// check if two territory objects are adjacent
const isAdjacent = (terr1, terr2) => {
    if (terr1.mapId[0] === terr2.mapId[0]) {
        if (Math.abs(terr1.mapId[1] - terr2.mapId[1]) === 1) {
            return true
        }
    }
    if (terr1.mapId[1] === terr2.mapId[1]) {
        if (Math.abs(terr1.mapId[0] - terr2.mapId[0]) === 1) {
            return true
        }
    }
    if (Math.abs(terr1.mapId[0] - terr2.mapId[0]) === 1 && Math.abs(terr1.mapId[1] - terr2.mapId[1]) === 1) {
        return true
    }
    return false
}


const highlightSelect = (e) => {
    if (e.target.style.borderColor !== 'yellow') {
        e.target.style.borderColor = 'yellow'
        marchingUnits.push(e.target.classList.value)
    }
    else {
        e.target.style.borderColor = 'black'
        let index = marchingUnits.indexOf(e.target.classList.value)
        marchingUnits.splice(index, 1)
    }
}


const marchSwitch = () => {
    if (terrClickState !== 'march-select') {
        terrClickState = 'march-select'
        while (menuDiv.firstChild) {
            menuDiv.removeChild(menuDiv.firstChild)
        }
        menuDiv.innerText = "Where do you want to march?\n\n"
        menuDiv.appendChild(cancelButton)
    }
}

const musterFunction = () => {
    const musterPriestButton = document.createElement('button')
    musterPriestButton.innerText = 'Muster Priest'
    musterPriestButton.addEventListener('click', musterPriest)

    const musterSoldierButton = document.createElement('button')
    musterSoldierButton.innerText = 'Muster Soldier'
    musterSoldierButton.addEventListener('click', musterSoldier)

    while (menuDiv.firstChild) {
        menuDiv.removeChild(menuDiv.firstChild)
    }
    menuDiv.innerText = '\nChoose to train a Priest or a Soldier\n'
    menuDiv.appendChild(musterPriestButton)
    menuDiv.appendChild(musterSoldierButton)
    menuDiv.appendChild(cancelButton)
}


const musterPriest = () => {

    // turn a peasant into a priest
    index = territoryStored.unitsPresent.map(unit => { return unit.type }).indexOf('peasant')
    territoryStoredDOM.removeChild(territoryStored.unitsPresent[index].domObject)
    territoryStored.unitsPresent.splice(index, 1)
    let newPriestObj = new Unit('priest', territoryStored.mapId)
    newPriestObj.owner = player.playerId
    newPriestObj.strength = 1
    newPriestObj.upkeepCost = 1
    newPriestObj.domObject = document.createElement('div')
    newPriestObj.domObject.classList.add('priest')
    territoryStoredDOM.appendChild(newPriestObj.domObject)
    territoryStored.unitsPresent.push(newPriestObj)
    cancelFunction()
}

const musterSoldier = () => {

    // turn a peasant into a soldier
    index = territoryStored.unitsPresent.map(unit => { return unit.type }).indexOf('peasant')
    territoryStoredDOM.removeChild(territoryStored.unitsPresent[index].domObject)
    territoryStored.unitsPresent.splice(index, 1)
    let newSoldierObj = new Unit('soldier', territoryStored.mapId)
    newSoldierObj.owner = player.playerId
    newSoldierObj.strength = 2
    newSoldierObj.upkeepCost = 1
    newSoldierObj.domObject = document.createElement('div')
    newSoldierObj.domObject.classList.add('soldier')
    territoryStoredDOM.appendChild(newSoldierObj.domObject)
    territoryStored.unitsPresent.push(newSoldierObj)
    cancelFunction()
}


const sowFunction = () => {
    // Create peasant DOM element and append to territory
    const peasantDOM = document.createElement('div')
    peasantDOM.classList.add('peasant')
    territoryStoredDOM.appendChild(peasantDOM)

    // create peasant unit and append to territory's unitsPresent
    let peasantObj = new Unit('peasant', territoryStored.mapId)
    peasantObj.domObject = peasantDOM
    territoryStored.unitsPresent.push(peasantObj)

    // restore land
    territoryStored.food += 2

    cancelFunction()
    menuDiv.innerText = 'The land has regenerated and peasants have returned.'

}

const cancelFunction = () => {
    territoryStored = null
    territoryStoredDOM = null
    territoryClicked = null
    territoryClickedDOM = null
    terrClickState = 'main-game'
    while (menuDiv.firstChild) {
        menuDiv.removeChild(menuDiv.firstChild)
    }
}

const confirmFunction = () => {
    switch (confirm) {
        case ('march'):
            if (marchingUnits.length === 0) {
                cancelFunction()
                menuDiv.innerText = 'You cannot assign zero units to march.'
                break
            }
            if (!territoryClicked.owner || territoryStored.owner === territoryClicked.owner) {
                // move em in
                unitsMarchIn()
                cancelFunction()
            }
            else {
                unitsFight()
            }
            break
        case ('muster'):
            break
    }
}


const unitsMarchIn = () => {

    // move marching units from origin territory unitsPresent list to corresponding destination
    marchingUnits.forEach(marcher => {
        index = territoryStored.unitsPresent.map(unit => { return unit.type }).indexOf(marcher)
        territoryClicked.unitsPresent.push(territoryStored.unitsPresent.splice(index, 1)[0])

        // reflect above change in the DOM
        territoryClickedDOM.appendChild(territoryStoredDOM.querySelector(`.${marcher}`))
    })
    territoryClicked.owner = territoryStored.owner
    territoryClickedDOM.style.borderColor = territoryStoredDOM.style.borderColor
}


const unitsFight = () => {
    attackingStr = 0
    defendingStr = 0

    // tally strength of attacking and defending units,
    // needs rewriting if more unit types exist or variable strength on units
    marchingUnits.forEach(marcher => {
        if (marcher === 'priest') {
            attackingStr++
        }
        else {
            attackingStr += 2
        }
    })
    territoryClicked.unitsPresent.forEach(defender => {
        if (defender.type === 'priest') {
            defendingStr++
        }
        else if (defender.type === 'soldier') {
            defendingStr += 2
        }
    })

    while (menuDiv.firstChild) {
        menuDiv.removeChild(menuDiv.firstChild)
    }
    menuDiv.innerText = 'Select a combat formation. Each formation is a die with special faces. Some dice have advantages over others, but none is best. The computer will always choose the same die.\n\n'
    for (const die in dice) {
        if (parseInt(die)) {
            let dieButton = document.createElement('button')
            dieButton.innerText = `${die}`
            dieButton.addEventListener('click', () => {
                diceRoll = dice.roll(die)
                enemyRoll = dice.roll('222777')
                fightResult(attackingStr, defendingStr)
            })
            menuDiv.appendChild(dieButton)
        }
    }
}

const fightResult = (att, def) => {
    while (menuDiv.firstChild) {
        menuDiv.removeChild(menuDiv.firstChild)
    }
    let verbage = ''
    if (diceRoll > enemyRoll) {
        let baseAtt = att
        att *= 2
        verbage = `\nYour attackers had a strength of ${baseAtt}\nYou rolled a ${diceRoll}\nThe defenders had a strength of ${def}\nThey rolled a ${enemyRoll}\nYou win the die roll, doubling your strength to ${att}!`
    }
    else {
        let baseDef = def
        def *= 2
        verbage = `\nYour attackers had a strength of ${att}\nYou rolled a ${diceRoll}\nThe defenders had a strength of ${baseDef}\nThey rolled a ${enemyRoll}\nYour enemy wins the die roll, doubling their strength to ${def}!`
    }
    if (att > def) {
        menuDiv.innerText = `${verbage}\nYou win the battle.\nYour enemies are slain to the last.`

        // kill the defending unit objects and reflect in DOM
        territoryClicked.unitsPresent = territoryClicked.unitsPresent.filter(unit => {
            if (unit.owner === 'enemy') {
                territoryClickedDOM.removeChild(unit.domObject)
            }
            else {
                return true
            }
        })
        unitsMarchIn()
    }
    else if (def > att) {
        menuDiv.innerText = `${verbage}\nYou lose the battle.\nYour followers are slain to the last.`
        marchingUnits.forEach(marcher => {

            // kill the attacking unit objects
            index = territoryStored.unitsPresent.map(unit => { return unit.type }).indexOf(marcher)
            territoryStored.unitsPresent.splice(index, 1)

            // reflect above change in the DOM
            territoryStoredDOM.removeChild(territoryStoredDOM.querySelector(`.${marcher}`))
        })
    }
    territoryStored = null
    territoryStoredDOM = null
    territoryClicked = null
    territoryClickedDOM = null
    terrClickState = 'main-game'
}


// handles when territory is clicked
const territoryClick = (e) => {

    // Get territory's ID and convert into usable coordinates
    let mapIdString = e.target.getAttribute('id')
    if (!mapIdString) { return } //avoids error from clicking on unit divs
    let coordinates = [parseInt(mapIdString[0]), parseInt(mapIdString[3])]

    // get territory object and DOM element
    territoryClicked = gameMap[1].find((territory) => {
        return (territory.mapId[0] === coordinates[0] && territory.mapId[1] === coordinates[1])
    })
    territoryClickedDOM = e.target

    switch (terrClickState) {

        // At the start of the game you choose two territories and place priests there
        case ('start-game'):
            // create a Priest
            let priestObj = new Unit('priest', coordinates)
            priestObj.owner = player.playerId
            priestObj.strength = 1
            priestObj.upkeepCost = 1

            // add priest object to territory object and player's lists of units
            territoryClicked.owner = player.playerId
            territoryClickedDOM.style.borderColor = 'purple'
            territoryClicked.unitsPresent.push(priestObj)
            player.units.push(priestObj)

            // create priest DOM element and add to territory div
            const priestDOM = document.createElement('div')
            priestDOM.classList.add('priest')
            priestObj.domObject = priestDOM
            e.target.appendChild(priestDOM)

            // check if start-of-game is over
            if (player.units.length >= 3) {
                // change the clicking switch
                terrClickState = 'main-game'

                // TODO create enemy units and place in territory
                enemyTerritory = gameMap[1].find(territory => !territory.owner)
                enemyTerritory.owner = 'enemy'
                for (i = 0; i < randomRange(1, 2); i++) {
                    let enemySoldier = new Unit('soldier', enemyTerritory.mapId)
                    enemySoldier.owner = 'enemy'
                    enemySoldier.strength = 2
                    enemySoldier.upkeepCost = 1
                    let soldierDOM = document.createElement('div')
                    soldierDOM.classList.add('soldier')
                    enemySoldier.domObject = soldierDOM
                    enemyTerritory.unitsPresent.push(enemySoldier)
                    enemyTerritory.domObject.appendChild(soldierDOM)
                }
                let ePriest = new Unit('priest', enemyTerritory.mapId)
                ePriest.owner = 'enemy'
                ePriest.strength = 1
                ePriest.upkeepCost = 1
                let ePriestDOM = document.createElement('div')
                ePriestDOM.classList.add('priest')
                ePriest.domObject = ePriestDOM
                enemyTerritory.unitsPresent.push(ePriest)
                enemyTerritory.domObject.appendChild(ePriestDOM)
                enemyTerritory.domObject.style.borderColor = 'red'


                // clear the starting text from action menu
                while (menuDiv.firstChild) {
                    menuDiv.removeChild(menuDiv.firstChild)
                }
            }
            break

        // neutral state of game waiting for player input
        case ('main-game'):

            let gameOverPlayer1 = true
            let gameOverEnemy = true
            gameMap[1].forEach(territory => {
                if (territory.unitsPresent.map(unit => { return unit.owner }).includes('player1')) {
                    gameOverPlayer1 = false
                }
                if (territory.unitsPresent.map(unit => { return unit.owner }).includes('enemy')) {
                    gameOverEnemy = false
                }
            })

            if (gameOverPlayer1) {
                terrClickState = 'player-loses'
                territoryClick(e)
            }
            if (gameOverEnemy) {
                terrClickState = 'player-wins'
                territoryClick(e)
            }

            if (territoryClicked.owner === player.playerId) {
                while (menuDiv.firstChild) {
                    menuDiv.removeChild(menuDiv.firstChild)
                }
                territoryStored = territoryClicked
                territoryStoredDOM = territoryClickedDOM
                menuDiv.innerText = 'Select a Command\n\n'
                let unitsInClicked = territoryClicked.unitsPresent.map(unit => { return unit.type })
                if (unitsInClicked.includes('priest') || unitsInClicked.includes('soldier')) {
                    menuDiv.appendChild(marchButton)
                }
                if (unitsInClicked.includes('priest') && unitsInClicked.includes('peasant')) {
                    menuDiv.appendChild(musterButton)
                }
                if (unitsInClicked.includes('peasant')) {
                    menuDiv.appendChild(sowButton)
                }
            }
            else {
                while (menuDiv.firstChild) {
                    menuDiv.removeChild(menuDiv.firstChild)
                }
                menuDiv.innerText = "Select a territory you control to give a command."
            }
            break

        // state of game after clicking march when you select where to march
        case ('march-select'):
            // check if march is spacially valid
            if (territoryStored.mapId[0] === territoryClicked.mapId[0] && territoryStored.mapId[1] === territoryClicked.mapId[1]) {
                while (menuDiv.firstChild) {
                    menuDiv.removeChild(menuDiv.firstChild)
                }
                menuDiv.innerText = "You're already there.\nWhere do you want to march instead?\n\n"
                menuDiv.appendChild(cancelButton)
            }
            else if (!isAdjacent(territoryStored, territoryClicked)) {
                while (menuDiv.firstChild) {
                    menuDiv.removeChild(menuDiv.firstChild)
                }
                menuDiv.innerText = "That's too far.\nWhere do you want to march instead?\n\n"
                menuDiv.appendChild(cancelButton)
            }

            // ask how many are marching
            else {
                while (menuDiv.firstChild) {
                    menuDiv.removeChild(menuDiv.firstChild)
                }
                terrClickState = ''
                menuDiv.innerText = "Click to add or remove units from the march.\n\n"
                let marchers = territoryStored.unitsPresent.filter(unit => {
                    if (unit.owner === 'player1') {
                        return unit
                    }
                })

                // display potential marching units for selection
                marchingUnits = []
                marchers.forEach(marcher => {
                    const selectable = document.createElement('div')
                    selectable.classList.add(marcher.type)
                    selectable.addEventListener('click', highlightSelect)
                    menuDiv.appendChild(selectable)
                })
                confirm = 'march'
                menuDiv.appendChild(confirmButton)
                menuDiv.appendChild(cancelButton)

            }
            break

        case ('player-loses'):
            while (menuDiv.firstChild) {
                menuDiv.removeChild(menuDiv.firstChild)
            }
            while (mapDiv.firstChild) {
                mapDiv.removeChild(mapDiv.firstChild)
            }
            mapDiv.innerText = 'YOU LOSE'
            break

        case ('player-wins'):
            while (menuDiv.firstChild) {
                menuDiv.removeChild(menuDiv.firstChild)
            }
            while (mapDiv.firstChild) {
                mapDiv.removeChild(mapDiv.firstChild)
            }
            mapDiv.innerText = 'YOU WIN'
            break
        default:
            break
    }
}

//It makes your file a little more organized if you place your variable declarations at the top
const mapDiv = document.getElementById('Game-Map')
const menuDiv = document.getElementById('Action-Menu')
const statusDiv = document.getElementById('Status-Bar')

const marchButton = document.createElement('button')
marchButton.classList.add('command')
marchButton.innerText = 'MARCH'
marchButton.addEventListener('click', marchSwitch)

const musterButton = document.createElement('button')
musterButton.classList.add('command')
musterButton.innerText = 'MUSTER'
musterButton.addEventListener('click', musterFunction)

const sowButton = document.createElement('button')
sowButton.classList.add('command')
sowButton.innerText = 'SOW'
sowButton.addEventListener('click', sowFunction)

const cancelButton = document.createElement('button')
cancelButton.classList.add('command')
cancelButton.innerText = 'CANCEL'
cancelButton.addEventListener('click', cancelFunction)

const confirmButton = document.createElement('button')
confirmButton.classList.add('command')
confirmButton.innerText = 'CONFIRM'
confirmButton.addEventListener('click', confirmFunction)

let territoryStored = null
let territoryStoredDOM = null
let territoryClicked = null
let territoryClickedDOM = null
let marchingUnits = []
let confirm = ''
let attackingStr = 0
let defendingStr = 0
diceRoll = 0
enemyRoll = 0



// random map generation, returns both DOM element and array of territory objects
const createMap = () => {
    // create the game map top level DOM element
    const gameMapDOM = document.createElement('div')
    gameMapDOM.setAttribute('id', 'Game-Map')
    gameMapDOM.style.borderRadius = '25px'

    // an array of all Territories
    let mapArray = []

    // create each row of territories in map
    for (let i = 0; i < randomRange(4, 7); i++) {
        const mapRow = document.createElement('div')
        mapRow.classList.add('map-row')

        // create each territory DOM element in this row
        for (let j = 0; j < randomRange(1, 5); j++) {

            // Create territory DOM element
            const territoryDiv = document.createElement('div')
            territoryDiv.classList.add('territory')
            territoryDiv.setAttribute('id', `${j}, ${i}`)
            territoryDiv.addEventListener('click', territoryClick)

            // Create territory object
            const territoryObj = new Territory([j, i], randomRange(2, 4), randomRange(4, 6))

            // Populate territory with initial peasant population
            for (let k = 0; k < territoryObj.nativePop; k++) {
                // Create peasant DOM element and append to territory
                const peasantDOM = document.createElement('div')
                peasantDOM.classList.add('peasant')
                territoryDiv.appendChild(peasantDOM)

                // create peasant unit and append to territory's unitsPresent
                let peasantObj = new Unit('peasant', [j, i])
                peasantObj.domObject = peasantDOM
                territoryObj.unitsPresent.push(peasantObj)
            }

            // make life easier
            territoryObj.domObject = territoryDiv

            // add new territory DOM element and object to their respective collections
            mapRow.appendChild(territoryDiv)
            mapArray.push(territoryObj)

            // save this for later
            lastTerritory = [j + 1, i + 1]
        }

        // append new row of territories to the game map
        gameMapDOM.appendChild(mapRow)
    }
    return [gameMapDOM, mapArray]
}


// Create Starting State of Game + one enemy territory
const gameMap = createMap()


// // creates and adds lists of adjacent territories to each territory
// gameMap[1].forEach(territoryClicked => {
//     gameMap[1].forEach(territoryStored => {
//         if (isAdjacent(territoryClicked, territoryStored) && !territoryClicked.adjacents.includes(territoryStored)) {
//             territoryClicked.adjacents.push(territoryStored)
//         }
//     })
// })

mapDiv.appendChild(gameMap[0])
