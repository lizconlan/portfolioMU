require './lib/hosted_code_list'

class GithubRepoList < HostedCodeList
  attr_reader :all, :own, :forks, :watched, :contributor, :orgs, :error, :real_name
  
  def initialize(username)
    @username = username
    @token = ENV['gh_token'] || YAML::load(File.read("config/oauth.yml"))[:access_token]
    begin
      results = RestClient.get("https://api.github.com/users/#{@username}")
    rescue
      @error = "unable to find user"
    end
    
    unless @error
      user_info = JSON.parse(results)
      @real_name = user_info["name"]
      get_data()
    end
  end
  
  private
    def get_data
      @all = call_api("https://api.github.com/users/#{@username}/repos?type=public?access_token=#{@token}")
      
      @contributor = []
      @orgs = {}
      
      @own = @all.dup
      @own.delete_if {|x| x["fork"] == true}
      
      @forks = @all.dup
      @forks.delete_if {|x| x["fork"] == false}
      
      @contributor = call_api("https://api.github.com/users/#{@username}/repos?type=member&access_token=#{@token}")
      
      #include stuff from organisations
      organisations = call_api("https://api.github.com/users/#{@username}/orgs?access_token=#{@token}")
      
      organisations.each do |org|
        org_repos = call_api("https://api.github.com/orgs/#{org["login"]}/repos")
        @orgs[org["login"]] = org_repos
      end
    end
end