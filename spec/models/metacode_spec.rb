require 'rails_helper'

RSpec.describe Metacode, type: :model do
  it { is_expected.to have_many :topics }
  it { is_expected.to have_many :metacode_sets }

  context 'BOTH aws_icon and manual_icon' do
    let(:icon) do
      File.open(Rails.root.join('app', 'assets', 'images',
                                'user.png'))
    end
    let(:metacode) do
      build(:metacode, aws_icon: icon,
                       manual_icon: 'https://metamaps.cc/assets/user.png')
    end
    it 'raises a validation error' do
      expect { metacode.save! }.to raise_error ActiveRecord::RecordInvalid
    end
  end

  context 'NEITHER aws_icon or manual_icon' do
    let(:metacode) { build(:metacode, aws_icon: nil, manual_icon: nil) }
    it 'raises a validation error' do
      expect { metacode.save! }.to raise_error ActiveRecord::RecordInvalid
    end
  end

  context 'non-https manual icon' do
    let(:metacode) { build(:metacode, manual_icon: 'http://metamaps.cc/assets/user.png') }
    it 'raises a validation error' do
      expect { metacode.save! }.to raise_error ActiveRecord::RecordInvalid
    end
  end
end
