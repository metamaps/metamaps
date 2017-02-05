# frozen_string_literal: true
class UserPreference
  attr_accessor :metacodes, :metacode_focus

  def initialize
    array = []
    %w(Action Aim Idea Question Note Wildcard Subject).each do |m|
      begin
        metacode = Metacode.find_by(name: m)
        array.push(metacode.id.to_s) if metacode
      rescue ActiveRecord::StatementInvalid
        if m == 'Action'
          Rails.logger.warn('TODO: remove this travis workaround in user_preference.rb')
        end
      end
    end
    @metacodes = array
    @metacode_focus = array[0]
  end
end
