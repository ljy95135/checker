defmodule CheckerWeb.PageController do
  use CheckerWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end

  def game(conn, params) do
    # only game in SupervisorTree have a game room.
    game_name = params["game"]
    game_id = CheckerWeb.CheckerGame.ref(game_name)
    try_data = GenServer.whereis(game_id)

    if try_data do
      render(conn, "game.html", game: params["game"])
    else
      conn
      |> send_resp(404, "Sorry, this room not exists.")
      |> halt
    end
  end

  def rooms(conn, params) do
    render(conn, "rooms.html")
  end
end
