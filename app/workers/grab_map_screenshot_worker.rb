# app/workers/grab_map_screenshot_worker.rb
class GrabMapScreenshotWorker
  include Sidekiq::Worker

  def perform(map_id)
    imgBase64 = ''
    Phantomjs.run('./script/phantomjs-save-screenshot.js', map_id.to_s) { |line|
      imgBase64 << line
      puts line
    }

    #this doesn't work yet
    #map = Map.find(map_id)
    #map.add_attachment(imgBase64)
    #map.save!
  end
end
