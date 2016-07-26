require 'rails_helper'

RSpec.describe Synapse, type: :model do
  it { is_expected.to belong_to :user }
  it { is_expected.to belong_to :topic1 }
  it { is_expected.to belong_to :topic2 }
  it { is_expected.to have_many :maps }
  it { is_expected.to have_many :mappings }
  it { is_expected.to validate_presence_of :permission }
  it { is_expected.to validate_inclusion_of(:permission).in_array Perm::ISSIONS.map(&:to_s) }
  it { is_expected.to validate_inclusion_of(:category).in_array ['from-to', 'both'] }
  it { is_expected.to validate_length_of(:desc).is_at_least(0) } # TODO: don't allow nil
end
