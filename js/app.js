// class for each map node
class Territory {
    constructor (mapId, population, abundance) {
        this.mapId = mapId,
        this.population = population,
        this.abundance = abundance
    }
    owner = ''
    unitsPresent = []
    adjacents = []
}

class Unit {
    constructor (type, location) {
        this.type = type,
        this.location = location
    }
    owner = ''
    strength = 1
    upkeepCost = 0
}

// random number from min to max inclusive
const randomRange = (min,max) => {
    return Math.floor(Math.random() * (max + 1 - min) + min)
}


// create the game map
const createMap = () => {
    // an array of all Territories
    let mapArray = []

    // used to give identity each territory for lookup
    let mapNum = 0

    // create the div to house the map
    const gameMap = document.createElement('div')
    gameMap.setAttribute('id', 'Game-Map')

    // create each row of territories in map
    for (let i = 0; i < randomRange(4,7); i++) {
        const mapRow = document.createElement('div')
        mapRow.classList.add('map-row')

        // create each territory
        for (let j = 0; j < randomRange(1,5); j++) {
            // Create territory DOM element
            const territoryDiv = document.createElement('div')
            territoryDiv.classList.add('territory')
            territoryDiv.setAttribute('id', mapNum)

            // Create territory object
            const territoryObj = new Territory (mapNum, randomRange(3,5), randomRange(3,5))
            mapArray.push(territoryObj)
            mapNum++
            // TO DO TO DO TO DO !!!!!!!!!!! CREATE STARTING PEASANTS IN THIS NEW TERRITORY EQUAL TO POPULATION
        }
    }
}

createMap()
console.log(gameMap)
// console.log(mapArray)