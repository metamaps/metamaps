$codes = []
if ActiveRecord::Base.connection.data_source_exists? 'users'
  $codes = ActiveRecord::Base.connection.execute('SELECT code FROM users').map { |user| user['code'] }
end
