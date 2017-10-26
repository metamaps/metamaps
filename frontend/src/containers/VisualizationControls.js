import { connect } from 'react-redux'
import { mapStateToProps, mapDispatchToProps } from './VisualizationControls.store'
import VisualizationControls from '../components/VisualizationControls'

export default connect(mapStateToProps, mapDispatchToProps)(VisualizationControls)
