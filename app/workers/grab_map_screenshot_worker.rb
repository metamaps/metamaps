require 'phantomjs'

# app/workers/grab_map_screenshot_worker.rb
class GrabMapScreenshotWorker
  include Sidekiq::Worker

  def perform(map_id)
    imgBase64 = ''
    Phantomjs.run('./script/phantomjs-save-screenshot.js', map_id.to_s) { |line|
      imgBase64 << line
    }
	map = Map.find(map_id)
    map.decode_base64(imgBase64)
  end
end
