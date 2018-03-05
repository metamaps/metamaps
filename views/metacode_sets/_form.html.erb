{ form_for(@metacode_set) do |f| }
  { if @metacode_set.errors.any? }
    <div id="error_explanation">
      <h2>{ pluralize(@metacode_set.errors.count, "error") } prohibited this metacode set from being saved:</h2>

      <ul>
      { @metacode_set.errors.full_messages.each do |msg| }
        <li>{ msg }</li>
      { end }
      </ul>
    </div>
  { end }

  <div className="field">
    { f.label :name }
    { f.text_field :name }
    <div className="clearfloat"></div>
  </div>
  <div className="field">
    { f.label :desc, "Description" }
    { f.text_area :desc, :cols => "40", :rows => "4" }
    <div className="clearfloat"></div>
  </div>

  <br />

  <p>Choose Metacodes</p>
  <div className="allMetacodes">
    <span id="showAll" onclick="Metamaps.Admin.selectAll();">Select All</span>
    <span id="hideAll" onclick="Metamaps.Admin.deselectAll();">Unselect All</span>
  </div>
    <div className="clearfloat"></div>
  <div className="editMetacodes">
      <ul id="filters-one">
       { $i = 0 }
       { @m = Metacode.order("name").all }
       { while $i < (Metacode.all.length / 4) do }
            <li id="{ @m[$i].id }" { if not @m[$i].in_metacode_set(@metacode_set) }className="toggledOff"{ end } 
              onclick="Metamaps.Admin.liClickHandler.call(this);">
              <img src="{ asset_path @m[$i].icon }" alt="{ @m[$i].name }" />
              <p>{ @m[$i].name.downcase }</p>
              <div className="clearfloat"></div>
            </li>
            { $i += 1 }
       { end }
      </ul>
      <ul id="filters-two">
       { while $i < (Metacode.all.length / 4 * 2) do }
            <li id="{ @m[$i].id }" { if not @m[$i].in_metacode_set(@metacode_set) }className="toggledOff"{ end }
              onclick="Metamaps.Admin.liClickHandler.call(this);">
              <img src="{ asset_path @m[$i].icon }" alt="{ @m[$i].name }" />
              <p>{ @m[$i].name.downcase }</p>
              <div className="clearfloat"></div>
            </li>
            { $i += 1 }
       { end }         
      </ul>
      <ul id="filters-three">         
       { while $i < (Metacode.all.length / 4 * 3) do }
            <li id="{ @m[$i].id }" { if not @m[$i].in_metacode_set(@metacode_set) }className="toggledOff"{ end }
              onclick="Metamaps.Admin.liClickHandler.call(this);">
              <img src="{ asset_path @m[$i].icon }" alt="{ @m[$i].name }" />
              <p>{ @m[$i].name.downcase }</p>
              <div className="clearfloat"></div>
            </li>
            { $i += 1 }
       { end }
      </ul>
      <ul id="filters-four">         
       { while $i < Metacode.all.length do }
            <li id="{ @m[$i].id }" { if not @m[$i].in_metacode_set(@metacode_set) }className="toggledOff"{ end }
              onclick="Metamaps.Admin.liClickHandler.call(this);">
              <img src="{ asset_path @m[$i].icon }" alt="{ @m[$i].name }" />
              <p>{ @m[$i].name.downcase }</p>
              <div className="clearfloat"></div>
            </li>
            { $i += 1 }
       { end }
      </ul>
  </div>
  { hidden_field(:metacodes, :value, {:value => 0}) }
  <div className="clearfloat"></div>
  
  <div className="actions">
    { link_to 'Cancel', metacode_sets_path, 
        { :className => 'button' } }
    { f.submit :className => 'add', :onclick => "return Metamaps.Admin.validate();" }
  </div>
{ end }
