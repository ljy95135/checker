defmodule Checker.Room.Supervisor do
  use Supervisor

  # Attribution: http://codeloveandboards.com/blog/2016/05/21/building-phoenix-battleship-pt-3/
  # We learn how this attribution arrange the code structure.

  def start_link, do: Supervisor.start_link(__MODULE__, :ok, name: __MODULE__)

  def init(:ok) do
    children = [
      worker(CheckerWeb.CheckerGame, [], restart: :temporary)
    ]

    # supervise(children, strategy: :simple_one_for_one)
    Supervisor.init(children, strategy: :simple_one_for_one)
  end

  def create_game(id), do: Supervisor.start_child(__MODULE__, [id])

  def current_games do
    __MODULE__
    |> Supervisor.which_children()
    |> Enum.map(&game_data/1)
  end

  defp game_data({_id, pid, _type, _modules}) do
    pid
    |> GenServer.call(:get_data)
    |> Map.take([:id, :red, :black, :viewers, :turns, :over, :winner])
  end
end
