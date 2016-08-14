/* global Metamaps, $ */

/*
 * Metamaps.Listeners.js.erb
 *
 * Dependencies:
 *  - Metamaps.Active
 *  - Metamaps.Control
 *  - Metamaps.JIT
 *  - Metamaps.Visualize
 */
Metamaps.Listeners = {
  init: function () {
    var self = this
    $(document).on('keydown', function (e) {
      if (!(Metamaps.Active.Map || Metamaps.Active.Topic)) return

      switch (e.which) {
        case 13: // if enter key is pressed
          Metamaps.JIT.enterKeyHandler()
          e.preventDefault()
          break
        case 27: // if esc key is pressed
          Metamaps.JIT.escKeyHandler()
          break
        case 65: // if a or A is pressed
          if (e.ctrlKey) {
            Metamaps.Control.deselectAllNodes()
            Metamaps.Control.deselectAllEdges()

            e.preventDefault()
            Metamaps.Visualize.mGraph.graph.eachNode(function (n) {
              Metamaps.Control.selectNode(n, e)
            })

            Metamaps.Visualize.mGraph.plot()
          }

          break
        case 68: // if d or D is pressed
          if (e.ctrlKey) {
            e.preventDefault()
            Metamaps.Control.deleteSelected()
          }
          break
        case 69: // if e or E is pressed
          if (e.ctrlKey && Metamaps.Active.Map) {
            e.preventDefault()
            Metamaps.JIT.zoomExtents(null, Metamaps.Visualize.mGraph.canvas)
            break
          }
          if (e.altKey && Metamaps.Active.Topic) {
            e.preventDefault()

            if (Metamaps.Active.Topic) {
              self.centerAndReveal(Metamaps.Selected.Nodes, {
                center: true,
                reveal: false
              })
            }
            break
          }
          break
        case 72: // if h or H is pressed
          if (e.ctrlKey) {
            e.preventDefault()
            Metamaps.Control.hideSelectedNodes()
            Metamaps.Control.hideSelectedEdges()
          }
          break
        case 77: // if m or M is pressed
          if (e.ctrlKey) {
            e.preventDefault()
            Metamaps.Control.removeSelectedNodes()
            Metamaps.Control.removeSelectedEdges()
          }
          break
        case 82: // if r or R is pressed
          if (e.altKey && Metamaps.Active.Topic) {
            e.preventDefault()
            self.centerAndReveal(Metamaps.Selected.Nodes, {
              center: false,
              reveal: true
            })
          }
          break
        case 84: // if t or T is pressed
          if (e.altKey && Metamaps.Active.Topic) {
            e.preventDefault()
            self.centerAndReveal(Metamaps.Selected.Nodes, {
              center: true,
              reveal: true
            })
          }
          break
        default:
          // console.log(e.which)
          break
      }
    })

    $(window).resize(function () {
      if (Metamaps.Visualize && Metamaps.Visualize.mGraph) Metamaps.Visualize.mGraph.canvas.resize($(window).width(), $(window).height())
      if ((Metamaps.Active.Map || Metamaps.Active.Topic) && Metamaps.Famous && Metamaps.Famous.maps.surf) Metamaps.Famous.maps.reposition()
      if (Metamaps.Active.Map && Metamaps.Realtime.inConversation) Metamaps.Realtime.positionVideos()
      Metamaps.Mobile.resizeTitle()
    })
  },
  centerAndReveal: function(nodes, opts) {
    if (nodes.length < 1) return
    var node = nodes[nodes.length - 1]
    if (opts.center && opts.reveal) {
      Metamaps.Topic.centerOn(node.id, function() {
        Metamaps.Topic.fetchRelatives(nodes)
      })
    } else if (opts.center) {
      Metamaps.Topic.centerOn(node.id)
    } else if (opts.reveal) {
      Metamaps.Topic.fetchRelatives(nodes)
    }
  }
}; // end Metamaps.Listeners
