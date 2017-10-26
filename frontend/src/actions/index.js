import * as constants from './constants'

export const openChat = () => {
  return {
    type: constants.OPEN_CHAT
  }
}

export const closeChat = () => {
  return {
    type: constants.CLOSE_CHAT
  }
}
