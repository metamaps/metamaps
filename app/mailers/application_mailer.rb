# frozen_string_literal: true
class ApplicationMailer < ActionMailer::Base
  default from: 'team@metamaps.cc'
  layout 'mailer'

  def deliver
    raise NotImplementedError('Please use Mailboxer to send your emails.')
  end
end
