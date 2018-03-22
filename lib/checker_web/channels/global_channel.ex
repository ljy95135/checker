defmodule CheckerWeb.GlobalChannel do
  require Logger
  use CheckerWeb, :channel

  # Attribution: http://codeloveandboards.com/blog/2016/05/21/building-phoenix-battleship-pt-3/
  # We learn how this attribution arrange the code structure.

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

  def handle_in("new_game", params, socket) do
    game_id = params["game_name"]

    case Checker.Room.Supervisor.create_game(game_id) do
      {:ok, pid} ->
        red_user_id = socket.assigns.user_id
        Logger.debug("red user id:", red_user_id)
        GenServer.call(pid, {:join, red_user_id, pid})
        {:reply, {:ok, %{game_id: game_id}}, socket}

      {:error, info} ->
        {:reply, {:error, %{info: "this game #{game_id} already exists"}}, socket}
    end
  end

  def broadcast_current_games do
    CheckerWeb.Endpoint.broadcast("global", "update_games", %{
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
