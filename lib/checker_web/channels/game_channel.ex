defmodule CheckerWeb.GameChannel do
  @moduledoc """
  Game channel
  """
  use Phoenix.Channel
  alias Checker.CheckerGame

  # Attribution: http://codeloveandboards.com/blog/2016/05/21/building-phoenix-battleship-pt-3/
  # We learn how this attribution arrange the code structure.
  # BUT!!: I (Jiangyi Lin) figure out how all handle_in and join to work with
  #   my channels myself instead of copying his code.

  def join("game:" <> game_id, _message, socket) do
    # Logger.debug "Joining Game channel #{game_id}", game_id: game_id

    user_id = socket.assigns.user_id

    case CheckerWeb.CheckerGame.join(game_id, user_id, socket.channel_pid) do
      # this is pid sent back of Genserver.
      {:ok, pid} ->
        Process.monitor(pid)
        {:ok, assign(socket, :game_id, game_id)}

      {:error, reason} ->
        {:error, %{reason: reason}}
    end
  end

  def handle_in("game:get_data", _message, socket) do
    # user_id = socket.assigns.user_id
    game_id = socket.assigns.game_id
    {:reply, {:ok, %{game_state: CheckerWeb.CheckerGame.get_data(game_id)}}, socket}
  end

  def handle_in("game:update_border", message, socket) do
    user_id = socket.assigns.user_id
    game_id = socket.assigns.game_id
    step = message["next_step"]

    case CheckerWeb.CheckerGame.check_validation(user_id, game_id, step) do
      {:ok, new_state} ->
        CheckerWeb.Endpoint.broadcast("game:" <> game_id, "someone_moves", %{"state" => new_state})

        {:reply, {:ok, %{state: new_state}}, socket}

      {:error, info} ->
        {:reply, {:error, %{info: "invalid step: " <> info}}, socket}
    end
  end
end
