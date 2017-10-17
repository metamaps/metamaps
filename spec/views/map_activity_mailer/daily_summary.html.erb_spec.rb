# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'map_activity_mailer/daily_summary.html.erb' do
  it 'displays messages sent' do
    assign(:user, create(:user))
    assign(:map, create(:map))
    assign(:summary_data, stats: {
             messages_sent: 5
           })

    render

    expect(rendered).to match(/5 messages/)
  end
end
