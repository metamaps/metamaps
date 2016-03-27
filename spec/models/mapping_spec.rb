require 'rails_helper'

RSpec.describe Mapping, type: :model do
  it { is_expected.to belong_to :user }
  it { is_expected.to belong_to :map }
  it { is_expected.to belong_to :mappable }
  it { is_expected.to validate_presence_of :xloc }
  it { is_expected.to validate_presence_of :yloc }
  it { is_expected.to validate_presence_of :map }
  it { is_expected.to validate_presence_of :mappable }
end
