import { connect } from 'react-redux'
import { mapStateToProps, mapDispatchToProps } from './TopicCard.store'
import TopicCard from '../components/TopicCard'

export default connect(mapStateToProps, mapDispatchToProps)(TopicCard)
