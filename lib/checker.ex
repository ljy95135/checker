defmodule Checker do
  use Application

  @moduledoc """
  Checker keeps the contexts that define your domain
  and business logic.

  Contexts are also responsible for managing your data, regardless
  if it comes from the database, an external API or others.
  """

  def start(_type, _args) do
    # ...

    children = [
      # ...
      supervisor(Checker.Game.Supervisor, [])
    ]
  end
end
