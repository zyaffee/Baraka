// class for each map node
class Territory {
    constructor (mapId, nativePop, food) {
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
    constructor (type, location) {
        this.type = type,
        this.location = location
    }
    owner = ''
    strength = 1
    upkeepCost = 0
    powers = []
}


// random number from min to max inclusive
const randomRange = (min,max) => {
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


// random map generation, returns both DOM element and array
const createMap = () => {
    // create the game map
    const gameMapDOM = document.createElement('div')

    // an array of all Territories
    let mapArray = []

    // 
    gameMapDOM.setAttribute('id', 'Game-Map')

    // create each row of territories in map
    for (let i = 0; i < randomRange(4,7); i++) {
        const mapRow = document.createElement('div')
        mapRow.classList.add('map-row')

        // create each territory DOM element in this row
        for (let j = 0; j < randomRange(1,5); j++) {

            // Create territory DOM element
            const territoryDiv = document.createElement('div')
            territoryDiv.classList.add('territory')
            territoryDiv.setAttribute('id', `${i}, ${j}`)

            // Create territory object
            const territoryObj = new Territory ([i, j], randomRange(2,4), randomRange(4,6))
            
            // Populate territory with initial peasant population
            for (let k = 0; k < territoryObj.nativePop; k++) {
                // Create peasant DOM element and append to territory
                const peasantDOM = document.createElement('div')
                peasantDOM.classList.add('peasant')
                territoryDiv.appendChild(peasantDOM)

                // create peasant unit and append to territory's unitsPresent
                let peasantObj = new Unit ('peasant', [i, j])
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

// creates and adds lists of adjacent territories to each territory
gameMap[1].forEach(origin => {
    gameMap[1].forEach(destination => {
        if (isAdjacent(origin, destination) && !origin.adjacents.includes(destination)) {
            origin.adjacents.push(destination)
        }
    })
})

console.log(gameMap)
// const mapDOM = gameMap[0]
// let mapArray = gameMap[1]