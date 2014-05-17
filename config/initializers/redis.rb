if Rails.env.development?  ## this also applies to metamaps.cc production mode
  $redis = Redis.new(:host => 'localhost', :port=> 6379)
elsif Rails.env.production?  ## this is for the heroku staging environment
  uri = URI.parse(ENV["REDISTOGO_URL"])
  $redis = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)
end