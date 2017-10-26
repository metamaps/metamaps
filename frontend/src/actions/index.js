import * as c from './constants'

export const openChat = () => {
  return {
    type: c.OPEN_CHAT
  }
}

export const closeChat = () => {
  return {
    type: c.CLOSE_CHAT
  }
}
