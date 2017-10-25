import React from 'react'
import PropTypes from 'prop-types'

// based on https://www.npmjs.com/package/react-loading-animation

const loadingStyle = {
  position: 'relative',
  margin: '0 auto',
  width: '30px',
  height: '30px'
}

const svgStyle = {
  animation: 'rotate 2s linear infinite',
  height: '100%',
  transformOrigin: 'center center',
  width: '100%',
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  margin: 'auto'
}

const circleStyle = {
  strokeDasharray: '1,200',
  strokeDashoffset: '0',
  animation: 'dash 1.5s ease-in-out infinite, color 6s ease-in-out infinite',
  strokeLinecap: 'round'
}

const animation = `@keyframes rotate {
    100% {
        transform: rotate(360deg);
    }
}
@keyframes dash {
    0% {
        stroke-dasharray: 1,200;
        stroke-dashoffset: 0;
    }
    50% {
        stroke-dasharray: 89,200;
        stroke-dashoffset: -35px;
    }
    100% {
        stroke-dasharray: 89,200;
        stroke-dashoffset: -124px;
    }
}
@keyframes color {
    100%, 0% {
        stroke: #a354cd;
    }
    50% {
        stroke: #4fb5c0;
    }
}`

class Loading extends React.Component {
  static propTypes = {
    style: PropTypes.object,
    width: PropTypes.string,
    height: PropTypes.string,
    margin: PropTypes.string
  }

  static defaultProps = {
    style: {},
    width: '30px',
    height: '30px',
    margin: '0 auto'
  }

  render() {
    let { width, height, margin, style } = this.props

    loadingStyle.width = width
    loadingStyle.height = height
    loadingStyle.margin = margin

    return <div style={Object.assign({}, loadingStyle, style)}>
        <style>{animation}</style>
        <svg style={svgStyle} viewBox="25 25 50 50">
            <circle style={circleStyle} cx="50" cy="50" r="20" fill="none" strokeWidth="4" strokeMiterlimit="10"/>
        </svg>
      </div>
  }
}

export default Loading
