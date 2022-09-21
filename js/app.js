const map = document.getElementById('Game-Map')

// player object
let player = {
    playerID: 'player1',
    territories: [],
    units: [],
    commandsRemaining: 0
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
    adjacents = []
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
        } else {
            return false
        }
    }
    if (terr1.mapId[1] === terr2.mapId[1]) {
        if (Math.abs(terr1.mapId[0] - terr2.mapId[0]) === 1) {
            return true
        } else {
            return false
        }
    }

    return false
}


// handles when territory is clicked
const territoryClick = (e) => {
    switch (terrClickState) {
        case ('start-game'):
            let mapIdString = e.target.getAttribute('id')
            let coordinates = [parseInt(mapIdString[0], 10), parseInt(mapIdString[3], 10)]
            let priestObj = new Unit('priest', coordinates)
            priestObj.owner = player.playerID
            priestObj.strength = 1
            priestObj.upkeepCost = 1
            gameMap[1].forEach(element => { console.log(element.mapId) })
            console.log(coordinates)
            let territoryObj = gameMap[1].find(territory => { territory.mapId === coordinates })
            console.log(territoryObj)
            // territoryObj.units.push(priestObj)
            // player.units.push(priestObj)
            // const priestDOM = document.createElement('div')
            // priestDOM.classList.add('priest')
            // e.target.appendChild(priestDOM)
            break
    }
}


// random map generation, returns both DOM element and array of territory objects
const createMap = () => {
    // create the game map top level DOM element
    const gameMapDOM = document.createElement('div')
    gameMapDOM.setAttribute('id', 'Game-Map')

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


// creates and adds lists of adjacent territories to each territory
gameMap[1].forEach(origin => {
    gameMap[1].forEach(destination => {
        if (isAdjacent(origin, destination) && !origin.adjacents.includes(destination)) {
            origin.adjacents.push(destination)
        }
    })
})

console.log(gameMap)
map.appendChild(gameMap[0])
