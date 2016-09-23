class ExplorePolicy < ApplicationPolicy
  def activemaps?
    true
  end

  def featuredmaps?
    true
  end

  def mymaps?
    true
  end

  def sharedmaps?
    true
  end

  def starredmaps?
    true
  end

  def usermaps?
    true
  end
end
