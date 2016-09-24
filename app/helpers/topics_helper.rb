# frozen_string_literal: true
module TopicsHelper
  ## this one is for building our custom JSON autocomplete format for typeahead
  def autocomplete_array_json(topics)
    topics.map do |t|
      {
        id: t.id,
        label: t.name,
        value: t.name,
        description: t.desc ? t.desc&.truncate(70) : '', # make this return matched results
        type: t.metacode.name,
        typeImageURL: t.metacode.icon,
        permission: t.permission,
        mapCount: t.maps.count,
        synapseCount: t.synapses.count,
        originator: t.user.name,
        originatorImage: t.user.image.url(:thirtytwo),
        rtype: :topic,
        inmaps: t.inmaps,
        inmapsLinks: t.inmapsLinks
      }
    end
  end

  # recursively find all nodes in any given nodes network
  def network(node, array, count)
    array = [] if array.nil?
    array.push(node)
    return array if count.zero?

    # check if each relative is already in the array and if not, call the network function again
    remaining_relatives = node.relatives.to_a - array
    remaining_relatives.each do |relative|
      array = (array | network(relative, array, count - 1))
    end

    array
  end
end
