$codes = []
if ActiveRecord::Base.connection.table_exists? 'users'
  $codes = ActiveRecord::Base.connection.execute('SELECT code FROM users').map { |user| user['code'] }
end
