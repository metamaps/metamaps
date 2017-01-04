if ENV['COVERAGE'] == 'on'
  SimpleCov.start 'rails' do
    add_group 'Policies', 'app/policies'
    add_group 'Services', 'app/services'
    add_group 'Serializers', 'app/serializers'
  end
end
