# frozen_string_literal: true
module TopicsHelper
  ## this one is for building our custom JSON autocomplete format for typeahead
  def autocomplete_array_json(topics)
    topics.map do |t|
      is_map = t.is_a?(Map)
      {
        id: t.id,
        label: t.name,
        value: t.name,
        description: t.desc ? t.desc&.truncate(70) : '', # make this return matched results
        originator: t.user.name,
        originatorImage: t.user.image.url(:thirtytwo),
        permission: t.permission,

        rtype: is_map ? 'map' : 'topic',
        inmaps: is_map ? [] : t.inmaps,
        inmapsLinks: is_map ? [] : t.inmapsLinks
        type: is_map ? metamapsMetacode.name : t.metacode.name,
        typeImageURL: is_map ? metamapMetacode.icon : t.metacode.icon,
        mapCount: is_map ? 0 : t.maps.count,
        synapseCount: is_map ? 0 : t.synapses.count,
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
