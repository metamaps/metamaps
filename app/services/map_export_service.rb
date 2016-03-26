# frozen_string_literal: true
class MapExportService
  attr_reader :user, :map
  def initialize(user, map)
    @user = user
    @map = map
  end

  def json
    # marshal_dump turns OpenStruct into a Hash
    {
      topics: exportable_topics.map(&:marshal_dump),
      synapses: exportable_synapses.map(&:marshal_dump)
    }
  end

  def csv(options = {})
    CSV.generate(options) do |csv|
      to_spreadsheet.each do |line|
        csv << line
      end
    end
  end

  private

  def topic_headings
    [:id, :name, :metacode, :x, :y, :description, :link, :user, :permission]
  end

  def synapse_headings
    [:topic1, :topic2, :category, :description, :user, :permission]
  end

  def exportable_topics
    visible_topics ||= Pundit.policy_scope!(user, map.topics)
    topic_mappings = Mapping.includes(mappable: [:metacode, :user])
                            .where(mappable: visible_topics, map: map)
    topic_mappings.map do |mapping|
      topic = mapping.mappable
      next nil if topic.nil?
      OpenStruct.new(
        id: topic.id,
        name: topic.name,
        metacode: topic.metacode.name,
        x: mapping.xloc,
        y: mapping.yloc,
        description: topic.desc,
        link: topic.link,
        user: topic.user.name,
        permission: topic.permission
      )
    end.compact
  end

  def exportable_synapses
    visible_synapses = Pundit.policy_scope!(user, map.synapses)
    visible_synapses.map do |synapse|
      next nil if synapse.nil?
      OpenStruct.new(
        topic1: synapse.topic1_id,
        topic2: synapse.topic2_id,
        category: synapse.category,
        description: synapse.desc,
        user: synapse.user.name,
        permission: synapse.permission
      )
    end.compact
  end

  # iterable: @map.to_spreadsheet.each { |row| ... }
  def to_spreadsheet
    yield ["Topics"]
    yield topic_headings.map(&:capitalize)
    exportable_topics.each do |topics|
      # convert exportable_topics into an array of arrays
      yield topic_headings.map { |h| topics.send(h) }
    end

    yield []
    yield ["Synapses"]
    yield synapse_headings.map(&:capitalize)
    exportable_synapses.each do |synapse|
      # convert exportable_synapses into an array of arrays
      yield synapse_headings.map { |h| synapse.send(h) }
    end
  end

  def render_csv
    set_file_headers(:csv)
    set_streaming_headers

    @controller.response.status = 200
    @controller.response_body = csv_lines
  end

  def render_xls
    set_file_headers(:xls)
    set_streaming_headers

    @controller.response.status = 200
    @controller.response_body = xls_lines
  end

  def set_file_headers(type)
    file_name = "metamaps.cc.map.#{@map.id}.#{type}"
    content_type = type == :xls ? 'application/vnd.ms-excel' : 'text/csv'

    @controller.headers['Content-Type'] = content_type
    @controller.headers['Content-disposition'] = %Q'attachment; filename="#{filename}"'
  end

  def set_streaming_headers
    @controller.headers['X-Accel-Buffering'] = 'no'
    @controller.headers['Cache-Control'] ||= 'no-cache'
    @controller.headers.delete('Content-Length')
  end

  def csv_lines
    Enumerator.new do |out|
      @map.to_spreadsheet.each do |row|
        out << CSV::Row.new(row)
      end
    end
  end

  def xls_lines
    Enumerator.new do |out|
      out << '<table><tbody>'
      @map.to_spreadsheet.each do |row|
        out << '<tr>'
        row.each do |field|
          out << "<td>#{field}</td>"
        end
        out << '</tr>'
      end
      out << '</tbody></table>'
    end
  end
end
