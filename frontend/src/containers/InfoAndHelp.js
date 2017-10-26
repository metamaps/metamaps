import { connect } from 'react-redux'
import { mapStateToProps, mapDispatchToProps } from './InfoAndHelp.store'
import InfoAndHelp from '../components/InfoAndHelp'

export default connect(mapStateToProps, mapDispatchToProps)(InfoAndHelp)
