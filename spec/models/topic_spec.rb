# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Topic, type: :model do
  it { is_expected.to belong_to :user }
  it { is_expected.to belong_to :metacode }
  it { is_expected.to have_many :maps }
  it { is_expected.to have_many :mappings }
  it { is_expected.to validate_presence_of :permission }
  it { is_expected.to validate_inclusion_of(:permission).in_array Perm::ISSIONS.map(&:to_s) }

  describe 'attachments_json' do
    let (:attachments) do
      create_list(:attachment, 1,
                  file_file_name: 'file_name',
                  file_content_type: 'text/plain',
                  file_file_size: '100')
    end
    let (:topic) { create(:topic, attachments: attachments) }
    let(:json) { topic.attachments_json }

    it 'returns correct json' do
      expect(json.first[:id]).to equal(attachments.first.id)
      binding.pry
    end
  end
end
