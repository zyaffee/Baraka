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
}


// random number from min to max inclusive
const randomRange = (min, max) => {
    return Math.floor(Math.random() * (max + 1 - min) + min)
}


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
        console.log(marchingUnits)
    }
    else {
        e.target.style.borderColor = 'black'
        let index = marchingUnits.indexOf(e.target.classList.value)
        marchingUnits.splice(index, 1)
        console.log(marchingUnits)
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
    if (terrClickState !== 'muster-select') {
        terrClickState = 'muster-select'
    }
}

const sowFunction = () => {
    if (terrClickState !== 'sow-select') {
        terrClickState = 'sow-select'
    }
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
                territoryClicked.owner = territoryStored.owner
                cancelFunction()
            }
            break
        case ('muster'):
            break
        case ('sow'):
            break
    }
}


const unitsMarchIn = () => {

    // move marching units from origin territory unitsPresent list to corresponding destination
    marchingUnits.forEach(marcher => {
        index = territoryStored.unitsPresent.map(unit => {return unit.type}).indexOf(marcher)
        territoryClicked.unitsPresent.push(territoryStored.unitsPresent.splice(index, 1)[0])

        // reflect above change in the DOM
        territoryClickedDOM.appendChild(territoryStoredDOM.querySelector(`.${marcher}`))
    })
}


// handles when territory is clicked
const territoryClick = (e) => {
    // Get territory's ID and convert into usable coordinates
    let mapIdString = e.target.getAttribute('id')
    let coordinates = [parseInt(mapIdString[0]), parseInt(mapIdString[3])]

    // get territory object and DOM element
    territoryClicked = gameMap[1].find((territory) => {
        return (territory.mapId[0] === coordinates[0] && territory.mapId[1] === coordinates[1])
    })
    territoryClickedDOM = e.target
    console.log(territoryClickedDOM)

    // get list of player Priests
    playerPriests = player.units.filter(unit => {
        if (unit.type === 'priest') {
            return unit
        }
    })

    switch (terrClickState) {

        // At the start of the game you choose two territories and place priests there
        case ('start-game'):territoryClicked
            // create a Priest
            let priestObj = new Unit('priest', coordinates)
            priestObj.owner = player.playerId
            priestObj.strength = 1
            priestObj.upkeepCost = 1

            // add priest object to territory object and player's lists of units
            territoryClicked.owner = player.playerId
            territoryClicked.unitsPresent.push(priestObj)
            player.units.push(priestObj)

            // create priest DOM element and add to territory div
            const priestDOM = document.createElement('div')
            priestDOM.classList.add('priest')
            e.target.appendChild(priestDOM)

            // check if start-of-game is over
            if (player.units.length >= 3) {
                // change the clicking switch
                terrClickState = 'main-game'

                // clear the starting text from action menu
                while (menuDiv.firstChild) {
                    menuDiv.removeChild(menuDiv.firstChild)
                }
            }
            break

        // neutral state of game waiting for player input
        case ('main-game'):
            if (territoryClicked.owner === player.playerId) {
                while (menuDiv.firstChild) {
                    menuDiv.removeChild(menuDiv.firstChild)
                }
                territoryStored = territoryClicked
                territoryStoredDOM = territoryClickedDOM
                menuDiv.innerText = 'Select a Command\n\n'
                menuDiv.appendChild(marchButton)
                menuDiv.appendChild(musterButton)
                menuDiv.appendChild(sowButton)
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

        default:
            break
    }
}


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
let playerPriests = 0
let marchingUnits = []
let confirm = ''


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
                territoryObj.unitsPresent.push(peasantObj)
            }

            // add new territory DOM element and object to their respective collections
            mapRow.appendChild(territoryDiv)
            mapArray.push(territoryObj)
        }

        // append new row of territories to the game map
        gameMapDOM.appendChild(mapRow)
    }
    return [gameMapDOM, mapArray]
}


// Create Starting State
const gameMap = createMap()
// const mapDOM = gameMap[0]
// let mapArray = gameMap[1]


// // creates and adds lists of adjacent territories to each territory
// gameMap[1].forEach(territoryClicked => {
//     gameMap[1].forEach(territoryStored => {
//         if (isAdjacent(territoryClicked, territoryStored) && !territoryClicked.adjacents.includes(territoryStored)) {
//             territoryClicked.adjacents.push(territoryStored)
//         }
//     })
// })

console.log(gameMap)
mapDiv.appendChild(gameMap[0])