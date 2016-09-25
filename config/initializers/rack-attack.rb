class Rack::Attack
end

Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new

# Throttle requests to 5 requests per second per ip
Rack::Attack.throttle('load_url_title/req/ip', :limit => 5, :period => 1.second) do |req|
  # If the return value is truthy, the cache key for the return value
  # is incremented and compared with the limit. In this case:
  #   "rack::attack:#{Time.now.to_i/1.second}:load_url_title/req/ip:#{req.ip}"
  #
  # If falsy, the cache key is neither incremented nor checked.

  req.ip if req.path === 'hacks/load_url_title'
end
