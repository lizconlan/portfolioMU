require 'rubygems'
require 'sinatra'
require 'haml'
require 'sass'
require 'yaml'

require './lib/github_repo_list'


get "/styles/style.css" do
  response.headers['Cache-Control'] = 'public, max-age=86400'
  sass :style
end

get "/" do
  @title = "programming.by"
  haml :index
end

get "/:username" do
  #cache for 2 hours
  response.headers['Cache-Control'] = 'public, max-age=7200'
  
  @repos = GithubRepoList.new(params[:username])
  
  if @repos.error == "unable to find user"
    @title = "programming.by"
    haml :error
  else
    @title = "programming.by #{params[:username]}"
    haml :portfolio
  end
end
