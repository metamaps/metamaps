/* global describe, it, afterEach */

import { expect } from 'chai'
import sinon from 'sinon'

import Util from '../../src/Metamaps/Util'

const sandbox = sinon.sandbox.create()

describe('Metamaps.Util.js', function() {
  describe('splitLine', function() {
    it('splits on words', function() {
      expect(Util.splitLine('test test test', 10))
        .to.equal('test test\ntest')
    })
    // TODO this test seems like it's incorrect behaviour
    it('splits mid-word if need be', function() {
      expect(Util.splitLine('test test', 2))
        .to.equal('te\nt\nte\nt')
    })
    it('splits words over 30 chars', function() {
      expect(Util.splitLine('suprainterpostantidisestablishmentarianism', 30))
        .to.equal('suprainterpostantidisestablish\nentarianism')
    })
  })
  describe('nowDateFormatted', function() {
    function assertNowDateFormatted(expected, { month, day, year }) {
      const date = {
        getDate: () => day,
        getMonth: () => month - 1, // 0 to 11
        getFullYear: () => year
      }
      expect(Util.nowDateFormatted(date)).to.equal(expected)
    }
    it('formats dates with one digit properly', function() {
      assertNowDateFormatted('01/01/2000', { month: 1, day: 1, year: 2000 })
    })
    it('formats dates with two digits properly', function() {
      assertNowDateFormatted('10/10/2000', { month: 10, day: 10, year: 2000 })
    })
  })
  describe('decodeEntities', function() {
    function assertDecodeEntities(expected, { textContent, innerText, desc }) {
      const paragraph = { textContent, innerText }
      sandbox.stub(document, "createElement").withArgs('p').returns(paragraph)

      const actual = Util.decodeEntities(desc)

      expect(actual).to.equal(expected)
      expect(paragraph.innerHTML).to.equal(desc)
    }
    afterEach(function() {
      sandbox.restore()
    })
    it('returns textContent if available', function() {
      assertDecodeEntities('textContent',
        { textContent: 'textContent', innerText: 'innerText', desc: 'desc' })
    })
    it('otherwise returns innerText', function() {
      assertDecodeEntities('innerText',
        { innerText: 'innerText', desc: 'desc' })
    })
  })
  describe('getDistance', function() {
    it('(0,0) -> (0,0) = 0', function() {
      expect(Util.getDistance({ x: 0, y: 0 }, { x: 0, y: 0 }))
        .to.equal(0)
    })
    it('(-5,0) -> (5,0) = 10', function() {
      expect(Util.getDistance({ x: -5, y: 0 }, { x: 5, y: 0 }))
        .to.equal(10)
    })
    it('(0,0) -> (5,7) = 8.6023', function() {
      expect(Util.getDistance({ x: 0, y: 0 }, { x: 5, y: 7 }).toFixed(4))
        .to.equal('8.6023')
    })
  })
  describe('coordsToPixels', function() {
    function assertCoordsToPixels(expectedX, expectedY,
        x, y, sx, sy, px, py, width, height, ox, oy) {
      const mGraph = {
        canvas: {
          getSize: () => ({ width, height }),
          getPos: () => ({ x: px, y: py }),
          translateOffsetX: ox, translateOffsetY: oy,
          scaleOffsetX: sx, scaleOffsetY: sy
        }
      }
      const coords = { x, y }
      const actual = Util.coordsToPixels(mGraph, coords)
      expect(actual.x).to.equal(expectedX)
      expect(actual.y).to.equal(expectedY)
    }


    it('returns 0,0 for null canvas', function() {
      expect(Util.coordsToPixels(null, {}).x).to.equal(0)
      expect(Util.coordsToPixels(null, {}).y).to.equal(0)
    })
    it('does the correct calculation', function() {
      assertCoordsToPixels(0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0)
      assertCoordsToPixels(1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0)
      assertCoordsToPixels(2, 1, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0)
      assertCoordsToPixels(2, 2, 1, 1, 2, 2, 0, 0, 0, 0, 0, 0)
      assertCoordsToPixels(3, 2, 1, 1, 2, 2, 1, 0, 0, 0, 0, 0)
      assertCoordsToPixels(3, 3, 1, 1, 2, 2, 1, 1, 0, 0, 0, 0)
      assertCoordsToPixels(4, 3, 1, 1, 2, 2, 1, 1, 2, 0, 0, 0)
      assertCoordsToPixels(4, 4, 1, 1, 2, 2, 1, 1, 2, 2, 0, 0)
      assertCoordsToPixels(9, 4, 1, 1, 2, 2, 1, 1, 2, 2, 5, 0)
      assertCoordsToPixels(9, 9, 1, 1, 2, 2, 1, 1, 2, 2, 5, 5)
    })
  })
  describe('pixelsToCoords', function() {
    function assertPixelsToCoords(expectedX, expectedY,
        x, y, px, py, width, height, ox, oy, sx, sy) {
      const mGraph = {
        canvas: {
          getSize: () => ({ width, height }),
          getPos: () => ({ x: px, y: py }),
          translateOffsetX: ox, translateOffsetY: oy,
          scaleOffsetX: sx, scaleOffsetY: sy
        }
      }
      const coords = { x, y }
      const actual = Util.pixelsToCoords(mGraph, coords)
      expect(actual.x).to.equal(expectedX)
      expect(actual.y).to.equal(expectedY)
    }
    it('returns 0,0 for null canvas', function() {
      expect(Util.pixelsToCoords(null, {}).x).to.equal(0)
      expect(Util.pixelsToCoords(null, {}).y).to.equal(0)
    })
    it('does the correct calculation', function() {
     assertPixelsToCoords(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1)
     assertPixelsToCoords(5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 1, 1)
     assertPixelsToCoords(4, 5, 5, 5, 1, 0, 0, 0, 0, 0, 1, 1)
     assertPixelsToCoords(4, 4, 5, 5, 1, 1, 0, 0, 0, 0, 1, 1)
     assertPixelsToCoords(3, 4, 5, 5, 1, 1, 2, 0, 0, 0, 1, 1)
     assertPixelsToCoords(3, 3, 5, 5, 1, 1, 2, 2, 0, 0, 1, 1)
     assertPixelsToCoords(2, 3, 5, 5, 1, 1, 2, 2, 1, 0, 1, 1)
     assertPixelsToCoords(2, 2, 5, 5, 1, 1, 2, 2, 1, 1, 1, 1)
     assertPixelsToCoords(4, 2, 5, 5, 1, 1, 2, 2, 1, 1, 0.5, 1)
     assertPixelsToCoords(4, 4, 5, 5, 1, 1, 2, 2, 1, 1, 0.5, 0.5)
    })
  })
  describe('getPastelColor', function() {
    it('1 => fefefe', function() {
      expect(Util.getPastelColor({ rseed: 1, gseed: 1, bseed: 1 }))
        .to.equal(Util.colorLuminance('#fefefe', -0.4))
    })
    it('0 => 7f7f7f', function() {
      expect(Util.getPastelColor({ rseed: 0, gseed: 0, bseed: 0 }))
        .to.equal(Util.colorLuminance('#7f7f7f', -0.4))
    })
  })
  describe('colorLuminance', function() {
    describe('-0.4 lum', function() {
      it('white => ?', function() {
        expect(Util.colorLuminance('#ffffff', -0.4)).to.equal('#999999')
      })
      it('black => ?', function() {
        expect(Util.colorLuminance('#000000', -0.4)).to.equal('#000000')
      })
      it('7f7f7f => ?', function() {
        expect(Util.colorLuminance('#7f7f7f', -0.4)).to.equal('#4c4c4c')
      })
    })

    describe('other lum values', function() {
      it('-1', function() {
        expect(Util.colorLuminance('#7f7f7f', -1)).to.equal('#000000')
      })
      it('-0.5', function() {
        expect(Util.colorLuminance('#7f7f7f', -0.5)).to.equal('#404040')
      })
      it('0', function() {
        expect(Util.colorLuminance('#7f7f7f', 0)).to.equal('#7f7f7f')
      })
      it('0.5', function() {
        expect(Util.colorLuminance('#7f7f7f', 0.5)).to.equal('#bfbfbf')
      })
      it('1', function() {
        expect(Util.colorLuminance('#7f7f7f', 1)).to.equal('#fefefe')
      })
    })
  })
  describe('openLink', function() {
    function stubWindow({ popupsAllowed }) {
      const open = sandbox.stub(window, "open").returns(popupsAllowed)
      const alert = sandbox.stub(window, "alert")
      return { open, alert }
    }
    afterEach(function() {
      sandbox.restore()
    })
    it('blank url returns true', function() {
      expect(Util.openLink('')).to.equal(true)
    })
    it('popus allowed returns true', function() {
      stubWindow({ popupsAllowed: true })
      expect(Util.openLink('https://www.google.ca')).to.equal(true)
    })
    it('popups blocked shows alert', function() {
      const { alert } = stubWindow({ popupsAllowed: false })
      expect(Util.openLink('https://www.google.ca')).to.equal(false)
      expect(alert.calledWith('Please allow popups in order to open the link'))
        .to.equal(true)
    })
  })
  describe('mdToHTML', function() {
    it('filters xss', function() {
      const md = '<script>alert("xss");</script>'
      const html = '<!-- raw HTML omitted -->'
      expect(Util.mdToHTML(md).trim()).to.equal(html)
    })

    it('bold and italics', function() {
      const md = '**Bold** *Italics*'
      const html = '<p><strong>Bold</strong> <em>Italics</em></p>'
      expect(Util.mdToHTML(md).trim()).to.equal(html)
    })

    it('links', function() {
      const md = '[Link](https://metamaps.cc)'
      const html = '<p><a href="https://metamaps.cc">Link</a></p>'
      expect(Util.mdToHTML(md).trim()).to.equal(html)
    })

    it('images are not rendered', function() {
      const md = '![Image](https://example.org/image.png)'
      const html = '<p>![Image](https://example.org/image.png)</p>'
      expect(Util.mdToHTML(md).trim()).to.equal(html)
    })
  })
  describe('logCanvasAttributes', function() {
    it('returns correct canvas attributes', function() {
      const canvas = {
        scaleOffsetX: 1, scaleOffsetY: 2,
        canvases: [{ size: { width: 3, height: 4 } }]
      }
      sinon.stub(Util, "pixelsToCoords").returnsArg(1)

      const actual = Util.logCanvasAttributes(canvas)

      expect(actual.scaleX).to.equal(1)
      expect(actual.scaleY).to.equal(2)

      // stub will return the x/y coords passed to pixelsToCoords
      expect(actual.centreCoords.x).to.equal(3 / 2)
      expect(actual.centreCoords.y).to.equal(4 / 2)
    })
  })
  describe('resizeCanvas', function() {
    it.skip('TODO')
  })
})
