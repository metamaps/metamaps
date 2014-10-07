# app/workers/grab_map_screenshot_worker.rb
class GrabMapScreenshotWorker
  include Sidekiq::Worker

  def perform(map_id)
    Phantomjs.run('./script/phantomjs-save-screenshot.js', map_id.to_s) { |line|
      puts line
    }
  end
end
