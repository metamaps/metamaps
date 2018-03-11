import React, { Component } from 'react'
import { browserHistory } from 'react-router'
import ReactDOM from 'react-dom'
import Loading from '../components/Loading'

class UserSettings extends Component {
  constructor(props) {
    super(props)
    this.state = {
      success: false,
      error: false,
      userImageMenuOpen: false,
      changePasswordOpen: false,
      changeName: false,
      loading: false,
      image: null,
      imagePreviewFile: null,
      currentPassword: '',
      newPassword: '',
      newPasswordConfirmation: '',
      name: '',
      email: '',
      emailsAllowed: false,
      followTopicOnCreated: false,
      followTopicOnContributed: false,
      followMapOnCreated: false,
      followMapOnContributed: false,
      removeImage: '0' // can be '0' or '1', 0 means keep, 1 means remove
    }
  }

  componentDidMount = () => {
    this.setState({
      name: this.props.currentUser.get('name'),
      email: this.props.currentUser.get('email'),
      image: this.props.currentUser.get('image'),
      emailsAllowed: this.props.currentUser.get('emails_allowed'),
      followTopicOnCreated: this.props.currentUser.get('follow_topic_on_created'),
      followTopicOnContributed: this.props.currentUser.get('follow_topic_on_contributed'),
      followMapOnCreated: this.props.currentUser.get('follow_map_on_created'),
      followMapOnContributed: this.props.currentUser.get('follow_map_on_contributed')
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.imagePreviewFile && !prevState.imagePreviewFile) {
      this.updatePreview()
    }
  }

  updatePreview = () => {
    const reader = new window.FileReader()
    const imageObj = new window.Image()
    const canvas = ReactDOM.findDOMNode(this.refs.imagePreview)
    const context = canvas.getContext('2d')
    imageObj.onload = () => {
      const imgWidth = imageObj.width
      const imgHeight = imageObj.height
      const dimensionToMatch = imgWidth > imgHeight ? imgHeight : imgWidth
      // draw cropped image
      const nonZero = Math.abs(imgHeight - imgWidth) / 2
      const sourceX = dimensionToMatch === imgWidth ? 0 : nonZero
      const sourceY = dimensionToMatch === imgHeight ? 0 : nonZero
      const sourceWidth = dimensionToMatch
      const sourceHeight = dimensionToMatch
      const destX = 0
      const destY = 0
      const destWidth = 84
      const destHeight = 84
      context.drawImage(imageObj, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight)
    }
    reader.onload = () => { 
      imageObj.src = reader.result
    }
    if (this.state.imagePreviewFile) {
      reader.readAsDataURL(this.state.imagePreviewFile)
      this.setState({ userImageMenuOpen: false, removeImage: '0' })
    }
  }

  toggleChangePicture = () => {
    this.setState({
      userImageMenuOpen: !this.state.userImageMenuOpen
    })
  }

  openChangePicture = () => {
    this.setState({
      userImageMenuOpen: true
    })
  }

  closeChangePicture = () => {
    this.setState({
      userImageMenuOpen: false
    })
  }

  showImagePreview = (event) => {
    const file = event.target.files[0]
    this.setState({
      imagePreviewFile: file
    })
  }

  removePicture = () => {
    /*
    $('.userImageDiv img').attr('src', '/images/user.png').show()

    var input = $('#user_image')
    input.replaceWith(input.val('').clone(true))
    */
    this.setState({ userImageMenuOpen: false, removeImage: '1', imagePreviewFile: null })
  }

  changeName = () => {
    this.setState({ changeName: true })
  }

  showPass = () => {
    this.setState({ changePasswordOpen: true })
  }

  hidePass = () => {
    this.setState({
      changePasswordOpen: false,
      currentPassword: '',
      newPassword: '',
      newPasswordConfirmation: ''
    })
  }

  updateForKey = (key) => {
    return (event) => {
      const newState = {}
      if (event.target.type === 'checkbox') {
        newState[key] = !this.state[key]
      } else {
        newState[key] = event.target.value  
      }
      this.setState(newState)
    }
  }

  onSubmit = async (event) => {
    event.preventDefault()
    const { updateUser, params: { id } } = this.props
    const { name, email, imagePreviewFile, emailsAllowed, removeImage,
            followTopicOnCreated, followTopicOnContributed,
            followMapOnCreated, followMapOnContributed,
            currentPassword, newPassword, newPasswordConfirmation  } = this.state
    this.setState({ loading: true, error: false })
    try {
      const res = await updateUser(id, {
        name,
        email,
        removeImage,
        image: imagePreviewFile,
        emailsAllowed,
        followTopicOnCreated,
        followTopicOnContributed,
        followMapOnCreated,
        followMapOnContributed,
        currentPassword,
        newPassword,
        newPasswordConfirmation
      })
      if (res.ok) {
        this.setState({ loading: false, success: true })
        window.setTimeout(() => this.setState({ success: false }), 4000)
      } else {
        const parsed = await res.json()
        const error = parsed.error
        this.setState({
          loading: false,
          error
        })
      }
    } catch (e) {
      this.setState({
        loading: false,
        error: 'There was an error saving'
      })
    }
  }

  submitClick = (event) => {
    // validate
  }

  render = () => {
    const id = this.props.currentUser.get('id')
    const name = this.props.currentUser.get('name')
    return (
      <div id="yield">
        <form onSubmit={this.onSubmit} className="edit_user centerGreyForm" id={`edit_user_${id}`} acceptCharset="UTF-8">
          <input name="utf8" type="hidden" value="✓" />
          <h3>Edit Settings</h3>
          <div className="userImage">
            <div className="userImageDiv" onClick={this.toggleChangePicture}>
              {this.state.imagePreviewFile && <canvas ref="imagePreview" width="84" height="84" />}
              {!this.state.imagePreviewFile && this.state.removeImage !== '1' && <img src={this.state.image} width="84" height="84" />}
              {this.state.removeImage === '1' && <img src="/images/user.png" width="84" height="84" />}
              <div className="editPhoto"></div>
            </div>
            {this.state.userImageMenuOpen && <div className="userImageMenu">
              <div className="userMenuArrow"></div>
              <ul>
                <li className="upload">
                  Upload Photo
                  <input type="hidden" name="remove_image" id="remove_image" value={this.state.removeImage} />
                  <input onChange={this.showImagePreview} type="file" name="user[image]" id="user_image" />
                  <label htmlFor="user_image">Image</label>
                </li>
                <li className="remove" onClick={this.removePicture}>Remove</li>
                <li className="cancel" onClick={this.closeChangePicture}>Cancel</li>
              </ul>
            </div>}
          </div>
          {!this.state.changeName && <div className="accountName" onClick={this.changeName}>
            <div className="nameEdit">{ name }</div>
          </div>}
          {this.state.changeName && <div className="changeName">
            <label className="firstFieldText" htmlFor="user_name">Name:</label>
            <input type="text" name="user[name]" id="user_name" value={this.state.name} onChange={this.updateForKey('name')} />
          </div>}
          <div>
            <label className="firstFieldText" htmlFor="user_email">Email:</label>
            <input type="email" value={this.state.email} onChange={this.updateForKey('email')} name="user[email]" id="user_email" />
          </div>
          <div>
            <label className="firstFieldText" htmlFor="user_emails_allowed">
              <input className="inline" type="checkbox" value={this.state.emailsAllowed ? '1' : '0'} checked={this.state.emailsAllowed} onChange={this.updateForKey('emailsAllowed')} name="user[emails_allowed]" id="user_emails_allowed" />
              Send Metamaps notifications to my email.
            </label>
            <label className="firstFieldText" htmlFor="settings_follow_topic_on_created">
              <input className="inline" type="checkbox" value={this.state.followTopicOnCreated ? '1' : '0'} checked={this.state.followTopicOnCreated} onChange={this.updateForKey('followTopicOnCreated')} name="settings[follow_topic_on_created]" id="settings_follow_topic_on_created" />
              Auto-follow topics you create.
            </label>
            <label className="firstFieldText" htmlFor="settings_follow_topic_on_contributed">
              <input className="inline" type="checkbox" value={this.state.followTopicOnContributed ? '1' : '0'} checked={this.state.followTopicOnContributed} onChange={this.updateForKey('followTopicOnContributed')} name="settings[follow_topic_on_contributed]" id="settings_follow_topic_on_contributed" />
              Auto-follow topics you edit.
            </label>
            <label className="firstFieldText" htmlFor="settings_follow_map_on_created">
              <input className="inline" type="checkbox" value={this.state.followMapOnCreated ? '1' : '0'} checked={this.state.followMapOnCreated} onChange={this.updateForKey('followMapOnCreated')} name="settings[follow_map_on_created]" id="settings_follow_map_on_created" />
              Auto-follow maps you create.
            </label>
            <label className="firstFieldText" htmlFor="settings_follow_map_on_contributed">
              <input className="inline" type="checkbox" value={this.state.followMapOnContributed ? '1' : '0'} checked={this.state.followMapOnContributed} onChange={this.updateForKey('followMapOnContributed')} name="settings[follow_map_on_contributed]" id="settings_follow_map_on_contributed" />
              Auto-follow maps you edit.
            </label>
          </div>
          {!this.state.changePasswordOpen && <div className="changePass" onClick={this.showPass}>Change Password</div>}
          {this.state.changePasswordOpen && <div>
            <div>
              <label className="firstFieldText" htmlFor="user_current_password">Current Password:</label>
              <input type="password" name="current_password" id="current_password" value={this.state.currentPassword} onChange={this.updateForKey('currentPassword')} />
            </div>
            <div>
              <label className="firstFieldText" htmlFor="user_password">New Password:</label>
              <input autoComplete="off" type="password" name="user[password]" id="user_password" value={this.state.newPassword} onChange={this.updateForKey('newPassword')} />
            </div>
            <div>
              <label className="firstFieldText" htmlFor="user_password_confirmation">Confirm New Password:</label>
              <input autoComplete="off" type="password" name="user[password_confirmation]" id="user_password_confirmation" value={this.state.newPasswordConfirmation} onChange={this.updateForKey('newPasswordConfirmation')} />
            </div>
            <div className="noChangePass" onClick={this.hidePass}>Oops, don't change password</div>
          </div>}
          <div id="accountPageLoading">
            {this.state.loading && <Loading />}
          </div>
          <div className="clearfloat"></div>
          <div id="accountPageSuccess">
            {this.state.success && "Saved"}
          </div>
          <div className="clearfloat"></div>
          <div id="accountPageError">
            {this.state.error}
          </div>
          <div className="clearfloat"></div>
          <input type="submit" name="commit" value="Update" className="update" onClick={this.submitClick} />
          <div className="clearfloat"></div>
        </form>
      </div>
    )
  }
}

export default UserSettings
