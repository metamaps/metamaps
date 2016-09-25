# frozen_string_literal: true
METAMAPS_VERSION = '2.9'
METAMAPS_BUILD = `git log -1 --pretty=%H`.chomp.freeze
METAMAPS_LAST_UPDATED = `git log -1 --pretty='%ad'`.split(' ').values_at(1, 2, 4).join(' ').freeze
