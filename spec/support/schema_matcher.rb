# frozen_string_literal: true

RSpec::Matchers.define :match_json_schema do |schema_name|
  match do |response|
    schema_path = Rails.root.join('doc', 'api', 'schemas', "#{schema_name}.json").to_s

    # schema customizations
    schema = JSON.parse(File.read(schema_path))
    schema = update_file_refs(schema)

    data = JSON.parse(response.body)
    JSON::Validator.validate!(schema, data, validate_schema: true)
  end
end

def get_json_example(resource)
  filepath = Rails.root.join('doc', 'api', 'examples', "#{resource}.json")
  OpenStruct.new(body: File.read(filepath))
end

# add full paths to file references
def update_file_refs(schema)
  schema.each_pair do |key, value|
    schema[key] = if value.is_a? Hash
                    update_file_refs(value)
                  elsif key == '$ref'
                    Rails.root.join('doc', 'api', 'schemas', value).to_s
                  else
                    value
                  end
  end
  schema
end
