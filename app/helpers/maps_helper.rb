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
      
      contributorTip = ''
      firstContributorImage = 'https://s3.amazonaws.com/metamaps-assets/site/user.png'
      if m.contributors.count > 0 
        firstContributorImage = m.contributors[0].image.url(:thirtytwo)
        m.contributors.each_with_index do |c, index|
          userImage = c.image.url(:thirtytwo)
          name = c.name
          contributorTip += '<li> <img class="tipUserImage" width="25" height="25" src=' + userImage + ' />' + '<span>' + name + '</span> </li>'         
        end
      end
      map['contributorTip'] = contributorTip
      map['mapContributorImage'] = firstContributorImage

      temp.push map
    end
    return temp
  end

end
