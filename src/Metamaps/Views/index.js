/* global $ */

import ContextMenu from './ContextMenu'
import ExploreMaps from './ExploreMaps'
import ChatView from './ChatView'
import VideoView from './VideoView'
import Room from './Room'
import TopicCard from './TopicCard'
import { JUNTO_UPDATED } from '../Realtime/events'

const Views = {
  init: (serverData) => {
    $(document).on(JUNTO_UPDATED, () => ExploreMaps.render())
    ChatView.init([serverData['sounds/MM_sounds.mp3'], serverData['sounds/MM_sounds.ogg']])
  },
  ContextMenu,
  ExploreMaps,
  ChatView,
  VideoView,
  Room,
  TopicCard
}

export { ContextMenu, ExploreMaps, ChatView, VideoView, Room, TopicCard }
export default Views
