if Rails.env.development?
$redis = Redis.new(:host => 'localhost', :port=> 6379)
elsif Rails.env.production?
  uri = URI.parse(ENV["REDISTOGO_URL"])
  $redis = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)
end