import {
  closeChat,
  openChat
} from '../../actions'

export const mapStateToProps = (state, ownProps) => {
  return {
    chatIsOpen: state.map.chat.isOpen
  }
}

export const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    openChat: () => {
      ownProps.onOpen()
      return dispatch(openChat())
    },
    closeChat: () => {
      ownProps.onClose()
      return dispatch(closeChat())
    }
  }
}
