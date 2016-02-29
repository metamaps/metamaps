require 'rails_helper'

RSpec.describe Metacode, type: :model do
  it { is_expected.to have_many :topics }
  it { is_expected.to have_many :metacode_sets }
end
