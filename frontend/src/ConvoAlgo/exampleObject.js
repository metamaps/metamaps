
// if we've placed a node into an island, we need to NOT place it in any other islands
// Every node should only appear in one island

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