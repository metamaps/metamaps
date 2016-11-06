require('particles.js')
import config from './home/particles.json'
import metacodes from './home/metacodes.json'
const max = metacodes.length - 1

let rand = Math.floor(Math.random()*max)
config.particles.shape.image.src = metacodes[rand]
window.particlesJS('particles-1', config)

rand = Math.floor(Math.random()*max)
config.particles.shape.image.src = metacodes[rand]
window.particlesJS('particles-2', config)

rand = Math.floor(Math.random()*max)
config.particles.shape.image.src = metacodes[rand]
window.particlesJS('particles-3', config)