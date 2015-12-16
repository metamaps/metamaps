RSpec.configure do |config|
  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end

  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end

  # Print the 10 slowest examples and example groups at the
  # end of the spec run, to help surface which specs are running
  # particularly slow.
  config.profile_examples = 10
end

def random_string(length = 10)
  o = [('a'..'z'), ('A'..'Z')].map(&:to_a).flatten
  (0...length).map { o[rand(o.length)] }.join
end
