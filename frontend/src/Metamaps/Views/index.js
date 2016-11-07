/* global $ */

import ExploreMaps from './ExploreMaps'
import ChatView from './ChatView'
import VideoView from './VideoView'
import Room from './Room'
import { JUNTO_UPDATED } from '../Realtime/events'

const Views = {
  init: () => {
    $(document).on(JUNTO_UPDATED, () => ExploreMaps.render())
  },
  ExploreMaps,
  ChatView,
  VideoView,
  Room
}

export { ExploreMaps, ChatView, VideoView, Room }
export default Views
