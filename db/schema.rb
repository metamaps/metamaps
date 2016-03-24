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

ActiveRecord::Schema.define(version: 20160120061513) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "in_metacode_sets", force: :cascade do |t|
    t.integer  "metacode_id"
    t.integer  "metacode_set_id"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
  end

  add_index "in_metacode_sets", ["metacode_id"], name: "index_in_metacode_sets_on_metacode_id", using: :btree
  add_index "in_metacode_sets", ["metacode_set_id"], name: "index_in_metacode_sets_on_metacode_set_id", using: :btree

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
  end

  add_index "mappings", ["map_id", "synapse_id"], name: "index_mappings_on_map_id_and_synapse_id", using: :btree
  add_index "mappings", ["map_id", "topic_id"], name: "index_mappings_on_map_id_and_topic_id", using: :btree
  add_index "mappings", ["map_id"], name: "index_mappings_on_map_id", using: :btree
  add_index "mappings", ["mappable_id", "mappable_type"], name: "index_mappings_on_mappable_id_and_mappable_type", using: :btree
  add_index "mappings", ["user_id"], name: "index_mappings_on_user_id", using: :btree

  create_table "maps", force: :cascade do |t|
    t.text     "name"
    t.boolean  "arranged"
    t.text     "desc"
    t.text     "permission"
    t.integer  "user_id"
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
    t.boolean  "featured"
    t.string   "screenshot_file_name"
    t.string   "screenshot_content_type"
    t.integer  "screenshot_file_size"
    t.datetime "screenshot_updated_at"
  end

  add_index "maps", ["user_id"], name: "index_maps_on_user_id", using: :btree

  create_table "metacode_sets", force: :cascade do |t|
    t.string   "name"
    t.text     "desc"
    t.integer  "user_id"
    t.boolean  "mapperContributed"
    t.datetime "created_at",        null: false
    t.datetime "updated_at",        null: false
  end

  add_index "metacode_sets", ["user_id"], name: "index_metacode_sets_on_user_id", using: :btree

  create_table "metacodes", force: :cascade do |t|
    t.text     "name"
    t.string   "icon"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string   "color"
  end

  create_table "synapses", force: :cascade do |t|
    t.text     "desc"
    t.text     "category"
    t.text     "weight"
    t.text     "permission"
    t.integer  "node1_id"
    t.integer  "node2_id"
    t.integer  "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "synapses", ["node1_id", "node1_id"], name: "index_synapses_on_node1_id_and_node1_id", using: :btree
  add_index "synapses", ["node1_id"], name: "index_synapses_on_node1_id", using: :btree
  add_index "synapses", ["node2_id", "node2_id"], name: "index_synapses_on_node2_id_and_node2_id", using: :btree
  add_index "synapses", ["node2_id"], name: "index_synapses_on_node2_id", using: :btree
  add_index "synapses", ["user_id"], name: "index_synapses_on_user_id", using: :btree

  create_table "topics", force: :cascade do |t|
    t.text     "name"
    t.text     "desc"
    t.text     "link"
    t.text     "permission"
    t.integer  "user_id"
    t.integer  "metacode_id"
    t.datetime "created_at",         null: false
    t.datetime "updated_at",         null: false
    t.string   "image_file_name"
    t.string   "image_content_type"
    t.integer  "image_file_size"
    t.datetime "image_updated_at"
    t.string   "audio_file_name"
    t.string   "audio_content_type"
    t.integer  "audio_file_size"
    t.datetime "audio_updated_at"
  end

  add_index "topics", ["metacode_id"], name: "index_topics_on_metacode_id", using: :btree
  add_index "topics", ["user_id"], name: "index_topics_on_user_id", using: :btree

  create_table "users", force: :cascade do |t|
    t.string   "name"
    t.string   "email"
    t.text     "settings"
    t.string   "code",                   limit: 8
    t.string   "joinedwithcode",         limit: 8
    t.string   "crypted_password"
    t.string   "password_salt"
    t.string   "persistence_token"
    t.string   "perishable_token"
    t.datetime "created_at",                                      null: false
    t.datetime "updated_at",                                      null: false
    t.string   "encrypted_password",     limit: 128, default: ""
    t.string   "remember_token"
    t.datetime "remember_created_at"
    t.string   "reset_password_token"
    t.datetime "last_sign_in_at"
    t.string   "last_sign_in_ip"
    t.integer  "sign_in_count",                      default: 0
    t.datetime "current_sign_in_at"
    t.string   "current_sign_in_ip"
    t.datetime "reset_password_sent_at"
    t.boolean  "admin"
    t.string   "image_file_name"
    t.string   "image_content_type"
    t.integer  "image_file_size"
    t.datetime "image_updated_at"
    t.integer  "generation"
  end

  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

end
