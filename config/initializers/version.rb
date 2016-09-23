METAMAPS_VERSION = "2 build `git log -1 --pretty=%H`".freeze
METAMAPS_LAST_UPDATED = `git log -1 --pretty='%ad'`.split(' ').values_at(1,2,4).join(' ').freeze
