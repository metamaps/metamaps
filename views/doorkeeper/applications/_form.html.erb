{ form_for application, url: doorkeeper_submit_path(application), html: {className: 'form-horizontal', role: 'form'} do |f| }
  { if application.errors.any? }
    <div className="alert alert-danger" data-alert><p>{ t('doorkeeper.applications.form.error') }</p></div>
  { end }

  { content_tag :div, className: "form-group#{' has-error' if application.errors[:name].present?}" do }
    { f.label :name, className: 'col-sm-2 control-label' }
    <div className="col-sm-10">
      { f.text_field :name, className: 'form-control' }
      { doorkeeper_errors_for application, :name }
    </div>
  { end }

  { content_tag :div, className: "form-group#{' has-error' if application.errors[:redirect_uri].present?}" do }
    { f.label :redirect_uri, className: 'col-sm-2 control-label' }
    <div className="col-sm-10">
      { f.text_area :redirect_uri, className: 'form-control' }
      { doorkeeper_errors_for application, :redirect_uri }
      <span className="help-block">
        { t('doorkeeper.applications.help.redirect_uri') }.
      </span>
      { if Doorkeeper.configuration.native_redirect_uri }
          <span className="help-block">
            { raw t('doorkeeper.applications.help.native_redirect_uri', native_redirect_uri: "<code>#{ Doorkeeper.configuration.native_redirect_uri }</code>") }
          </span>
      { end }
    </div>
  { end }

  <div className="form-group">
    <div className="col-sm-offset-2 col-sm-10">
      { f.submit t('doorkeeper.applications.buttons.submit'), className: "btn btn-primary" }
      { link_to t('doorkeeper.applications.buttons.cancel'), oauth_applications_path, :className => "button link-button red-button" }
    </div>
  </div>
{ end }
