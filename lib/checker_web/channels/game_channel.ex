defmodule Battleship.GameChannel do
  @moduledoc """
  Game channel
  """
  use Phoenix.Channel
  alias Checker.CheckerGame

  def join("game:" <> game_id, _message, socket) do
    # Logger.debug "Joining Game channel #{game_id}", game_id: game_id

    user_id = socket.assigns.user_id

    case Checker.CheckerGame.join(game_id, user_id, socket.channel_pid) do
      {:ok, pid} ->
        Process.monitor(pid)

        {:ok, assign(socket, :game_id, game_id)}

      {:error, reason} ->
        {:error, %{reason: reason}}
    end
  end
end
