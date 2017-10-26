import { connect } from 'react-redux'
import { mapStateToProps, mapDispatchToProps } from './UpperOptions.store'
import UpperOptions from '../components/UpperOptions'

export default connect(mapStateToProps, mapDispatchToProps)(UpperOptions)
