import _ from 'lodash'

import $jit from '../patched/JIT'

import Visualize from './Visualize'
import JIT from './JIT'

const Organize = {
  arrange: function(layout, centerNode) {
    // first option for layout to implement is 'grid', will do an evenly spaced grid with its center at the 0,0 origin
    if (layout === 'grid') {
      const numNodes = _.size(Visualize.mGraph.graph.nodes) // this will always be an integer, the # of nodes on your graph visualization
      const numColumns = Math.floor(Math.sqrt(numNodes)) // the number of columns to make an even grid
      const GRIDSPACE = 400
      let row = 0
      let column = 0
      Visualize.mGraph.graph.eachNode(function(n) {
        if (column === numColumns) {
          column = 0
          row += 1
        }
        var newPos = new $jit.Complex()
        newPos.x = column * GRIDSPACE
        newPos.y = row * GRIDSPACE
        n.setPos(newPos, 'end')
        column += 1
      })
      Visualize.mGraph.animate(JIT.ForceDirected.animateSavedLayout)
    } else if (layout === 'grid_full') {
      // this will always be an integer, the # of nodes on your graph visualization
      const numNodes = _.size(Visualize.mGraph.graph.nodes)
      const numColumns = Math.floor(Math.sqrt(numNodes)) // the number of columns to make an even grid
      const height = Visualize.mGraph.canvas.getSize(0).height
      const width = Visualize.mGraph.canvas.getSize(0).width
      const totalArea = height * width
      const cellArea = totalArea / numNodes
      const ratio = height / width
      const cellWidth = Math.sqrt(cellArea / ratio)
      const cellHeight = cellArea / cellWidth
      const GRIDSPACE = 400
      let row = Math.floor(height / cellHeight)
      let column = Math.floor(width / cellWidth)
      const totalCells = row * column

      if (totalCells) {
        Visualize.mGraph.graph.eachNode(function(n) {
          if (column === numColumns) {
            column = 0
            row += 1
          }
          var newPos = new $jit.Complex()
          newPos.x = column * GRIDSPACE
          newPos.y = row * GRIDSPACE
          n.setPos(newPos, 'end')
          column += 1
        })
      }
      Visualize.mGraph.animate(JIT.ForceDirected.animateSavedLayout)
    } else if (layout === 'radial') {
      var centerX = centerNode.getPos().x
      var centerY = centerNode.getPos().y
      centerNode.setPos(centerNode.getPos(), 'end')

      console.log(centerNode.adjacencies)
      var lineLength = 200
      var usedNodes = {}
      usedNodes[centerNode.id] = centerNode
      var radial = function(node, level, degree) {
        if (level === 1) {
          var numLinksTemp = _.size(node.adjacencies)
          var angleTemp = 2 * Math.PI / numLinksTemp
        } else {
          angleTemp = 2 * Math.PI / 20
        }
        node.eachAdjacency(function(a) {
          var isSecondLevelNode = (centerNode.adjacencies[a.nodeTo.id] !== undefined && level > 1)
          if (usedNodes[a.nodeTo.id] === undefined && !isSecondLevelNode) {
            var newPos = new $jit.Complex()
            newPos.x = level * lineLength * Math.sin(degree) + centerX
            newPos.y = level * lineLength * Math.cos(degree) + centerY
            a.nodeTo.setPos(newPos, 'end')
            usedNodes[a.nodeTo.id] = a.nodeTo

            radial(a.nodeTo, level + 1, degree)
            degree += angleTemp
          }
        })
      }
      radial(centerNode, 1, 0)
      Visualize.mGraph.animate(JIT.ForceDirected.animateSavedLayout)
    } else if (layout === 'center_viewport') {
      let lowX = 0
      let lowY = 0
      let highX = 0
      let highY = 0

      Visualize.mGraph.graph.eachNode(function(n) {
        if (n.id === 1) {
          lowX = n.getPos().x
          lowY = n.getPos().y
          highX = n.getPos().x
          highY = n.getPos().y
        }
        if (n.getPos().x < lowX) lowX = n.getPos().x
        if (n.getPos().y < lowY) lowY = n.getPos().y
        if (n.getPos().x > highX) highX = n.getPos().x
        if (n.getPos().y > highY) highY = n.getPos().y
      })
      console.log(lowX, lowY, highX, highY)
    } else {
      window.alert('please call function with a valid layout dammit!')
    }
  }
}

export default Organize
