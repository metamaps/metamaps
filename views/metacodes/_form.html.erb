{ form_for(@metacode) do |f| }
  { if @metacode.errors.any? }
    <div id="error_explanation">
      <h2>{ pluralize(@metacode.errors.count, "error") } prohibited this metacode from being saved:</h2>
      <ul>
      { @metacode.errors.full_messages.each do |msg| }
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
  { unless @metacode.new_record? }
    <div className="field">
      { f.label 'Current Icon' }
      { image_tag @metacode.icon, width: 96 }
    </div>
  { end }
  <div className="field">
    { if @metacode.new_record? }
      { f.label 'Icon' }
    { else }
      { f.label 'Replace Icon: ' }
    { end }
    { f.hidden_field :manual_icon, value: nil }
    { f.file_field :aws_icon }
    <div className="clearfloat"></div>
  </div>
  <div className="field">
    { f.label :color, "Color (hex with # sign)" }
    { f.text_field :color }
    <div className="clearfloat"></div>
  </div>
  <div className="actions">
    { link_to 'Cancel', metacodes_path, { :className => 'button' } }
    { f.submit :className => 'add' }
  </div>
{ end }
