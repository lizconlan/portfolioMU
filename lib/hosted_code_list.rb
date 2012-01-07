require 'rest-client'
require 'json'

class HostedCodeList
  private
    def call_api(url)
      result = get_url(url)
      if result
        return JSON.parse(result)
      else
        return []
      end
    end
  
    def get_url(url, tries=0)
      begin
        result = nil
        if tries < 5
          result = RestClient.get(url)
        end
      rescue
        tries -= 1
        get_url(url, tries)
      end
      result
    end
    
    def capitalize_language(text)
      if text == "php"
        return "PHP"
      else
        return text.capitalize
      end
    end
end