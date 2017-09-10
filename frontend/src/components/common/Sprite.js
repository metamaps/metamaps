import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Sprite extends Component {
  static propTypes = {
    src: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    xIndex: PropTypes.number,
    yIndex: PropTypes.number
  }

  render () {
    const { src, width, height, xIndex, yIndex } = this.props
    const styles = {
      overflow: 'hidden',
      backgroundImage: `url(${src})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: `-${xIndex * width}px -${yIndex * height}px`,
      width: `${width}px`,
      height: `${height}px`
    }
    return <div className='sprite' style={styles}></div>
  }
}
