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

ActiveRecord::Schema.define(version: 20170208161305) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "access_requests", force: :cascade do |t|
    t.integer  "user_id"
    t.boolean  "approved",   default: false
    t.boolean  "answered",   default: false
    t.integer  "map_id"
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
    t.index ["map_id"], name: "index_access_requests_on_map_id", using: :btree
    t.index ["user_id"], name: "index_access_requests_on_user_id", using: :btree
  end

  create_table "attachments", force: :cascade do |t|
    t.string   "attachable_type"
    t.integer  "attachable_id"
    t.string   "file_file_name"
    t.string   "file_content_type"
    t.integer  "file_file_size"
    t.datetime "file_updated_at"
    t.datetime "created_at",        null: false
    t.datetime "updated_at",        null: false
    t.index ["attachable_type", "attachable_id"], name: "index_attachments_on_attachable_type_and_attachable_id", using: :btree
  end

  create_table "delayed_jobs", force: :cascade do |t|
    t.integer  "priority",   default: 0, null: false
    t.integer  "attempts",   default: 0, null: false
    t.text     "handler",                null: false
    t.text     "last_error"
    t.datetime "run_at"
    t.datetime "locked_at"
    t.datetime "failed_at"
    t.string   "locked_by"
    t.string   "queue"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["priority", "run_at"], name: "delayed_jobs_priority", using: :btree
  end

  create_table "events", force: :cascade do |t|
    t.string   "kind",           limit: 255
    t.integer  "eventable_id"
    t.string   "eventable_type"
    t.integer  "user_id"
    t.integer  "map_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.json     "meta"
    t.index ["eventable_type", "eventable_id"], name: "index_events_on_eventable_type_and_eventable_id", using: :btree
    t.index ["map_id"], name: "index_events_on_map_id", using: :btree
    t.index ["user_id"], name: "index_events_on_user_id", using: :btree
  end

  create_table "in_metacode_sets", force: :cascade do |t|
    t.integer  "metacode_id"
    t.integer  "metacode_set_id"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
    t.index ["metacode_id"], name: "index_in_metacode_sets_on_metacode_id", using: :btree
    t.index ["metacode_set_id"], name: "index_in_metacode_sets_on_metacode_set_id", using: :btree
  end

  create_table "mailboxer_conversation_opt_outs", force: :cascade do |t|
    t.string  "unsubscriber_type"
    t.integer "unsubscriber_id"
    t.integer "conversation_id"
    t.index ["conversation_id"], name: "index_mailboxer_conversation_opt_outs_on_conversation_id", using: :btree
    t.index ["unsubscriber_id", "unsubscriber_type"], name: "index_mailboxer_conversation_opt_outs_on_unsubscriber_id_type", using: :btree
  end

  create_table "mailboxer_conversations", force: :cascade do |t|
    t.string   "subject",    default: ""
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
  end

  create_table "mailboxer_notifications", force: :cascade do |t|
    t.string   "type"
    t.text     "body"
    t.string   "subject",              default: ""
    t.string   "sender_type"
    t.integer  "sender_id"
    t.integer  "conversation_id"
    t.boolean  "draft",                default: false
    t.string   "notification_code"
    t.string   "notified_object_type"
    t.integer  "notified_object_id"
    t.string   "attachment"
    t.datetime "updated_at",                           null: false
    t.datetime "created_at",                           null: false
    t.boolean  "global",               default: false
    t.datetime "expires"
    t.index ["conversation_id"], name: "index_mailboxer_notifications_on_conversation_id", using: :btree
    t.index ["notified_object_id", "notified_object_type"], name: "index_mailboxer_notifications_on_notified_object_id_and_type", using: :btree
    t.index ["sender_id", "sender_type"], name: "index_mailboxer_notifications_on_sender_id_and_sender_type", using: :btree
    t.index ["type"], name: "index_mailboxer_notifications_on_type", using: :btree
  end

  create_table "mailboxer_receipts", force: :cascade do |t|
    t.string   "receiver_type"
    t.integer  "receiver_id"
    t.integer  "notification_id",                            null: false
    t.boolean  "is_read",                    default: false
    t.boolean  "trashed",                    default: false
    t.boolean  "deleted",                    default: false
    t.string   "mailbox_type",    limit: 25
    t.datetime "created_at",                                 null: false
    t.datetime "updated_at",                                 null: false
    t.boolean  "is_delivered",               default: false
    t.string   "delivery_method"
    t.string   "message_id"
    t.index ["notification_id"], name: "index_mailboxer_receipts_on_notification_id", using: :btree
    t.index ["receiver_id", "receiver_type"], name: "index_mailboxer_receipts_on_receiver_id_and_receiver_type", using: :btree
  end

  create_table "mappings", force: :cascade do |t|
    t.text     "category"
    t.integer  "xloc"
    t.integer  "yloc"
    t.integer  "topic_id"
    t.integer  "synapse_id"
    t.integer  "map_id"
    t.integer  "user_id"
    t.datetime "created_at",    null: false
    t.datetime "updated_at",    null: false
    t.integer  "mappable_id"
    t.string   "mappable_type"
    t.integer  "updated_by_id"
    t.index ["map_id", "synapse_id"], name: "index_mappings_on_map_id_and_synapse_id", using: :btree
    t.index ["map_id", "topic_id"], name: "index_mappings_on_map_id_and_topic_id", using: :btree
    t.index ["map_id"], name: "index_mappings_on_map_id", using: :btree
    t.index ["mappable_id", "mappable_type"], name: "index_mappings_on_mappable_id_and_mappable_type", using: :btree
    t.index ["updated_by_id"], name: "index_mappings_on_updated_by_id", using: :btree
    t.index ["user_id"], name: "index_mappings_on_user_id", using: :btree
  end

  create_table "maps", force: :cascade do |t|
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
    t.text     "name"
    t.text     "desc"
    t.text     "permission"
    t.integer  "user_id"
    t.boolean  "arranged"
    t.boolean  "featured"
    t.string   "screenshot_file_name",    limit: 255
    t.string   "screenshot_content_type", limit: 255
    t.integer  "screenshot_file_size"
    t.datetime "screenshot_updated_at"
    t.integer  "source_id"
    t.integer  "updated_by_id"
    t.index ["source_id"], name: "index_maps_on_source_id", using: :btree
    t.index ["updated_by_id"], name: "index_maps_on_updated_by_id", using: :btree
    t.index ["user_id"], name: "index_maps_on_user_id", using: :btree
  end

  create_table "messages", force: :cascade do |t|
    t.text     "message"
    t.integer  "user_id"
    t.integer  "resource_id"
    t.string   "resource_type"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["resource_id"], name: "index_messages_on_resource_id", using: :btree
    t.index ["resource_type"], name: "index_messages_on_resource_type", using: :btree
    t.index ["user_id"], name: "index_messages_on_user_id", using: :btree
  end

  create_table "metacode_sets", force: :cascade do |t|
    t.string   "name",              limit: 255
    t.text     "desc"
    t.integer  "user_id"
    t.boolean  "mapperContributed"
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
    t.index ["user_id"], name: "index_metacode_sets_on_user_id", using: :btree
  end

  create_table "metacodes", force: :cascade do |t|
    t.text     "name"
    t.string   "manual_icon",           limit: 255
    t.datetime "created_at",                        null: false
    t.datetime "updated_at",                        null: false
    t.string   "color",                 limit: 255
    t.string   "aws_icon_file_name"
    t.string   "aws_icon_content_type"
    t.integer  "aws_icon_file_size"
    t.datetime "aws_icon_updated_at"
  end

  create_table "oauth_access_grants", force: :cascade do |t|
    t.integer  "resource_owner_id", null: false
    t.integer  "application_id",    null: false
    t.string   "token",             null: false
    t.integer  "expires_in",        null: false
    t.text     "redirect_uri",      null: false
    t.datetime "created_at",        null: false
    t.datetime "revoked_at"
    t.string   "scopes"
    t.index ["token"], name: "index_oauth_access_grants_on_token", unique: true, using: :btree
  end

  create_table "oauth_access_tokens", force: :cascade do |t|
    t.integer  "resource_owner_id"
    t.integer  "application_id"
    t.string   "token",             null: false
    t.string   "refresh_token"
    t.integer  "expires_in"
    t.datetime "revoked_at"
    t.datetime "created_at",        null: false
    t.string   "scopes"
    t.index ["refresh_token"], name: "index_oauth_access_tokens_on_refresh_token", unique: true, using: :btree
    t.index ["resource_owner_id"], name: "index_oauth_access_tokens_on_resource_owner_id", using: :btree
    t.index ["token"], name: "index_oauth_access_tokens_on_token", unique: true, using: :btree
  end

  create_table "oauth_applications", force: :cascade do |t|
    t.string   "name",                      null: false
    t.string   "uid",                       null: false
    t.string   "secret",                    null: false
    t.text     "redirect_uri",              null: false
    t.string   "scopes",       default: "", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["uid"], name: "index_oauth_applications_on_uid", unique: true, using: :btree
  end

  create_table "stars", force: :cascade do |t|
    t.integer  "user_id"
    t.integer  "map_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["map_id"], name: "index_stars_on_map_id", using: :btree
    t.index ["user_id"], name: "index_stars_on_user_id", using: :btree
  end

  create_table "synapses", force: :cascade do |t|
    t.text     "desc"
    t.text     "category"
    t.integer  "topic1_id"
    t.integer  "topic2_id"
    t.integer  "user_id"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
    t.text     "permission"
    t.text     "weight"
    t.integer  "defer_to_map_id"
    t.integer  "updated_by_id"
    t.index ["topic1_id"], name: "index_synapses_on_node1_id_and_node1_id", using: :btree
    t.index ["topic1_id"], name: "index_synapses_on_topic1_id", using: :btree
    t.index ["topic2_id"], name: "index_synapses_on_node2_id_and_node2_id", using: :btree
    t.index ["topic2_id"], name: "index_synapses_on_topic2_id", using: :btree
    t.index ["updated_by_id"], name: "index_synapses_on_updated_by_id", using: :btree
    t.index ["user_id"], name: "index_synapses_on_user_id", using: :btree
  end

  create_table "tokens", force: :cascade do |t|
    t.string   "token"
    t.string   "description"
    t.integer  "user_id"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.index ["user_id"], name: "index_tokens_on_user_id", using: :btree
  end

  create_table "topics", force: :cascade do |t|
    t.text     "name"
    t.text     "desc"
    t.text     "link"
    t.integer  "user_id"
    t.integer  "metacode_id"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
    t.text     "permission"
    t.integer  "defer_to_map_id"
    t.integer  "updated_by_id"
    t.index ["metacode_id"], name: "index_topics_on_metacode_id", using: :btree
    t.index ["updated_by_id"], name: "index_topics_on_updated_by_id", using: :btree
    t.index ["user_id"], name: "index_topics_on_user_id", using: :btree
  end

  create_table "user_maps", force: :cascade do |t|
    t.integer  "user_id"
    t.integer  "map_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "access_request_id"
    t.index ["access_request_id"], name: "index_user_maps_on_access_request_id", using: :btree
    t.index ["map_id"], name: "index_user_maps_on_map_id", using: :btree
    t.index ["user_id"], name: "index_user_maps_on_user_id", using: :btree
  end

  create_table "users", force: :cascade do |t|
    t.string   "name",                   limit: 255
    t.string   "email",                  limit: 255
    t.string   "crypted_password",       limit: 255
    t.string   "password_salt",          limit: 255
    t.string   "persistence_token",      limit: 255
    t.string   "perishable_token",       limit: 255
    t.datetime "created_at",                                        null: false
    t.datetime "updated_at",                                        null: false
    t.string   "code",                   limit: 8
    t.string   "joinedwithcode",         limit: 8
    t.text     "settings"
    t.string   "encrypted_password",     limit: 128, default: ""
    t.string   "remember_token",         limit: 255
    t.datetime "remember_created_at"
    t.string   "reset_password_token",   limit: 255
    t.datetime "last_sign_in_at"
    t.string   "last_sign_in_ip",        limit: 255
    t.integer  "sign_in_count",                      default: 0
    t.datetime "current_sign_in_at"
    t.string   "current_sign_in_ip",     limit: 255
    t.datetime "reset_password_sent_at"
    t.boolean  "admin"
    t.string   "image_file_name",        limit: 255
    t.string   "image_content_type",     limit: 255
    t.integer  "image_file_size"
    t.datetime "image_updated_at"
    t.integer  "generation"
    t.boolean  "emails_allowed",                     default: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree
  end

  create_table "webhooks", force: :cascade do |t|
    t.integer "hookable_id"
    t.string  "hookable_type"
    t.string  "kind",                       null: false
    t.string  "uri",                        null: false
    t.text    "event_types",   default: [],              array: true
    t.string  "channel"
    t.index ["hookable_type", "hookable_id"], name: "index_webhooks_on_hookable_type_and_hookable_id", using: :btree
  end

  add_foreign_key "access_requests", "maps"
  add_foreign_key "access_requests", "users"
  add_foreign_key "mailboxer_conversation_opt_outs", "mailboxer_conversations", column: "conversation_id", name: "mb_opt_outs_on_conversations_id"
  add_foreign_key "mailboxer_notifications", "mailboxer_conversations", column: "conversation_id", name: "notifications_on_conversation_id"
  add_foreign_key "mailboxer_receipts", "mailboxer_notifications", column: "notification_id", name: "receipts_on_notification_id"
  add_foreign_key "mappings", "users", column: "updated_by_id"
  add_foreign_key "maps", "maps", column: "source_id"
  add_foreign_key "maps", "users", column: "updated_by_id"
  add_foreign_key "synapses", "users", column: "updated_by_id"
  add_foreign_key "tokens", "users"
  add_foreign_key "topics", "users", column: "updated_by_id"
end
