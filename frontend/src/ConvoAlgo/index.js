import { findIndex, orderBy } from 'lodash'

/*
step 1
generate an object/array that represents the intended layout


step 2
generate x,y coordinates for every topic in the layout object

*/

// synapses = [{ topic1_id: 4, topic2_id: 5, direction: 'from-to', desc: 'has reply' }]

const isEven = n => n % 2 === 0
const isOdd = n => Math.abs(n % 2) === 1

export const X_GRID_SPACE = 250
export const Y_GRID_SPACE = 200
export const ISLAND_SPACING = 300

export const generateLayoutObject = (topics, synapses, focalTopicId) => {
  let layout = [] // will be the final output
  const usedTopics = {} // will store the topics that have been placed into islands
  let newRoot
  let currentTopic

  const addParentsAndChildren = (topic, getParents, getChildren, degreeFromFocus) => {
    if (!topic.id) return topic

    usedTopics[topic.id] = true
    topic.degreeFromFocus = degreeFromFocus
    const nextDegree = degreeFromFocus + 1

    if (getChildren) {
      topic.children = []
      synapses.filter(synapse => {
        return synapse.topic1_id === topic.id
               && !usedTopics[synapse.topic2_id]
               && synapse.category === 'from-to'
      })
      .map(synapse => synapse.topic2_id)
      .forEach(childId => topic.children.push(addParentsAndChildren({id: childId}, false, true, nextDegree)))

      topic.children = orderBy(topic.children, 'maxDescendants', 'desc')
      topic.maxDescendants = topic.children.length ? topic.children[0].maxDescendants + 1 : 0
    }

    if (getParents) {
      topic.parents = []
      synapses.filter(synapse => {
        return synapse.topic2_id === topic.id
               && !usedTopics[synapse.topic1_id]
               && synapse.category === 'from-to'
      })
      .map(synapse => synapse.topic1_id)
      .forEach(parentId => topic.parents.push(addParentsAndChildren({id: parentId}, true, false, nextDegree)))

      topic.parents = orderBy(topic.parents, 'maxAncestors', 'desc')
      topic.maxAncestors = topic.parents.length ? topic.parents[0].maxAncestors + 1 : 0
    }

    if (getParents && getChildren) {
      topic.longestThread = topic.maxDescendants + topic.maxAncestors + 1
    }

    return topic
  }

  // start with the focal node, and build its island
  currentTopic = topics.find(t => t.id === focalTopicId)
  if (!currentTopic) {
    console.log('you didnt pass a valid focalTopicId')
    return layout
  }
  newRoot = {
    id: currentTopic.id
  }
  layout.push(addParentsAndChildren(newRoot, true, true, 0))

  // right now there's no reasoning going on about the selection of focal topics
  // its just whichever ones happen to be found in the array first
  topics.forEach(topic => {
    if (topic && topic.id && !usedTopics[topic.id]) {
      newRoot = {
        id: topic.id
      }
      layout.push(addParentsAndChildren(newRoot, true, true, 0))
    }
  })

  return layout
}


export const generateObjectCoordinates = (layoutObject, focalTopicId, focalCoords) => {
  const coords = {}

  const traverseIsland = (island, func, parent, child) => {
    func(island, parent, child)
    if (island.parents) {
      island.parents.forEach(p => traverseIsland(p, func, null, island))
    }
    if (island.children) {
      island.children.forEach(c => traverseIsland(c, func, island, null))
    }
  }

  // const myFunction = n => n*5

  // myFunction(2) === 10

  const positionTopic = tempPosStore => (topic, parent, child) => {
    let pos = {}

    const getYValueForX = (x, attempt = 0) => {
      tempPosStore[x] = tempPosStore[x] || {}
      let yValue
      let relationSign
      let indexOfTopic
      let relation = parent || child
      let arrayOfTopics = parent ? parent.children : (child ? child.parents : [])

      // first figure out what you'd like it to be
      // then figure out if that spot's taken
      // and if it is then call this function again with another attempt

      // after the focal topic only, ODD indexes will move negatively on the Y axis
      // and EVEN indexes will move positively on the Y axis

      // for everything beyond the direct parents and children of the focal topic
      // maintain the positivity or negativity on the Y axis of its parent or child

      if (!relation) yValue = 0
      else if (attempt === 0) yValue = coords[relation.id].y
      else if (attempt > 0) {
        // if the relations sign is 0, alternate between putting this topic into the upper and lower quadrants
        if (coords[relation.id].y === 0) {
          indexOfTopic = findIndex(arrayOfTopics, t => t.id === topic.id)
          relationSign = isOdd(indexOfTopic) ? 1 : -1
        } else {
          // if the quadrant of the related topic is already decided, make sure to keep it
          relationSign = coords[relation.id].y > 0 ? 1 : -1
        }
        yValue = coords[relation.id].y + (Y_GRID_SPACE * attempt * relationSign)
      }

      if (tempPosStore[x][yValue]) yValue = getYValueForX(x, attempt + 1)
      tempPosStore[x][yValue] = true
      return yValue
    }

    pos.x = topic.degreeFromFocus * X_GRID_SPACE * (parent ? 1 : -1),
    pos.y = getYValueForX(pos.x)
    coords[topic.id] = pos
  }

  // lay all of them out as if there were no other ones
  layoutObject.forEach((island, index) => {
    const tempPosStore = {}
    if (index === 0) {
      tempPosStore[X_GRID_SPACE] = {
        0: true
      }
    }
    traverseIsland(island, positionTopic(tempPosStore))
  })

  // calculate the bounds of each island
  const islandBoundArray= []
  const adjustBounds = islandBounds => (topic, parent, child) => {
    const relation = parent || child
    if (!relation) return
    islandBounds.minX = Math.min(islandBounds.minX, coords[topic.id].x)
    islandBounds.maxX = Math.max(islandBounds.maxX, coords[topic.id].x)
    islandBounds.minY = Math.min(islandBounds.minY, coords[topic.id].y)
    islandBounds.maxY = Math.max(islandBounds.maxY, coords[topic.id].y)
  }
  layoutObject.forEach(island => {
    const islandBounds = {
      minX: coords[island.id].x,
      maxX: coords[island.id].x,
      minY: coords[island.id].y,
      maxY: coords[island.id].y
    }
    islandBoundArray.push(islandBounds)
    traverseIsland(island, adjustBounds(islandBounds))
  })

  // reposition the islands according to the bounds
  const translateIsland = (island, x, y) => {
    const adjustTopicPos = topic => {
      coords[topic.id].x = coords[topic.id].x + x
      coords[topic.id].y = coords[topic.id].y + y
    }
    traverseIsland(island, adjustTopicPos)
  }
  let maxYForIslands = 0 // the highest Y value that has thus been placed
  let minYForIslands = 0 // the lowest Y value that has thus been placed
  layoutObject.forEach((island, index) => {
    let translateY
    const islandHeight = islandBoundArray[index].maxY - islandBoundArray[index].minY
    if (index === 0) {
      translateIsland(island, focalCoords.x, focalCoords.y) // position the selected island to where the user has it already
      maxYForIslands = focalCoords.y + islandBoundArray[0].maxY
      minYForIslands = focalCoords.y + islandBoundArray[0].minY
    }
    else if (isOdd(index)) {
      translateIsland(island, focalCoords.x - islandBoundArray[index].maxX, maxYForIslands + ISLAND_SPACING + Math.abs(islandBoundArray[index].minY))
      maxYForIslands = maxYForIslands + ISLAND_SPACING + islandHeight
    }
    else {
      translateIsland(island, focalCoords.x - islandBoundArray[index].maxX, minYForIslands - ISLAND_SPACING - islandBoundArray[index].maxY)
      minYForIslands = minYForIslands - ISLAND_SPACING - islandHeight
    }
  })

  return coords
}

export const getLayoutForData = (topics, synapses, focalTopicId, focalCoords) => {
  return generateObjectCoordinates(generateLayoutObject(topics, synapses, focalTopicId), focalTopicId, focalCoords)
}