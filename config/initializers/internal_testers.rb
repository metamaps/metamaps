# frozen_string_literal: true

TESTER_EMAILS = %w[
  connorturland@gmail.com devin@callysto.com chessscholar@gmail.com solaureum@gmail.com
  ishanshapiro@gmail.com
].freeze

# rubocop:disable Style/PredicateName
def is_tester(user)
  user && TESTER_EMAILS.include?(user.email)
end
# rubocop:enable Style/PredicateName
