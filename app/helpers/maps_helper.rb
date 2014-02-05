module MapsHelper

  ## this one is for building our custom JSON autocomplete format for typeahead
  def autocomplete_map_array_json(maps)
    temp = []
    maps.each do |m|
      map = {}
      map['id'] = m.id
      map['label'] = m.name
      map['value'] = m.name
      map['description'] = m.desc.truncate(30)
      map['permission'] = m.permission
      map['topicCount'] = m.topics.count
      map['synapseCount'] = m.synapses.count
      map['contributorCount'] = m.contributors.count
      map['rtype'] = "map"
      
      contributorList = m.user.name + ' created this map. '
      if m.contributors.count > 0 
          m.contributors.each_with_index do |c, index|
            comma = (index+1) == m.contributors.count ? '' : ', '
            contributorList += c.name + comma
          end
          contributorList += ' has edited it.' if m.contributors.count == 1
          contributorList += ' have edited it.' if m.contributors.count > 1
      else
        contributorList += 'No one has added anything yet.'      
      end
      map['contributorList'] = contributorList
      
      temp.push map
    end
    return temp
  end

end
