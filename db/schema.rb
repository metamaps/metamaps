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
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20140210031525) do

  create_table "mappings", :force => true do |t|
    t.text     "category"
    t.integer  "xloc"
    t.integer  "yloc"
    t.integer  "topic_id"
    t.integer  "synapse_id"
    t.integer  "map_id"
    t.integer  "user_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "maps", :force => true do |t|
    t.text     "name"
    t.boolean  "arranged"
    t.text     "desc"
    t.text     "permission"
    t.integer  "user_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
    t.boolean  "featured"
  end

  create_table "metacodes", :force => true do |t|
    t.text     "name"
    t.string   "icon"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "synapses", :force => true do |t|
    t.text     "desc"
    t.text     "category"
    t.text     "weight"
    t.text     "permission"
    t.integer  "node1_id"
    t.integer  "node2_id"
    t.integer  "user_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "topics", :force => true do |t|
    t.text     "name"
    t.text     "desc"
    t.text     "link"
    t.text     "permission"
    t.integer  "user_id"
    t.integer  "metacode_id"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  create_table "users", :force => true do |t|
    t.string   "name"
    t.string   "email"
    t.text     "settings"
    t.string   "code",                   :limit => 8
    t.string   "joinedwithcode",         :limit => 8
    t.string   "crypted_password"
    t.string   "password_salt"
    t.string   "persistence_token"
    t.string   "perishable_token"
    t.datetime "created_at",                                            :null => false
    t.datetime "updated_at",                                            :null => false
    t.string   "encrypted_password",     :limit => 128, :default => ""
    t.string   "remember_token"
    t.datetime "remember_created_at"
    t.string   "reset_password_token"
    t.datetime "last_sign_in_at"
    t.string   "last_sign_in_ip"
    t.integer  "sign_in_count",                         :default => 0
    t.datetime "current_sign_in_at"
    t.string   "current_sign_in_ip"
    t.datetime "reset_password_sent_at"
    t.boolean  "admin"
  end

  add_index "users", ["reset_password_token"], :name => "index_users_on_reset_password_token", :unique => true

end
