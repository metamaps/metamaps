const AutoLayout = {
  nextX: 0,
  nextY: 0,
  sideLength: 1,
  turnCount: 0,
  nextXshift: 1,
  nextYshift: 0,
  timeToTurn: 0,

  getNextCoord: function () {
    var self = Metamaps.AutoLayout
    var nextX = self.nextX
    var nextY = self.nextY

    var DISTANCE_BETWEEN = 120

    self.nextX = self.nextX + DISTANCE_BETWEEN * self.nextXshift
    self.nextY = self.nextY + DISTANCE_BETWEEN * self.nextYshift

    self.timeToTurn += 1
    // if true, it's time to turn
    if (self.timeToTurn === self.sideLength) {
      self.turnCount += 1
      // if true, it's time to increase side length
      if (self.turnCount % 2 === 0) {
        self.sideLength += 1
      }
      self.timeToTurn = 0

      // going right? turn down
      if (self.nextXshift == 1 && self.nextYshift == 0) {
        self.nextXshift = 0
        self.nextYshift = 1
      }
      // going down? turn left
      else if (self.nextXshift == 0 && self.nextYshift == 1) {
        self.nextXshift = -1
        self.nextYshift = 0
      }
      // going left? turn up
      else if (self.nextXshift == -1 && self.nextYshift == 0) {
        self.nextXshift = 0
        self.nextYshift = -1
      }
      // going up? turn right
      else if (self.nextXshift == 0 && self.nextYshift == -1) {
        self.nextXshift = 1
        self.nextYshift = 0
      }
    }

    return {
      x: nextX,
      y: nextY
    }
  },
  resetSpiral: function () {
    var self = Metamaps.AutoLayout
    self.nextX = 0
    self.nextY = 0
    self.nextXshift = 1
    self.nextYshift = 0
    self.sideLength = 1
    self.timeToTurn = 0
    self.turnCount = 0
  }
}

export default AutoLayout
