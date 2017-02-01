// an array of synapses
// an array of topics

// a focal node

/*
step 1
generate an object/array that represents the intended layout


step 2
generate x,y coordinates for every topic in the layout object

step 3 
set end states for every topic

Step 4
animate
*/

// synapses = [{ topic1_id: 4, topic2_id: 5, direction: 'from-to' }]

export const generateLayoutObject = (topics, synapses, focalTopicId) => {
  let layout = [] // will be the final output
  const usedTopics = {} // will store the topics that have been placed into islands
  let newRoot
  let currentTopic
  
  const addParentsAndChildren = (topic, getParents, getChildren) => {
    if (!topic.id) return topic
    
    usedTopics[topic.id] = true

    if (getParents) {
      topic.parents = []
      synapses.filter(synapse => {
        return synapse.topic2_id === topic.id
               && !usedTopics[synapse.topic1_id]
               && synapse.category === 'from-to'
      })
      .map(synapse => synapse.topic1_id)
      .forEach(parentId => topic.parents.push(addParentsAndChildren({id: parentId}, true, false)))
    }
    
    if (getChildren) {
      topic.children = []
      synapses.filter(synapse => {
        return synapse.topic1_id === topic.id
               && !usedTopics[synapse.topic2_id]
               && synapse.category === 'from-to'
      })
      .map(synapse => synapse.topic2_id)
      .forEach(childId => topic.children.push(addParentsAndChildren({id: childId}, false, true)))
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
  layout.push(addParentsAndChildren(newRoot, true, true))
  // do the rest
  topics.forEach(topic => {
    if (topic && topic.id && !usedTopics[topic.id]) {
      newRoot = {
        id: topic.id
      }
      layout.push(addParentsAndChildren(newRoot, true, true))
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
  
  const positionTopic = (topic, parent, child) => {
    if (topic.id === focalTopicId) {
      // set the focalCoord to be what it already was
      coords[topic.id] = focalCoords
    } else if (!parent && !child) {
      coords[topic.id] = {x: 0, y: 250}
    } else if (parent) {
      coords[topic.id] = {
        x: coords[parent.id].x + 250,
        y: coords[parent.id].y - (parent.id === focalTopicId ? 250 : 0)
      }
    } else if (child) {
      coords[topic.id] = {
        x: coords[child.id].x - 250,
        y: coords[child.id].y
      }
    }
  }
  
  // lay all of them out as if there were no other ones
  layoutObject.forEach(island => {
    traverseIsland(island, positionTopic)
  })
  
  // calculate the bounds of each island
  
  // reposition the islands according to the bounds
  return coords
}

export const getLayoutForData = (topics, synapses, focalTopicId, focalCoords) => {
  return generateObjectCoordinates(generateLayoutObject(topics, synapses, focalTopicId), focalTopicId, focalCoords)
}



// if we've placed a node into an island, we need to NOT place it in any other islands
// Every node should only appear in one island

// the pseudo-focal node


// the top level array represents islands
// every island has some sort of 'focal' node
/*
var example = [
  // the island that contains the focal node
  {
    id: 21,
    parents: [
      {
        id: 25,
        parents: []
      },
      {
        id: 25,
        parents: []
      }
    ],
    children: [{
      id: 26,
      children: []
    }]
  },
  // all other islands should not contain children on the top level node
  {
    id: 21,
    // parents may contain children
    parents: [
      {
        id: 100,
        parents: [
          {
            id: 101,
            parents: [],
            children: [
              {
                id: 103,
                children: []
              }
            ]
          }  
        ]
      },
      {
        id: 102,
        parents: []
      }
    ]
  },
  {
    id: 21,
    parents: []
  },
]
*/