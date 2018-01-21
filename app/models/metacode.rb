# frozen_string_literal: true

class Metacode < ApplicationRecord
  has_many :in_metacode_sets
  has_many :metacode_sets, through: :in_metacode_sets
  has_many :topics

  # This method associates the attribute ":aws_icon" with a file attachment
  has_attached_file :aws_icon, styles: { ninetysix: ['96x96#', :png] },
                               default_url: 'https://s3.amazonaws.com/metamaps-assets/metacodes/generics/96px/gen_wildcard.png'

  # Validate the attached icon is image/jpg, image/png, etc
  validates_attachment_content_type :aws_icon, content_type: %r{\Aimage/.*\Z}

  validate :aws_xor_manual_icon
  validate :manual_icon_https
  before_create do
    self.manual_icon = nil if manual_icon == ''
  end

  def icon(*args)
    if manual_icon.present?
      manual_icon
    else
      aws_icon(*args)
    end
  end

  def as_json(options = {})
    default = super(options)
    default[:icon] = icon
    default.except(
      'aws_icon_file_name', 'aws_icon_content_type', 'aws_icon_file_size', 'aws_icon_updated_at',
      'manual_icon'
    )
  end

  def in_metacode_set(metacode_set)
    return true if metacode_sets.include? metacode_set
    false
  end

  private

  def aws_xor_manual_icon
    if aws_icon.blank? && manual_icon.blank?
      errors.add(:base, 'Either aws_icon or manual_icon is required')
    end
    if aws_icon.present? && manual_icon.present?
      errors.add(:base, 'Specify aws_icon or manual_icon, not both')
    end
  end

  def manual_icon_https
    return if manual_icon.blank?
    unless manual_icon.starts_with? 'https'
      errors.add(:base, 'Manual icon must begin with https')
    end
  end
end
