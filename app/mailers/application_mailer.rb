# frozen_string_literal: true
class ApplicationMailer < ActionMailer::Base
  default from: 'team@metamaps.cc'
  layout 'mailer'

  def deliver
    fail NotImplementedError('Please use Mailboxer to send your emails.')
  end
end
