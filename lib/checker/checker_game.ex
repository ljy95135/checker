defmodule CheckerWeb.CheckerGame do
  use GenServer
  # Attribution: http://codeloveandboards.com/blog/2016/05/21/building-phoenix-battleship-pt-3/
  # We learn how this attribution arrange the code structure.
  # BUT!! All game's rules I (Jiangyi Lin) just figure it by out myself.

  # TODO: jump become queen maybe can jump again, but not big deal.
  #   may have rare bugs for multi jumps so should add some tests.

  # idiot formatter!!
  defstruct id: nil,
            red: nil,
            black: nil,
            viewers: [],
            turn: "r",
            board_state: [
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
  # assume step like {from: int to: int}
  # return the game_state: whole dict
  def check_validation(user_id, game_id, step) do
    # check all rules.
    # user_id = Integer.to_string(user_id)
    game = get_data(game_id)
    from = step["from"]
    to = step["to"]

    x = Enum.at(game.board_state, from)

    cond do
      x == "" ->
        {:error, "There is no piece on this position."}

      String.at(game.turn, 0) == "c" ->
        cond do
          user_id != game.red and user_id != game.black ->
            {:error, "Not valid user for this game."}

          user_id == game.red and String.at(game.turn, 1) != "r" ->
            {:error, "Not your turn."}

          user_id == game.black and String.at(game.turn, 1) != "b" ->
            {:error, "Not your turn."}

          # prerequisite: user is valid for the turn
          true ->
            # pos is string
            # enough for most "31"
            pos = String.slice(game.turn, 2, 10)

            if Integer.to_string(from) != pos do
              {:error, "You can only choose your piece to jump multi or not."}
            else
              # jump multi check.
              cond do
                from == to ->
                  game = change_turn(game, true)
                  try_call(game.id, {:update, game})
                  {:ok, game}

                # another jump
                true ->
                  jumps = jump_positions(from, game.board_state)

                  cond do
                    check_occupied(to, game.board_state) ->
                      {:error, "Invalid step. Occupied."}

                    jump = Enum.find(jumps, &find_in_jumps(to, &1)) ->
                      game = change_turn(game, false, jump)
                      game = delete_piece(jump, game)
                      game = become_queen(from, to, game)
                      try_call(game.id, {:update, game})
                      spawn(__MODULE__, :check_win, [game])
                      {:ok, game}

                    true ->
                      {:error, "Invalid step. Can't reach"}
                  end
              end
            end
        end

      # prerequisite: no "cr*" "cb*"
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
            # change turn: just reverse
            game = change_turn(game, true)
            # make the real move, perhaps change to queen
            game = become_queen(from, to, game)
            # handle update
            try_call(game.id, {:update, game})
            {:ok, game}

          # it's a jump
          # end_game_check only after jump
          # need to use map for jumps, and may changed the turn
          jump = Enum.find(jumps, &find_in_jumps(to, &1)) ->
            # need to use the jump %{eat_pos: 5, is_continue: true, to_pos: 9}
            # changed the turn (c<color>pos || r || b)
            game = change_turn(game, false, jump)
            # delete eat position
            game = delete_piece(jump, game)
            # make the real move, perhaps change to queen
            game = become_queen(from, to, game)
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

  def check_validation_for_continure_turn() do
  end

  # game dict
  # jump_info like %{eat_pos: 5, is_continue: true, to_pos: 9}
  # return new game
  def change_turn(game, is_reverse, jump_info \\ nil) do
    if is_reverse do
      change_turn_reverse(game)
    else
      # based on jump_info changed to reverse or cb|r*
      if jump_info.is_continue do
        # change turn to "c" + "r|b"+ to_pos
        # game_turn can be cr|b* or r|b
        if String.length(game.turn) == 1 do
          new_turn = "c" <> game.turn <> Integer.to_string(jump_info.to_pos)
          %{game | turn: new_turn}
        else
          # from cr|b* to new cr|b*
          new_turn = "c" <> String.at(game.turn, 1) <> Integer.to_string(jump_info.to_pos)
          %{game | turn: new_turn}
        end
      else
        # just like reverse
        change_turn_reverse(game)
      end
    end
  end

  # game.turn "r" "b" "cr*" "cb*"
  def change_turn_reverse(game) do
    cond do
      String.length(game.turn) == 1 ->
        # just reverse
        if game.turn == "r" do
          %{game | turn: "b"}
        else
          %{game | turn: "r"}
        end

      true ->
        # use second character to inverse
        turn = String.at(game.turn, 1)

        if turn == "r" do
          %{game | turn: "b"}
        else
          %{game | turn: "r"}
        end
    end
  end

  # %{eat_pos: 5, is_continue: true, to_pos: 9}
  def find_in_jumps(to_pos, jump_info) do
    to_pos == jump_info.to_pos
  end

  # jump like %{eat_pos: 5, is_continue: true, to_pos: 9}
  def delete_piece(jump, game) do
    # just change eat position to empty
    new_board_state = change_list(game.board_state, jump.eat_pos, "")
    %{game | board_state: new_board_state}
  end

  # prerequisite: not give wrong arguments
  def change_list(list, pos, new_val) do
    # len will be enough for get the rest
    len = length(list)
    Enum.slice(list, 0, pos) ++ [new_val] ++ Enum.slice(list, pos + 1, len)
  end

  # if it has winner, send broadcast, end GenServer
  # do not care its return value
  def check_win(game) do
    # must wait a short time to make sure client has updated their view.
    :timer.sleep(1000)

    # anyone is winner?
    # prerequisite: cant be both 0
    black_count = Enum.count(game.board_state, &count_piece(&1, "b"))
    red_count = Enum.count(game.board_state, &count_piece(&1, "r"))

    cond do
      black_count == 0 ->
        game_over_for_win(game.id, game.red)

      red_count == 0 ->
        game_over_for_win(game.id, game.black)

      # game continues
      true ->
        nil
    end
  end

  # user id is always String in Server side
  def game_over_for_win(id, winner) do
    server = ref(id)
    Elixir.GenServer.stop(server)
    send_broadcast_game_with_winner(id, winner)
  end

  # color: "r"|"b"
  def count_piece(item, color) do
    item in [color, color <> "q"]
  end

  # (consider about non-empty)
  def check_occupied(to, board) do
    Enum.at(board, to) != ""
  end

  # game is a dict
  # prerequisite:
  #   from_pos is right (must have the piece),
  #   to_pos is empty and jump or move is valid.
  # make the real position change by pos(to) here
  # from->"", to->"r|b|rq|bq"
  def become_queen(from_pos, to_pos, game) do
    board = game.board_state
    x = Enum.at(game.board_state, from_pos)
    # change from_pos's to ""
    board = change_list(board, from_pos, "")

    # add piece at to_pos
    board =
      cond do
        # queen length is 2
        String.length(x) == 2 ->
          # only need to move at to_pos
          change_list(board, to_pos, x)

        true ->
          # maybe change to queen
          cond do
            x == "r" and to_pos < 4 ->
              change_list(board, to_pos, "rq")

            x == "b" and to_pos > 27 ->
              change_list(board, to_pos, "bq")

            true ->
              change_list(board, to_pos, x)
          end
      end

    %{game | board_state: board}
  end

  # pos: int 0-31, board: list of 32 board unit
  # prerequisite: this must be right user's right piece
  # not care about the destination of whether has piece
  # sometimes need to check moves and need to use info: "bq" "rq" "r" "b"
  def move_positions(pos, board, info \\ nil) do
    # return list of all valid move position
    x = Enum.at(board, pos)
    color = String.at(x, 0)
    len = String.length(x)

    cond do
      color == "r" ->
        # red moves
        red_moves(pos, len == 2)

      color == "b" ->
        # black moves
        black_moves(pos, len == 2)

      true ->
        # use to try can jump next time?
        cond do
          info == "bq" ->
            black_moves(pos, true)

          info == "rq" ->
            red_moves(pos, true)

          info == "r" ->
            red_moves(pos, false)

          info == "b" ->
            black_moves(pos, false)
        end
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
    # IO.puts(eat_pos)
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
                check_again(to_pos, board, eat_pos, x) ->
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

  # boolean
  def check_again(to_pos, board, eaten_pos, info) do
    alternative_moves = move_positions(to_pos, board, info)
    alternative_moves = alternative_moves -- [eaten_pos]
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
    CheckerWeb.Endpoint.broadcast("game:" <> game_id, "someone_win", %{"winner" => winner_id})
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

  # update board
  def handle_call({:update, new_game}, _from, _game) do
    {:reply, nil, new_game}
  end

  # pid is channel's pid
  def handle_call({:join, user_id, pid}, _from, game) do
    cond do
      Enum.member?([game.red, game.black], user_id) ->
        {:reply, {:ok, self()}, game}

      Enum.member?(game.viewers, user_id) ->
        {:reply, {:ok, self()}, game}

      true ->
        Process.flag(:trap_exit, true)
        Process.monitor(pid)

        game = add_player(game, user_id)

        {:reply, {:ok, self()}, game}
    end
  end

  def handle_call(:get_data, _from, game), do: {:reply, game, game}
end
