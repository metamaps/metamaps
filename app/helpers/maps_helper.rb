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
      
      contributorList = ''
      if m.contributors.count > 0 
        contributorList += '<ul>'
          m.contributors.each do |c|
            contributorList += '<li>' + c.name + '</li>'
          end
        contributorList += '</ul>'      
      end
      map['contributorList'] = contributorList
      
      temp.push map
    end
    return temp
  end

end
