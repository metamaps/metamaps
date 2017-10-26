import { connect } from 'react-redux'
import { mapStateToProps, mapDispatchToProps } from './MapView.store'
import MapView from './MapView'

export default connect(mapStateToProps, mapDispatchToProps)(MapView)
