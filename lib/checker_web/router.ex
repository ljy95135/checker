defmodule CheckerWeb.Router do
  use CheckerWeb, :router

  pipeline :browser do
    plug(:accepts, ["html"])
    plug(:fetch_session)
    plug(:fetch_flash)
    plug(:protect_from_forgery)
    plug(:put_secure_browser_headers)
    plug(:get_current_user)
  end

  pipeline :api do
    plug(:accepts, ["json"])
  end

  def get_current_user(conn, _params) do
    user_id = get_session(conn, :user_id)
    user = Checker.Accounts.get_user(user_id || -1)
    assign(conn, :current_user, user)
  end

  scope "/", CheckerWeb do
    # Use the default browser stack
    pipe_through(:browser)

    get("/", PageController, :index)
    get("/game/:game", PageController, :game)
    get("/rooms", PageController, :rooms)
    
    resources("/users", UserController)
    post("/session", SessionController, :create)
    delete("/session", SessionController, :delete)
  end

  # Other scopes may use custom stacks.
  # scope "/api", CheckerWeb do
  #   pipe_through :api
  # end
end
