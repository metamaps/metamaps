{ form_for @token, url: '/api/v2/tokens', method: :post do |form| }
  <h4>Request new API Token</h4>
  { form.text_field :description, placeholder: "Token description..." }
  { form.submit }
{ end }
