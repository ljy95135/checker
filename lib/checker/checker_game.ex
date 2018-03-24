defmodule CheckerWeb.CheckerGame do
  use GenServer
  # Attribution: http://codeloveandboards.com/blog/2016/05/21/building-phoenix-battleship-pt-3/
  # We learn how this attribution arrange the code structure.

  # idiot formatter!!
  defstruct id: nil,
            red: nil,
            black: nil,
            viewers: [],
            turn: "r",
            borard_state: [
              "b",
              "b",
              "b",
              "b",
              "b",
              "b",
              "b",
              "b",
              "b",
              "b",
              "b",
              "b",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "r",
              "r",
              "r",
              "r",
              "r",
              "r",
              "r",
              "r",
              "r",
              "r",
              "r",
              "r"
            ]

  # pid is the channel pid which should be monitored.
  def join(id, player_id, pid), do: try_call(id, {:join, player_id, pid})

  def resign_game(game_id, user_id) do
    server = ref(game_id)
    Elixir.GenServer.stop(server)
    # send broadcast to all connect to game:id
    send_broadcast_game_result(game_id, user_id)
  end

  # userid will be int
  # assume step like [0, 2]
  # return the game_state: whole dict
  def check_validation(user_id, game_id, step) do
    # check all rules.
    user_id = Integer.to_string(user_id)
    game = get_data(game_id)
    from = step["from"]
    to = step["to"]

    x = Enum.at(game.board_state, from)

    x_content =
      cond do
        x == "" ->
          {:error, "There is no piece on this position."}

        String.at(x, 0) != game.turn ->
          {:error, "This is not your piece."}

        user_id != game.red and user_id != game.black ->
          {:error, "Not valid user for this game."}

        user_id == game.red and game.turn == "b" ->
          {:error, "Not your turn."}

        user_id == game.black and game.turn == "r" ->
          {:error, "Not your turn."}

        true ->
          # It's user's turn check the step
          # The from pos is must user's piece.
          # Try to check the value: position, eat piece, become queen
          moves = move_positions(from, game.board_state)

          # in move position has enemies!
          jumps = jump_positions(from, game.board_state)

          cond do
            check_occupied(to, game.board_state) ->
              {:error, "Invalid step. Occupied."}

            # below have prerequisite: the to_pos is empty
            # it's a move
            to in moves ->
              game = become_queen(to, game)
              # handle update
              try_call(game.id, {:update, game})
              {:ok, game}

            # it's a jump
            # end_game_check only after jump
            # need to use map for jumps, and may changed the turn
            # TODO: use something like find in jump
            to in jumps ->
              # changed the turn

              # delete eat positions
              game = delete_pieces(to, jumps, game)
              # make moves and perhaps become queen
              game = become_queen(to, game)
              # handle update
              try_call(game.id, {:update, game})

              # if find game is end, open a new process to broadcast(wait a second)
              # when channel recive state, check whether a winner at first
              # then may send a win message to server, server will check
              spawn(__MODULE__, :check_win, [game])
              {:ok, game}

            # cant move or jump to, invalid
            true ->
              {:error, "Invalid step. Can't reach"}
          end
      end
  end

  # jump [(to, {eat_pos1, eat_pos_2}),...]
  def delete_pieces(to, jump, game) do
    # find where the eat is and change the game dict.
  end

  # if it has winner, send broadcast, end GenServer
  def check_win(game) do
    # must wait a short time to make sure client has updated their view.
  end

  # (consider about non-empty)
  def check_occupied(to, board) do
    Enum.at(board, to) != ""
  end

  # game is a dict
  # make the real position change by pos(to) here
  def become_queen(pos, game) do
    # if pos can be a queen, then return a new game
  end

  # pos: int 0-31, board: list of 32 board unit
  # prerequisite: this must be right user's right piece
  # not care about the destination of whether has piece
  def move_positions(pos, board) do
    # return list of all valid move position
    x = Enum.at(board, pos)
    color = String.at(x, 0)
    len = String.length(x)

    cond do
      color == 'r' ->
        # red moves
        red_moves(pos, len == 2)

      color == 'b' ->
        # black moves
        black_moves(pos, len == 2)
    end
  end

  # not wrong when it return charlist
  # can use inspect to see
  def black_moves(pos, is_queen) do
    row = div(pos, 4)

    black_moves_alternatives =
      cond do
        is_queen ->
          cond do
            # 0, 2, 4, 6
            rem(row, 2) == 0 ->
              [pos - 4, pos - 3, pos + 4, pos + 5]

            # 1, 3, 5, 7
            true ->
              [pos - 5, pos - 4, pos + 3, pos + 4]
          end

        # normal
        true ->
          cond do
            # 0, 2, 4, 6
            rem(row, 2) == 0 ->
              [pos + 4, pos + 5]

            true ->
              [pos + 3, pos + 4]
          end
      end

    # red_moves_alternatives needs a filter
    Enum.filter(black_moves_alternatives, &pos_filter(&1, 1, pos))
  end

  def red_moves(pos, is_queen) do
    row = div(pos, 4)

    red_moves_alternatives =
      cond do
        is_queen ->
          cond do
            # 0, 2, 4, 6
            rem(row, 2) == 0 ->
              [pos - 4, pos - 3, pos + 4, pos + 5]

            # 1, 3, 5, 7
            true ->
              [pos - 5, pos - 4, pos + 3, pos + 4]
          end

        # normal
        true ->
          cond do
            # 0, 2, 4, 6
            rem(row, 2) == 0 ->
              [pos - 4, pos - 3]

            # 1, 3, 5, 7
            true ->
              [pos - 5, pos - 4]
          end
      end

    # red_moves_alternatives needs a filter
    Enum.filter(red_moves_alternatives, &pos_filter(&1, 1, pos))
  end

  def pos_filter(pos, dif, ori_pos) do
    ori_row = div(ori_pos, 4)
    new_row = div(pos, 4)
    abs(ori_row - new_row) == dif and pos >= 0 and pos <= 31
  end

  # pos: int 0-31, board: list of 32 board unit
  # not use recursion to avoid a bad bug(same destination, two routes)
  # when jump and still can jump, set a flag by turn "c"<>pos
  # will be checked at client
  # [{is_continue: boolean, to: to, eat: eat_pos},...]
  def jump_positions(pos, board) do
    # return list of all (valid jump, eat position)
    # notice: can still jump after a jump!
    alternative_moves = move_positions(pos, board)
    result = Enum.map(alternative_moves, &check_eat(pos, &1, board, false))
    Enum.filter(result, fn x -> x != nil end)
  end

  # prerequsite: must can move to eat_pos, x_pos must have a piece
  # need to check destination valid
  # {is_continue: boolean, to: to_pos, eat: eat_pos} | nil | true
  def check_eat(x_pos, eat_pos, board, is_just_check) do
    # can eat?
    eat = Enum.at(board, eat_pos)
    x = Enum.at(board, x_pos)

    cond do
      # cant eat empty
      eat == "" ->
        nil

      # cant use
      # eat_color = String.at(eat, 0)
      # x_color = String.at(x, 0)

      # cant eat your piece
      String.at(eat, 0) == String.at(x, 0) ->
        nil

      # prerequisite: can eat
      # can get the destination?
      # nil for no to_pos || not empty
      true ->
        to_pos = get_to_pos(x_pos, eat_pos, board)

        cond do
          # cant reach destination
          to_pos == nil ->
            nil

          # after jump can jump again?
          true ->
            if is_just_check do
              # not check next turn | as a boolean function
              true
            else
              # as a get function
              cond do
                # not go back
                check_again(to_pos, board, eat_pos) ->
                  %{is_continue: true, to_pos: to_pos, eat_pos: eat_pos}

                # cant jump second time
                true ->
                  %{is_continue: false, to_pos: to_pos, eat_pos: eat_pos}
              end
            end
        end
    end
  end

  def get_to_pos_temp(x_pos, eat_pos) do
    row = div(x_pos, 4)

    cond do
      rem(row, 2) == 0 ->
        # 0, 2, 4, 6
        cond do
          eat_pos - x_pos == 4 ->
            x_pos + 7

          eat_pos - x_pos == 5 ->
            x_pos + 9

          eat_pos - x_pos == -4 ->
            x_pos - 9

          eat_pos - x_pos == -3 ->
            x_pos - 7
        end

      true ->
        # 1 3 5 7
        cond do
          eat_pos - x_pos == 3 ->
            x_pos + 7

          eat_pos - x_pos == 4 ->
            x_pos + 9

          eat_pos - x_pos == -5 ->
            x_pos - 9

          eat_pos - x_pos == -4 ->
            x_pos - 7
        end
    end
  end

  # nil|to_pos
  def get_to_pos(x_pos, eat_pos, board) do
    row = div(x_pos, 4)
    result_temp = get_to_pos_temp(x_pos, eat_pos)

    # check for result_temp should have two lines diff
    result_row = div(result_temp, 4)

    # scope[0,31] line_diff and empty
    if result_temp >= 0 and result_temp <= 31 and abs(result_row - row) == 2 and
         Enum.at(board, result_temp) == "" do
      result_temp
    else
      nil
    end
  end

  # def check_eat_boolean(x_pos, eat_pos, board) do
  #   eat = Enum.at(board, eat_pos)
  #   x = Enum.at(board, x_pos)
  # end

  # boolean
  def check_again(to_pos, board, eaten_pos) do
    alternative_moves = move_positions(to_pos, board)
    alternative_moves = Enum.filter(alternative_moves, fn x -> x! = eaten_pos end)
    # [nil, true,...]
    results = Enum.map(alternative_moves, &check_eat(to_pos, &1, board, true))
    # default fn: fn(x) -> x
    Enum.any?(results)
  end

  def get_data(game_id), do: try_call(game_id, :get_data)

  def start_link(id) do
    GenServer.start_link(__MODULE__, id, name: ref(id))
  end

  def ref(id), do: {:global, {:game, id}}

  def init(id) do
    {:ok, %__MODULE__{id: id}}
  end

  # not need to use ref before this function
  def try_call(id, message) do
    case GenServer.whereis(ref(id)) do
      nil ->
        {:error, "Game does not exist"}

      game ->
        GenServer.call(game, message)
    end
  end

  def send_broadcast_game_with_winner(game_id, winner_id) do
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

  # change turn, update board
  def handle_call({:update, new_game}, _from, game) do
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

        game = add_player(game, user_id)

        {:reply, {:ok, self}, game}
    end
  end

  def handle_call(:get_data, _from, game), do: {:reply, game, game}
end
