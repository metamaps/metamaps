# frozen_string_literal: true

# notification codes to differentiate different types of notifications
# e.g. a notification might have {
#   notified_object_type: 'Map',
#   notified_object_id: 1,
#   notification_code: MAILBOXER_CODE_ACCESS_REQUEST
# },
# which would imply that this is an access request to Map.find(1)
MESSAGE_FROM_DEVS = 'MESSAGE_FROM_DEVS'

# these ones are old and can't change without a migration
MAP_ACCESS_APPROVED = 'ACCESS_APPROVED'
MAP_ACCESS_REQUEST  = 'ACCESS_REQUEST'
MAP_INVITE_TO_EDIT  = 'INVITE_TO_EDIT'

# these ones are new
# this one's a catch all for occurences on the map
# MAP_ACTIVITY = 'MAP_ACTIVITY'
# MAP_RECEIVED_TOPIC
# MAP_LOST_TOPIC
# MAP_TOPIC_MOVED
# MAP_RECEIVED_SYNAPSE
# MAP_LOST_SYNAPSE
# MAP_COLLABORATOR_ADDED
# MAP_UPDATED
# ADD_MAP_FORKED
# MAP_ADDED_TO_MAP
# MAP_MESSAGE
# MAP_STARRED
# MAP_COLLABORATOR_REMOVED

TOPIC_ADDED_TO_MAP  = 'TOPIC_ADDED_TO_MAP'
TOPIC_CONNECTED_1   = 'TOPIC_CONNECTED_1'
TOPIC_CONNECTED_2   = 'TOPIC_CONNECTED_2'
# TOPIC_DELETED
# TOPIC_DISCONNECTED
# TOPIC_UPDATED
# TOPIC_REMOVED_FROM_MAP

Mailboxer.setup do |config|
  # Configures if your application uses or not email sending for Notifications and Messages
  config.uses_emails = true

  # Configures the default from for emails sent for Messages and Notifications
  config.default_from = 'team@metamaps.cc'

  # Configures the methods needed by mailboxer
  config.email_method = :mailboxer_email
  config.name_method = :name

  # Configures if you use or not a search engine and which one you are using
  # Supported engines: [:solr,:sphinx]
  config.search_enabled = false
  config.search_engine = :solr

  # Configures maximum length of the message subject and body
  config.subject_max_length = 255
  config.body_max_length = 32_000
end
