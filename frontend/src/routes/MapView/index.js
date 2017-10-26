import { connect } from 'react-redux'
import { mapStateToProps, mapDispatchToProps } from './store'
import MapView from './MapView'

export default connect(mapStateToProps, mapDispatchToProps)(MapView)
