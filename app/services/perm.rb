class Perm
  # e.g. Perm::ISSIONS
  ISSIONS = [:commons, :public, :private]

  class << self
  
    def short(permission)
      case permission
      when :commons
        "co"
      when :public
        "pu"
      when :private
        "pr"
      else
        fail "Invalid permission"
      end
    end

    def long(perm)
      case perm
      when "co"
        :commons
      when "pu"
        :public
      when "pr"
        :private
      else
        fail "Invalid short permission"
      end
    end
  
    def valid?(permission)
      ISSIONS.include? permission
    end
  end
end
