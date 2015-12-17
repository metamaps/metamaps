require 'rails_helper'

RSpec.describe Map, type: :model do
  # TODO: what is it important to be sure about when working with a Map?
  it { is_expected.to belong_to :user }
  it { is_expected.to validate_presence_of :name }
  it { is_expected.to validate_presence_of :arranged }
  it { is_expected.to validate_presence_of :permission }
  it { is_expected.to validate_inclusion_of(:permission).in_array Perm::ISSIONS.map(&:to_s) }
end

