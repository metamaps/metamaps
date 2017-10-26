import {
  OPEN_CHAT,
  CLOSE_CHAT
} from '../../actions/constants'

const initialState = {
  isOpen: false
}

export default function (state = initialState, action) {
  switch (action.type) {
    case OPEN_CHAT:
      return {
        isOpen: true
      }
    case CLOSE_CHAT:
      return {
        isOpen: false
      }
  }
  return state
}
