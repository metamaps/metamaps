# frozen_string_literal: true

def is_tester(user)
  user && %w[
    connorturland@gmail.com devin@callysto.com chessscholar@gmail.com solaureum@gmail.com
    ishanshapiro@gmail.com
  ].include?(user.email)
end
