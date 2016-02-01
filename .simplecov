if  ENV['COVERAGE_FORMATTER'] == 'rcov'
  require 'simplecov-rcov'
  SimpleCov.formatter = SimpleCov::Formatter::RcovFormatter
end
if ENV['COVERAGE'] == 'on'
  SimpleCov.start 'rails'
end
