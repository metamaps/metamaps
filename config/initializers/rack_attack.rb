# frozen_string_literal: true
module Rack
  class Attack
    Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new

    # Throttle all requests by IP (60rpm)
    #
    # Key: "rack::attack:#{Time.now.to_i/:period}:req/ip:#{req.ip}"
    # throttle('req/ip', :limit => 300, :period => 5.minutes) do |req|
    #   req.ip # unless req.path.start_with?('/assets')
    # end

    # Throttle POST requests to /login by IP address
    #
    # Key: "rack::attack:#{Time.now.to_i/:period}:logins/ip:#{req.ip}"
    throttle('logins/ip', limit: 5, period: 20.seconds) do |req|
      req.ip if req.path == '/login' && req.post?
    end

    # Throttle POST requests to /login by email param
    #
    # Key: "rack::attack:#{Time.now.to_i/:period}:logins/email:#{req.email}"
    #
    # Note: This creates a problem where a malicious user could intentionally
    # throttle logins for another user and force their login requests to be
    # denied, but that's not very common and shouldn't happen to you. (Knock
    # on wood!)
    throttle('logins/email', limit: 5, period: 20.seconds) do |req|
      if req.path == '/login' && req.post?
        # return the email if present, nil otherwise
        req.params['email'].presence
      end
    end

    throttle('load_url_title/req/5mins/ip', limit: 300, period: 5.minutes) do |req|
      req.ip if req.path == 'hacks/load_url_title'
    end
    throttle('load_url_title/req/1s/ip', limit: 5, period: 1.second) do |req|
      # If the return value is truthy, the cache key for the return value
      # is incremented and compared with the limit. In this case:
      #   "rack::attack:#{Time.now.to_i/1.second}:load_url_title/req/ip:#{req.ip}"
      #
      # If falsy, the cache key is neither incremented nor checked.

      req.ip if req.path == 'hacks/load_url_title'
    end

    self.throttled_response = lambda do |env|
      now = Time.zone.now
      match_data = env['rack.attack.match_data']
      period = match_data[:period]
      limit = match_data[:limit]

      headers = {
        'X-RateLimit-Limit' => limit.to_s,
        'X-RateLimit-Remaining' => '0',
        'X-RateLimit-Reset' => (now + (period - now.to_i % period)).to_s
      }

      [429, headers, ['']]
    end
  end
end
