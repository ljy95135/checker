defmodule CheckerWeb.GlobalChannel do
  require Logger
  use CheckerWeb, :channel

  # Attribution: http://codeloveandboards.com/blog/2016/05/21/building-phoenix-battleship-pt-3/
  # We learn how this attribution arrange the code structure.
  # BUT!!: I (Jiangyi Lin) figure out how all handle_in and join to work with
  #   my channels myself instead of copying his code.

  def join("global", payload, socket) do
    # Logger.debug(payload)

    if authorized?(payload) do
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_in("current_games", _params, socket) do
    {:reply, {:ok, %{games: Checker.Room.Supervisor.current_games()}}, socket}
  end

  def handle_in("resign", params, socket) do
    # do some thing to end genserver
    user_id = params["user_id"]
    game_id = params["game_id"]
    CheckerWeb.CheckerGame.resign_game(game_id, user_id)
    {:reply, {:ok, %{}}, socket}
  end

  def handle_in("broadcast_current_games", _params, socket) do
    broadcast_current_games
    {:noreply, socket}
  end

  def handle_in("new_game", params, socket) do
    game_id = params["game_name"]

    case Checker.Room.Supervisor.create_game(game_id) do
      {:ok, pid} ->
        # red_user_id = socket.assigns.user_id
        # Logger.debug("red user id:", red_user_id)
        # GenServer.call(pid, {:join, red_user_id, pid})

        {:reply, {:ok, %{game_id: game_id}}, socket}

      {:error, info} ->
        {:reply, {:error, %{info: "this game #{game_id} already exists"}}, socket}
    end
  end

  # maybe not need here
  def send_braodcast_update_current_rooms(game) do
    # game -> new list: games
    games = Checker.Room.Supervisor.current_games()
    games = [game | games]
    CheckerWeb.Endpoint.broadcast("global", "update_current_rooms", %{"games" => games})
  end

  def broadcast_current_games do
    CheckerWeb.Endpoint.broadcast("global", "update_current_rooms", %{
      games: Checker.Room.Supervisor.current_games()
    })
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  # def handle_in("ping", payload, socket) do
  #   {:reply, {:ok, payload}, socket}
  # end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (global:lobby).
  # def handle_in("shout", payload, socket) do
  #   broadcast(socket, "shout", payload)
  #   {:noreply, socket}
  # end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
