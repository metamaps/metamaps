# frozen_string_literal: true

class Perm
  # e.g. Perm::ISSIONS
  ISSIONS = %i[commons public private].freeze

  class << self
    def short(permission)
      case permission
      when :commons
        'co'
      when :public
        'pu'
      when :private
        'pr'
      else
        raise 'Invalid permission'
      end
    end

    def long(perm)
      case perm
      when 'co'
        :commons
      when 'pu'
        :public
      when 'pr'
        :private
      else
        raise 'Invalid short permission'
      end
    end

    def valid?(permission)
      ISSIONS.include? permission
    end
  end
end
