# frozen_string_literal: true
module MapsHelper
  # JSON autocomplete format for typeahead
  def autocomplete_map_array_json(maps)
    maps.map do |m|
      {
        id: m.id,
        label: m.name,
        value: m.name,
        description: m.desc.try(:truncate, 30),
        permission: m.permission,
        topicCount: m.topics.count,
        synapseCount: m.synapses.count,
        contributorCount: m.contributors.count,
        rtype: 'map',
        contributorTip: contributor_tip(m),
        mapContributorImage: first_contributor_image(m)
      }
    end
  end

  def first_contributor_image(map)
    if map.contributors.count.positive?
      return map.contributors[0].image.url(:thirtytwo)
    end
    'https://s3.amazonaws.com/metamaps-assets/site/user.png'
  end

  def contributor_tip(map)
    output = ''
    if map.contributors.count.positive?
      map.contributors.each_with_index do |contributor, _index|
        user_image = contributor.image.url(:thirtytwo)
        output += '<li>'
        output += %(<img class="tipUserImage" width="25" height="25" src="#{user_image}" />)
        output += "<span>#{contributor.name}</span>"
        output += '</li>'
      end
    end
    output
  end
end
