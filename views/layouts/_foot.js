<div id="loading"></div>
<script type="text/javascript">
  Metamaps.ServerData.unreadNotificationsCount = { current_user ? user_unread_notification_count : 0 }
  Metamaps.ServerData.mapIsStarred = { current_user && @map && current_user.starred_map?(@map) ? true : false }
  Metamaps.ServerData.mobileTitle = "{ yield(:mobile_title) }"
  Metamaps.ServerData.ActiveMapper = { current_user ? current_user.to_json({follows: true, email: true, follow_settings: true}).html_safe : nil }
  { if devise_error_messages? }
    Metamaps.ServerData.toast = "{ devise_error_messages! }"
  { elsif notice }
    Metamaps.ServerData.toast = "{ notice }"
  { elsif alert }
    Metamaps.ServerData.toast = "{ alert }"
  { end }
  Metamaps.Loading.setup()
</script>
{ render :partial => 'layouts/lightboxes' }
{ render :partial => 'layouts/templates' }
{ render :partial => 'shared/metacodeCssColors' }
{ render :partial => 'layouts/googleanalytics' if ENV["GA_TRACKING_CODE"].present? }
</body>
</html>
