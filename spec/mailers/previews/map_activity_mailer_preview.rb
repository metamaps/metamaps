# frozen_string_literal: true

# Preview all emails at http://localhost:3000/rails/mailers/map_activity_mailer
class MapActivityMailerPreview < ActionMailer::Preview
  def daily_summary
    user = generate_user
    map = generate_map
    generate_recent_activity_on_map(map)
    summary_data = MapActivityService.summarize_data(map, user)
    MapActivityMailer.daily_summary(user, map, summary_data)
  end

  private

  def generate_recent_activity_on_map(map)
    mapping = nil
    mapping2 = nil
    mapping3 = nil
    mapping4 = nil
    mapping5 = nil
    mapping6 = nil
    mapping7 = nil
    mapping8 = nil
    mapping9 = nil
    mapping10 = nil

    Timecop.freeze(2.days.ago) do
      mapping = topic_added_to_map(map)
      mapping2 = topic_added_to_map(map)
      mapping3 = topic_added_to_map(map)
      mapping4 = topic_added_to_map(map)
      mapping5 = topic_added_to_map(map)
      mapping6 = topic_added_to_map(map)
      mapping7 = topic_added_to_map(map)
      mapping8 = topic_added_to_map(map)
      mapping9 = synapse_added_to_map(map, mapping.mappable, mapping2.mappable)
      mapping10 = synapse_added_to_map(map, mapping.mappable, mapping8.mappable)
    end
    Timecop.return

    Timecop.freeze(2.hours.ago) do
      topic_moved_on_map(mapping7)
      topic_moved_on_map(mapping8)
      generate_message(map)
      generate_message(map)
      generate_message(map)
      synapse_added_to_map(map, mapping7.mappable, mapping8.mappable)
      synapse_added_to_map(map, mapping.mappable, mapping8.mappable)
      synapse_removed_from_map(mapping9)
      synapse_removed_from_map(mapping10)
    end
    Timecop.return

    Timecop.freeze(30.minutes.ago) do
      topic_removed_from_map(mapping3)
      topic_removed_from_map(mapping4)
      topic_removed_from_map(mapping5)
      topic_removed_from_map(mapping6)
      topic_added_to_map(map)
      topic_added_to_map(map)
      topic_added_to_map(map)
      topic_added_to_map(map)
      topic_added_to_map(map)
      topic_added_to_map(map)
      topic_added_to_map(map)
      topic_added_to_map(map)
    end
    Timecop.return
  end

  def generate_user
    User.create(name: Faker::Name.name, email: Faker::Internet.email,
                password: 'password', password_confirmation: 'password',
                joinedwithcode: 'qwertyui')
  end

  def generate_map
    Map.create(name: Faker::HarryPotter.book, permission: 'commons',
               arranged: false, user: generate_user)
  end

  def topic_added_to_map(map)
    user = generate_user
    topic = Topic.create(name: Faker::Friends.quote, permission: 'commons', user: user)
    Mapping.create(map: map, mappable: topic, user: user)
  end

  def topic_moved_on_map(mapping)
    meta = { 'x': 10, 'y': 20, 'mapping_id': mapping.id }
    Events::TopicMovedOnMap.publish!(mapping.mappable, mapping.map, generate_user, meta)
  end

  def topic_removed_from_map(mapping)
    user = generate_user
    mapping.updated_by = user
    mapping.destroy
  end

  def synapse_added_to_map(map, topic1, topic2)
    user = generate_user
    topic = Synapse.create(desc: 'describes', permission: 'commons',
                           user: user, topic1: topic1, topic2: topic2)
    Mapping.create(map: map, mappable: topic, user: user)
  end

  def synapse_removed_from_map(mapping)
    user = generate_user
    mapping.updated_by = user
    mapping.destroy
  end

  def generate_message(map)
    Message.create(message: Faker::HarryPotter.quote, resource: map, user: generate_user)
  end
end
