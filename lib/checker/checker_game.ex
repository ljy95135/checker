defmodule CheckerWeb.CheckerGame do
  use GenServer
  # Attribution: http://codeloveandboards.com/blog/2016/05/21/building-phoenix-battleship-pt-3/
  # We learn how this attribution arrange the code structure.

  defstruct id: nil,
            red: nil,
            black: nil,
            viewers: [],
            turns: [],
            over: false,
            winner: nil

  # pid is the channel pid which should be monitored.
  def join(id, player_id, pid), do: try_call(id, {:join, player_id, pid})

  def resign_game(game_id, user_id) do
    server = ref(game_id)
    Elixir.GenServer.stop(server)
    # send broadcast to all connect to game:id
    send_broadcast_game_result(game_id, user_id)
  end

  def check_validation(user_id, game_id, step) do
    # check all rules.
  end

  def get_data(game_id), do: try_call(game_id, :get_data)

  def start_link(id) do
    GenServer.start_link(__MODULE__, id, name: ref(id))
  end

  def ref(id), do: {:global, {:game, id}}

  def init(id) do
    {:ok, %__MODULE__{id: id}}
  end

  def try_call(id, message) do
    case GenServer.whereis(ref(id)) do
      nil ->
        {:error, "Game does not exist"}

      game ->
        GenServer.call(game, message)
    end
  end

  def send_broadcast_game_result(game_id, loser_id) do
    CheckerWeb.Endpoint.broadcast("game:" <> game_id, "game_result", %{"loser" => loser_id})
  end

  def send_braodcast_update_user_info(game) do
    game_id = game.id
    CheckerWeb.Endpoint.broadcast("game:" <> game_id, "update_user_info", %{"game" => game})
  end

  defp add_player(%__MODULE__{red: nil} = game, user_id) do
    new_game = %{game | red: user_id}
    send_braodcast_update_user_info(new_game)
    new_game
  end

  defp add_player(%__MODULE__{black: nil} = game, user_id) do
    new_game = %{game | black: user_id}
    send_braodcast_update_user_info(new_game)
    new_game
  end

  defp add_player(game, user_id) do
    new_game = %{game | viewers: [user_id | game.viewers]}
    send_braodcast_update_user_info(new_game)
    new_game
  end

  # pid is channel's pid
  def handle_call({:join, user_id, pid}, _from, game) do
    cond do
      Enum.member?([game.red, game.black], user_id) ->
        {:reply, {:ok, self}, game}

      Enum.member?(game.viewers, user_id) ->
        {:reply, {:ok, self}, game}

      true ->
        Process.flag(:trap_exit, true)
        Process.monitor(pid)

        # {:ok, board_pid} = create_board(player_id)
        # Process.monitor(board_pid)

        game = add_player(game, user_id)

        # Battleship.Game.Event.player_joined

        {:reply, {:ok, self}, game}
    end
  end

  def handle_call(:get_data, _from, game), do: {:reply, game, game}
end
