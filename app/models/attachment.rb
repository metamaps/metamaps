# frozen_string_literal: true

class Attachment < ApplicationRecord
  belongs_to :attachable, polymorphic: true

  has_attached_file :file,
                    styles: lambda { |a|
                      if a.instance.image?
                        {
                          thumb: 'x128#',
                          medium: 'x320>'
                        }
                      else
                        {}
                      end
                    }

  validates :attachable, presence: true
  validates_attachment_content_type :file, content_type: Attachable.allowed_types
  validates_attachment_size :file, in: 0.megabytes..5.megabytes

  def image?
    Attachable.image_types.include?(file.instance.file_content_type)
  end

  def audio?
    Attachable.audio_types.include?(file.instance.file_content_type)
  end

  def text?
    Attachable.text_types.include?(file.instance.file_content_type)
  end

  def pdf?
    Attachable.pdf_types.include?(file.instance.file_content_type)
  end

  def document?
    text? || pdf?
  end
end
