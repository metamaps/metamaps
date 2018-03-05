

{ metacodes = current_user.settings.metacodes }
{ selectedSet = metacodes[0].include?("metacodeset") ? metacodes[0].sub("metacodeset-","")  : "custom" }
{ allMetacodeSets = MetacodeSet.order("name").all.to_a }
{ if selectedSet == "custom" 
     index = allMetacodeSets.length + 2
   elsif selectedSet == 'Recent'
     index = 0
   elsif selectedSet == 'Most'
     index = 1
   else
     set = MetacodeSet.find(selectedSet.to_i)
     index = allMetacodeSets.index(set) + 2 
   end }
<h3>Switch Metacode Set</h3>

<p>Use metacode sets to enter different modes of mapping.</p>
        
<div id="metacodeSwitchTabs">
  <ul>
    <li><a href="#metacodeSwitchTabsRecent" data-set-id="recent" id="metacodeSetRecent">RECENTLY USED</a></li>
    <li><a href="#metacodeSwitchTabsMost" data-set-id="most" id="metacodeSetMost">MOST USED</a></li>
    { allMetacodeSets.each do |m| }
    <li><a href="#metacodeSwitchTabs{ m.id }" data-set-id="{ m.id }">{ m.name }</a></li>
    { end }
    <li><a href="#metacodeSwitchTabsCustom" data-set-id="custom" id="metacodeSetCustom">CUSTOM SELECTION</a></li>
  </ul>
  { recent = user_recent_metacodes() }
  <div id="metacodeSwitchTabsRecent" 
       data-metacodes="{ recent.map(&:id).join(',') }">
    { @list = '' }
    { recent.each_with_index do |m, index| }
      { @list += '<li><img src="' + asset_path(m.icon) + '" alt="' + m.name + '" /><p>' + m.name.downcase + '</p><div className="clearfloat"></div></li>' } 
    { end }
    <div className="metacodeSwitchTab">
      <p className="setDesc">The 5 Metacodes you've used most recently.</p>
      <div className="metacodeSetList">
        <ul>
          { @list.html_safe }
        </ul>
        <div className="clearfloat"></div>
      </div>
    </div>
    <button className="button" onclick="Metamaps.Create.updateMetacodeSet('Recent', 0, false);">
        Switch Set
    </button>
  </div>
  { most_used = user_most_used_metacodes() }
  <div id="metacodeSwitchTabsMost" 
       data-metacodes="{ most_used.map(&:id).join(',') }">
    { @list = '' }
    { most_used.each_with_index do |m, index| }
      { @list += '<li><img src="' + asset_path(m.icon) + '" alt="' + m.name + '" /><p>' + m.name.downcase + '</p><div className="clearfloat"></div></li>' } 
    { end }
    <div className="metacodeSwitchTab">
      <p className="setDesc">The 5 Metacodes you've used the most.</p>
      <div className="metacodeSetList">
        <ul>
          { @list.html_safe }
        </ul>
        <div className="clearfloat"></div>
      </div>
    </div>
    <button className="button" onclick="Metamaps.Create.updateMetacodeSet('Most', 1, false);">
        Switch Set
    </button>
  </div>
  { allMetacodeSets.each_with_index do |m, localindex| }
  <div id="metacodeSwitchTabs{ m.id }" 
       data-metacodes="{ m.metacodes.map(&:id).join(',') }">
    { @list = '' }
    { m.metacodes.sort{|x,y| x.name <=> y.name }.each_with_index do |m, index| }
      { @list += '<li><img src="' + asset_path(m.icon) + '" alt="' + m.name + '" /><p>' + m.name.downcase + '</p><div className="clearfloat"></div></li>' } 
    { end }
    <div className="metacodeSwitchTab">
      <p className="setDesc">{ m.desc }</p>
      <div className="metacodeSetList">
        <ul>
          { @list.html_safe }
        </ul>
        <div className="clearfloat"></div>
      </div>
    </div>
    <button className="button" onclick="Metamaps.Create.updateMetacodeSet({ m.id }, { localindex + 2 }, false);">
        Switch Set
    </button>
  </div>
  { end }
    <div id="metacodeSwitchTabsCustom">
        <div className="setDesc">Choose Your Metacodes</div>
        <div className="selectNone">NONE</div>
        <div className="selectAll">ALL</div>
        { @list = '' }
        { metacodesInUse = user_metacodes() } 
        { Metacode.order("name").all.each_with_index do |m, index| }
          { mClass = metacodesInUse.index(m) == nil ? "toggledOff" : "" }
          { @list += '<li id="' + m.id.to_s + '" data-name="' + m.name + '" className="' + mClass + '"><img src="' + asset_path(m.icon) + '" alt="' + m.name + '" /><p>' + m.name.downcase + '</p><div className="clearfloat"></div></li>' } 
        { end }

        <div className="customMetacodeList">
          <ul>
            { @list.html_safe }
          </ul>
          <div className="clearfloat"></div>
        </div>
        <button className="button" onclick="Metamaps.Create.updateMetacodeSet('custom', { allMetacodeSets.length + 2 }, true);">
            Switch to Custom Set
        </button>
    </div>
</div>

<div className="clearfloat"></div>

<script>
  Metamaps.Create.selectedMetacodeSet = "metacodeset-{ selectedSet }"
  Metamaps.Create.selectedMetacodeSetIndex = { index }
</script>
