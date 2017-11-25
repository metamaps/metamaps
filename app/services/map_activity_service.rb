# frozen_string_literal: true

class MapActivityService
  def self.subject_line(map)
    'Activity on map ' + map.name
  end

  def self.summarize_data(map, user, until_moment = DateTime.now)
    results = {
      stats: {}
    }

    since = until_moment - 24.hours

    scoped_topic_ids = TopicPolicy::Scope.new(user, map.topics).resolve.map(&:id)
    scoped_synapse_ids = SynapsePolicy::Scope.new(user, map.synapses).resolve.map(&:id)

    message_count = Message.where(resource: map)
                           .where('created_at > ? AND created_at < ?', since, until_moment)
                           .where.not(user: user).count
    results[:stats][:messages_sent] = message_count if message_count > 0

    moved_count = Event.where(kind: 'topic_moved_on_map', map: map)
                       .where('created_at > ? AND created_at < ?', since, until_moment)
                       .where(eventable_id: scoped_topic_ids)
                       .where.not(user: user).group(:eventable_id).count
    unless moved_count.keys.empty?
      results[:stats][:topics_moved] = moved_count.keys.length
    end

    topics_added_events = Event.where(kind: 'topic_added_to_map', map: map)
                               .where('created_at > ? AND created_at < ?', since, until_moment)
                               .where.not(user: user)
                               .order(:created_at)

    topics_removed_events = Event.where(kind: 'topic_removed_from_map', map: map)
                                 .where('created_at > ? AND created_at < ?', since, until_moment)
                                 .where.not(user: user)
                                 .order(:created_at)

    topics_added_to_include = {}
    topics_added_events.each do |ta|
      num_adds = topics_added_events.where(eventable_id: ta.eventable_id).count
      num_removes = topics_removed_events.where(eventable_id: ta.eventable_id).count
      topics_added_to_include[ta.eventable_id] = ta if num_adds > num_removes && scoped_topic_ids.include?(ta.eventable.id)
    end
    unless topics_added_to_include.keys.empty?
      results[:stats][:topics_added] = topics_added_to_include.keys.length
      results[:topics_added] = topics_added_to_include.values
    end

    topics_removed_to_include = {}
    topics_removed_events.each do |ta|
      num_adds = topics_added_events.where(eventable_id: ta.eventable_id).count
      num_removes = topics_removed_events.where(eventable_id: ta.eventable_id).count
      topics_removed_to_include[ta.eventable_id] = ta if num_removes > num_adds && TopicPolicy.new(user, ta.eventable).show?
    end
    unless topics_removed_to_include.keys.empty?
      results[:stats][:topics_removed] = topics_removed_to_include.keys.length
      results[:topics_removed] = topics_removed_to_include.values
    end

    synapses_added_events = Event.where(kind: 'synapse_added_to_map', map: map)
                                 .where('created_at > ? AND created_at < ?', since, until_moment)
                                 .where.not(user: user)
                                 .order(:created_at)

    synapses_removed_events = Event.where(kind: 'synapse_removed_from_map', map: map)
                                   .where('created_at > ? AND created_at < ?', since, until_moment)
                                   .where.not(user: user)
                                   .order(:created_at)

    synapses_added_to_include = {}
    synapses_added_events.each do |ta|
      num_adds = synapses_added_events.where(eventable_id: ta.eventable_id).count
      num_removes = synapses_removed_events.where(eventable_id: ta.eventable_id).count
      synapses_added_to_include[ta.eventable_id] = ta if num_adds > num_removes && scoped_synapse_ids.include?(ta.eventable.id)
    end
    unless synapses_added_to_include.keys.empty?
      results[:stats][:synapses_added] = synapses_added_to_include.keys.length
      results[:synapses_added] = synapses_added_to_include.values
    end

    synapses_removed_to_include = {}
    synapses_removed_events.each do |ta|
      num_adds = synapses_added_events.where(eventable_id: ta.eventable_id).count
      num_removes = synapses_removed_events.where(eventable_id: ta.eventable_id).count
      synapses_removed_to_include[ta.eventable_id] = ta if num_removes > num_adds && SynapsePolicy.new(user, ta.eventable).show?
    end
    unless synapses_removed_to_include.keys.empty?
      results[:stats][:synapses_removed] = synapses_removed_to_include.keys.length
      results[:synapses_removed] = synapses_removed_to_include.values
    end

    results
  end
end
