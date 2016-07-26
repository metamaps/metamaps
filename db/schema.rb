# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20_160_401_133_937) do
  # These are extensions that must be enabled in order to support this database
  enable_extension 'plpgsql'

  create_table 'delayed_jobs', force: :cascade do |t|
    t.integer  'priority',   default: 0, null: false
    t.integer  'attempts',   default: 0, null: false
    t.text     'handler',                null: false
    t.text     'last_error'
    t.datetime 'run_at'
    t.datetime 'locked_at'
    t.datetime 'failed_at'
    t.string   'locked_by'
    t.string   'queue'
    t.datetime 'created_at'
    t.datetime 'updated_at'
  end

  add_index 'delayed_jobs', %w(priority run_at), name: 'delayed_jobs_priority', using: :btree

  create_table 'events', force: :cascade do |t|
    t.string   'kind', limit: 255
    t.integer  'eventable_id'
    t.string   'eventable_type'
    t.integer  'user_id'
    t.integer  'map_id'
    t.integer  'sequence_id'
    t.datetime 'created_at'
    t.datetime 'updated_at'
  end

  add_index 'events', %w(eventable_type eventable_id), name: 'index_events_on_eventable_type_and_eventable_id', using: :btree
  add_index 'events', %w(map_id sequence_id), name: 'index_events_on_map_id_and_sequence_id', unique: true, using: :btree
  add_index 'events', ['map_id'], name: 'index_events_on_map_id', using: :btree
  add_index 'events', ['sequence_id'], name: 'index_events_on_sequence_id', using: :btree
  add_index 'events', ['user_id'], name: 'index_events_on_user_id', using: :btree

  create_table 'in_metacode_sets', force: :cascade do |t|
    t.integer  'metacode_id'
    t.integer  'metacode_set_id'
    t.datetime 'created_at',      null: false
    t.datetime 'updated_at',      null: false
  end

  add_index 'in_metacode_sets', ['metacode_id'], name: 'index_in_metacode_sets_on_metacode_id', using: :btree
  add_index 'in_metacode_sets', ['metacode_set_id'], name: 'index_in_metacode_sets_on_metacode_set_id', using: :btree

  create_table 'mappings', force: :cascade do |t|
    t.text     'category'
    t.integer  'xloc'
    t.integer  'yloc'
    t.integer  'topic_id'
    t.integer  'synapse_id'
    t.integer  'map_id'
    t.integer  'user_id'
    t.datetime 'created_at',    null: false
    t.datetime 'updated_at',    null: false
    t.integer  'mappable_id'
    t.string   'mappable_type'
  end

  add_index 'mappings', %w(map_id synapse_id), name: 'index_mappings_on_map_id_and_synapse_id', using: :btree
  add_index 'mappings', %w(map_id topic_id), name: 'index_mappings_on_map_id_and_topic_id', using: :btree
  add_index 'mappings', ['map_id'], name: 'index_mappings_on_map_id', using: :btree
  add_index 'mappings', %w(mappable_id mappable_type), name: 'index_mappings_on_mappable_id_and_mappable_type', using: :btree
  add_index 'mappings', ['user_id'], name: 'index_mappings_on_user_id', using: :btree

  create_table 'maps', force: :cascade do |t|
    t.text     'name'
    t.boolean  'arranged'
    t.text     'desc'
    t.text     'permission'
    t.integer  'user_id'
    t.datetime 'created_at',              null: false
    t.datetime 'updated_at',              null: false
    t.boolean  'featured'
    t.string   'screenshot_file_name'
    t.string   'screenshot_content_type'
    t.integer  'screenshot_file_size'
    t.datetime 'screenshot_updated_at'
  end

  add_index 'maps', ['user_id'], name: 'index_maps_on_user_id', using: :btree

  create_table 'messages', force: :cascade do |t|
    t.text     'message'
    t.integer  'user_id'
    t.integer  'resource_id'
    t.string   'resource_type'
    t.datetime 'created_at'
    t.datetime 'updated_at'
  end

  add_index 'messages', ['resource_id'], name: 'index_messages_on_resource_id', using: :btree
  add_index 'messages', ['resource_type'], name: 'index_messages_on_resource_type', using: :btree
  add_index 'messages', ['user_id'], name: 'index_messages_on_user_id', using: :btree

  create_table 'metacode_sets', force: :cascade do |t|
    t.string   'name'
    t.text     'desc'
    t.integer  'user_id'
    t.boolean  'mapperContributed'
    t.datetime 'created_at',        null: false
    t.datetime 'updated_at',        null: false
  end

  add_index 'metacode_sets', ['user_id'], name: 'index_metacode_sets_on_user_id', using: :btree

  create_table 'metacodes', force: :cascade do |t|
    t.text     'name'
    t.string   'manual_icon'
    t.datetime 'created_at',            null: false
    t.datetime 'updated_at',            null: false
    t.string   'color'
    t.string   'aws_icon_file_name'
    t.string   'aws_icon_content_type'
    t.integer  'aws_icon_file_size'
    t.datetime 'aws_icon_updated_at'
  end

  create_table 'oauth_access_grants', force: :cascade do |t|
    t.integer  'resource_owner_id', null: false
    t.integer  'application_id',    null: false
    t.string   'token',             null: false
    t.integer  'expires_in',        null: false
    t.text     'redirect_uri',      null: false
    t.datetime 'created_at',        null: false
    t.datetime 'revoked_at'
    t.string   'scopes'
  end

  add_index 'oauth_access_grants', ['token'], name: 'index_oauth_access_grants_on_token', unique: true, using: :btree

  create_table 'oauth_access_tokens', force: :cascade do |t|
    t.integer  'resource_owner_id'
    t.integer  'application_id'
    t.string   'token', null: false
    t.string   'refresh_token'
    t.integer  'expires_in'
    t.datetime 'revoked_at'
    t.datetime 'created_at', null: false
    t.string   'scopes'
  end

  add_index 'oauth_access_tokens', ['refresh_token'], name: 'index_oauth_access_tokens_on_refresh_token', unique: true, using: :btree
  add_index 'oauth_access_tokens', ['resource_owner_id'], name: 'index_oauth_access_tokens_on_resource_owner_id', using: :btree
  add_index 'oauth_access_tokens', ['token'], name: 'index_oauth_access_tokens_on_token', unique: true, using: :btree

  create_table 'oauth_applications', force: :cascade do |t|
    t.string   'name',                      null: false
    t.string   'uid',                       null: false
    t.string   'secret',                    null: false
    t.text     'redirect_uri',              null: false
    t.string   'scopes', default: '', null: false
    t.datetime 'created_at'
    t.datetime 'updated_at'
  end

  add_index 'oauth_applications', ['uid'], name: 'index_oauth_applications_on_uid', unique: true, using: :btree

  create_table 'synapses', force: :cascade do |t|
    t.text     'desc'
    t.text     'category'
    t.text     'weight'
    t.text     'permission'
    t.integer  'node1_id'
    t.integer  'node2_id'
    t.integer  'user_id'
    t.datetime 'created_at',      null: false
    t.datetime 'updated_at',      null: false
    t.integer  'defer_to_map_id'
  end

  add_index 'synapses', %w(node1_id node1_id), name: 'index_synapses_on_node1_id_and_node1_id', using: :btree
  add_index 'synapses', ['node1_id'], name: 'index_synapses_on_node1_id', using: :btree
  add_index 'synapses', %w(node2_id node2_id), name: 'index_synapses_on_node2_id_and_node2_id', using: :btree
  add_index 'synapses', ['node2_id'], name: 'index_synapses_on_node2_id', using: :btree
  add_index 'synapses', ['user_id'], name: 'index_synapses_on_user_id', using: :btree

  create_table 'tokens', force: :cascade do |t|
    t.string   'token'
    t.string   'description'
    t.integer  'user_id'
    t.datetime 'created_at',  null: false
    t.datetime 'updated_at',  null: false
  end

  add_index 'tokens', ['user_id'], name: 'index_tokens_on_user_id', using: :btree

  create_table 'topics', force: :cascade do |t|
    t.text     'name'
    t.text     'desc'
    t.text     'link'
    t.text     'permission'
    t.integer  'user_id'
    t.integer  'metacode_id'
    t.datetime 'created_at',         null: false
    t.datetime 'updated_at',         null: false
    t.string   'image_file_name'
    t.string   'image_content_type'
    t.integer  'image_file_size'
    t.datetime 'image_updated_at'
    t.string   'audio_file_name'
    t.string   'audio_content_type'
    t.integer  'audio_file_size'
    t.datetime 'audio_updated_at'
    t.integer  'defer_to_map_id'
  end

  add_index 'topics', ['metacode_id'], name: 'index_topics_on_metacode_id', using: :btree
  add_index 'topics', ['user_id'], name: 'index_topics_on_user_id', using: :btree

  create_table 'user_maps', force: :cascade do |t|
    t.integer  'user_id'
    t.integer  'map_id'
    t.datetime 'created_at'
    t.datetime 'updated_at'
  end

  add_index 'user_maps', ['map_id'], name: 'index_user_maps_on_map_id', using: :btree
  add_index 'user_maps', ['user_id'], name: 'index_user_maps_on_user_id', using: :btree

  create_table 'users', force: :cascade do |t|
    t.string   'name'
    t.string   'email'
    t.text     'settings'
    t.string   'code',                   limit: 8
    t.string   'joinedwithcode',         limit: 8
    t.string   'crypted_password'
    t.string   'password_salt'
    t.string   'persistence_token'
    t.string   'perishable_token'
    t.datetime 'created_at',                                      null: false
    t.datetime 'updated_at',                                      null: false
    t.string   'encrypted_password', limit: 128, default: ''
    t.string   'remember_token'
    t.datetime 'remember_created_at'
    t.string   'reset_password_token'
    t.datetime 'last_sign_in_at'
    t.string   'last_sign_in_ip'
    t.integer  'sign_in_count', default: 0
    t.datetime 'current_sign_in_at'
    t.string   'current_sign_in_ip'
    t.datetime 'reset_password_sent_at'
    t.boolean  'admin'
    t.string   'image_file_name'
    t.string   'image_content_type'
    t.integer  'image_file_size'
    t.datetime 'image_updated_at'
    t.integer  'generation'
  end

  add_index 'users', ['reset_password_token'], name: 'index_users_on_reset_password_token', unique: true, using: :btree

  create_table 'webhooks', force: :cascade do |t|
    t.integer 'hookable_id'
    t.string  'hookable_type'
    t.string  'kind',                       null: false
    t.string  'uri',                        null: false
    t.text    'event_types', default: [], array: true
  end

  add_index 'webhooks', %w(hookable_type hookable_id), name: 'index_webhooks_on_hookable_type_and_hookable_id', using: :btree

  add_foreign_key 'tokens', 'users'
end
