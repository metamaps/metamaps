class MainPolicy < ApplicationPolicy
  def initialize(user, _record)
    @user = user
    @record = nil
  end

  def home?
    true
  end

  def searchtopics?
    true
  end

  def searchmaps?
    true
  end

  def searchmappers?
    true
  end

  def searchsynapses?
    true
  end
end
