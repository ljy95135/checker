defmodule CheckerWeb.CheckerGame do
  use GenServer
  # Attribution: http://codeloveandboards.com/blog/2016/05/21/building-phoenix-battleship-pt-3/
  # Server rules for checker
  
  defstruct [
    id: nil,
    red: nil,
    black: nil,
    viewers: [],
    turns: [],
    over: false,
    winner: nil
  ]

  def start_link(id) do
    GenServer.start_link(__MODULE__, id, name: ref(id))
  end

  defp ref(id), do: {:global, {:game, id}}

   def init(id) do
    {:ok, %__MODULE__{id: id}}
  end

 defp try_call(id, message) do
    case GenServer.whereis(ref(id)) do
      nil ->
        {:error, "Game does not exist"}
      game ->
        GenServer.call(game, message)
    end
  end
  
 defp add_player(%__MODULE__{red: nil} = game, user_id), do: %{game | red: user_id}
 defp add_player(%__MODULE__{black: nil} = game, user_id), do: %{game | black: user_id}
 defp add_player(game, user_id), do: %{game | viewers: [user_id | game.viewers]}
  
 def handle_call({:join, user_id, pid}, _from, game) do

    cond do
      Enum.member?([game.red, game.black], user_id) ->
        {:reply, {:ok, self}, game}
      Enum.member?(game.viewers, user_id) ->
        {:reply, {:ok, self}, game}
      true ->
        Process.flag(:trap_exit, true)
        Process.monitor(pid)

        #{:ok, board_pid} = create_board(player_id)
        #Process.monitor(board_pid)

        game = add_player(game, user_id)

        #Battleship.Game.Event.player_joined

        {:reply, {:ok, self}, game}
    end
  end
end
