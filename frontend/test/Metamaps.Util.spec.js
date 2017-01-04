/* global describe, it */

import chai from 'chai'

import Util from '../src/Metamaps/Util'

const { expect } = chai

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
    it.skip('TODO need `Date`')
  })
  describe('decodeEntities', function() {
    it.skip('TODO need `document`')
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
    it('returns 0,0 for null canvas', function() {
      expect(Util.coordsToPixels(null, {}).x).to.equal(0)
      expect(Util.coordsToPixels(null, {}).y).to.equal(0)
    })
    it.skip('TODO need initialized mGraph to test further')
  })
  describe('pixelsToCoords', function() {
    it('returns 0,0 for null canvas', function() {
      expect(Util.pixelsToCoords(null, {}).x).to.equal(0)
      expect(Util.pixelsToCoords(null, {}).y).to.equal(0)
    })
    it.skip('TODO need initialized mGraph to test further')
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
    it.skip('TODO need `window`')
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

    it('links and images', function() {
      const md = '[Link](https://metamaps.cc) ![Image](https://example.org/image.png)'
      const html = '<p><a href="https://metamaps.cc">Link</a> <img src="https://example.org/image.png" alt="Image" /></p>'
      expect(Util.mdToHTML(md).trim()).to.equal(html)
    })
  })
  describe('logCanvasAttributes', function() {
    it.skip('TODO need a canvas')
  })
  describe('resizeCanvas', function() {
    it.skip('TODO need a canvas')
  })
})
