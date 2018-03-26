import React from 'react';
import ReactDOM from 'react-dom';
import {
  Button
} from 'reactstrap';

export default function run_checker(root, game_state, game_channel) {
  ReactDOM.render(
    <Checker game_state={game_state} game_channel={game_channel}/>,
    root);
}

class Checker extends React.Component {
  constructor(props) {
    super(props);
    this.is_multi_jump = false;
    this.game_channel = props.game_channel;
    this.game_state = props.game_state;
    // this.game_state.board_state = this.game_state.board_state;
    // ["b", "b", "b", "b", "", "", "b", "b",
    //    "bq", "b", "b", "b", "", "rq", "", "", "", "", "", "", "r",
    //    "r", "r", "r", "r", "r", "r", "r", "r", "r", "r", "r"
    //  ];
    //this.game_state.turn = 'b';
    this.initial_state = {
      clickedItem: -1,
      validMoves: [],
      killMoves: []
    };

    this.state = {
      clickedItem: -1,
      validMoves: [],
      killMoves: []
    };

    this.check_player_this_turn = this.check_player_this_turn.bind(this);
    this.canMove = this.canMove.bind(this);
    this.highlightMoves = this.highlightMoves.bind(this);
    this.moveCoin = this.moveCoin.bind(this);
    this.re_render = this.re_render.bind(this);
    this.black_jump = this.black_jump.bind(this);
    this.red_jump = this.red_jump.bind(this);
    this.find_kill_moves = this.find_kill_moves.bind(this);
    this.game_channel.on("someone_moves", msg => {
      console.log("I also receives!", msg)
      this.re_render(msg.state);
    });

    // some init need jump
    // console.log(this.game_state);
    if (this.game_state.turn.length != 1) {
      if (this.check_player_this_turn()) {
        this.is_multi_jump = true;
      }
      // let pos = this.game_state.turn.slice(2);
      // console.log(pos);
      // this.find_kill_moves(parseInt(pos));
      // this.re_render(this.game_state);
    }
  }

  check_player_this_turn() {
    let len_turn = this.game_state.turn.length;
    let result;
    if (len_turn == 1) {
      result = (this.game_state.turn == "r" && window.userID == this.game_state.red) ||
        (this.game_state.turn == "b" && window.userID == this.game_state.black);
      // console.log(1,result);
      return result;
    }
    result = (this.game_state.turn[1] == "r" && window.userID == this.game_state.red) ||
      (this.game_state.turn[1] == "b" && window.userID == this.game_state.black);
    // console.log(2,result);
    return result;
  }

  re_render(new_state) {
    console.log("re_render", new_state);
    this.game_state = new_state;
    this.setState(this.initial_state);
  }

  canMove(turn, board_stateidx) {
    let result = this.getValidMoves(turn, board_stateidx);
    return result.move.length > 0 || result.killMove.length > 0;
  }

  // just setState for like "cr10", not general use
  // set_state
  find_kill_moves(pos) {
    // pos int
    // console.log(pos, this.game_state);
    let x = this.game_state.board_state[pos];

    let x_color = x[0];
    let alternatives = [];
    if (x_color == "r") {
      this.red_jump(pos, alternatives)
    } else {
      this.black_jump(pos, alternatives)
    }
    // console.log(alternatives);
    this.setState({
      clickedItem: pos,
      validMoves: [],
      killMoves: alternatives
    });
  }

  return_kill_moves(pos) {
    // console.log(pos, this.game_state);
    let x = this.game_state.board_state[pos];

    let x_color = x[0];
    let alternatives = [];
    if (x_color == "r") {
      this.red_jump(pos, alternatives)
    } else {
      this.black_jump(pos, alternatives)
    }
    return alternatives;
  }

  // int, [] :: [pos, pos]
  red_jump(pos, alter) {
    let x = this.game_state.board_state[pos];
    let row = Math.floor(pos / 4);
    let pairs;
    if (x.length == 2) {
      // queen
      if (row % 2 == 0) {
        // jump_pos, move_pos
        pairs = [
          [pos - 9, pos - 4],
          [pos - 7, pos - 3],
          [pos + 7, pos + 4],
          [pos + 9, pos + 5]
        ];
      } else {
        pairs = [
          [pos - 9, pos - 5],
          [pos - 7, pos - 4],
          [pos + 7, pos + 3],
          [pos + 9, pos + 4]
        ];
      }
    } else {
      // normal
      if (row % 2 == 0) {
        pairs = [
          [pos - 9, pos - 4],
          [pos - 7, pos - 3]
        ];
      } else {
        pairs = [
          [pos - 9, pos - 5],
          [pos - 7, pos - 4]
        ];
      }
    }
    // get alter
    for (let i = 0; i < pairs.length; i++) {
      let jump = pairs[i][0];
      let move = pairs[i][1];
      // console.log(jump,move);
      if (jump < 0 || jump > 31 || move < 0 || move > 31) {
        continue;
      }
      let row_jump = Math.floor(jump / 4);
      let row_move = Math.floor(move / 4);
      if (Math.abs(row_jump - row) != 2 || Math.abs(row_move - row) != 1) {
        continue
      }
      if (this.game_state.board_state[jump] != "" ||
        this.game_state.board_state[move] == "r" ||
        this.game_state.board_state[move] == "rq" ||
        this.game_state.board_state[move] == "") {
        continue;
      }
      alter.push(jump);
    }

    // console.log(alter);
  }

  // int, [pos, pos]
  black_jump(pos, alter) {
    // console.log("see", pos);
    let x = this.game_state.board_state[pos];
    let row = Math.floor(pos / 4);
    let pairs;
    if (x.length == 2) {
      // queen
      if (row % 2 == 0) {
        // jump_pos, move_pos
        pairs = [
          [pos - 9, pos - 4],
          [pos - 7, pos - 3],
          [pos + 7, pos + 4],
          [pos + 9, pos + 5]
        ];
      } else {
        pairs = [
          [pos - 9, pos - 5],
          [pos - 7, pos - 4],
          [pos + 7, pos + 3],
          [pos + 9, pos + 4]
        ];
      }
    } else {
      // normal
      if (row % 2 == 0) {
        pairs = [
          [pos + 7, pos + 4],
          [pos + 9, pos + 5]
        ];
      } else {
        pairs = [
          [pos + 7, pos + 3],
          [pos + 9, pos + 4]
        ];
      }
    }
    // console.log("see", pairs);
    // get alter
    for (let i = 0; i < pairs.length; i++) {
      let jump = pairs[i][0];
      let move = pairs[i][1];
      // console.log("jump,move", jump, move)
      if (jump < 0 || jump > 31 || move < 0 || move > 31) {
        // console.log(1, jump, move);
        continue;
      }
      let row_jump = Math.floor(jump / 4);
      let row_move = Math.floor(move / 4);
      // console.log(row_jump, row_move);
      if (Math.abs(row_jump - row) != 2 || Math.abs(row_move - row) != 1) {
        // console.log(jump, move);
        continue
      }
      if (this.game_state.board_state[jump] != "" ||
        this.game_state.board_state[move] == "b" ||
        this.game_state.board_state[move] == "bq" ||
        this.game_state.board_state[move] == "") {
        // console.log(2, jump, move);
        continue;
      }
      alter.push(jump);
    }
    // console.log(alter);
  }

  highlightMoves(turn, board_stateidx) {
    if (turn.length != 1 && this.check_player_this_turn()) {
      this.is_multi_jump = true;
      this.find_kill_moves(parseInt(turn.slice(2)));
    } else if (
      this.check_player_this_turn() &&
      this.canMove(turn, board_stateidx) &&
      ((this.game_state.turn == "r" && parseInt(this.game_state.red) ==
          window.userID) ||
        (this.game_state.turn == "b" && parseInt(this.game_state
          .black) == window.userID))
    ) {
      let result = this.getValidMoves(turn, board_stateidx);

      let something_to_find = {
        clickedItem: board_stateidx,
        validMoves: result.move,
        killMoves: result.killMove
      }
      // console.log("find out:", something_to_find);
      this.setState(something_to_find)
    } else
      this.setState({
        clickedItem: -1,
        validMoves: [],
        killMoves: []
      })
  }

  getValidMoves(turn, board_stateidx) {
    let move = [];
    let killMove = [];
    if (board_stateidx < 0 || board_stateidx >= this.game_state.board_state
      .length)
      return false;
    let row = Math.floor((board_stateidx) / 4);
    if (turn == "r" && this.game_state.board_state[board_stateidx] ==
      "r") {
      if (row % 2 == 0) {
        if ((board_stateidx - 4) >= 0 && (this.game_state.board_state[
            board_stateidx - 4] == "") && row - 1 == Math.floor(
            (board_stateidx - 4) / 4))
          move.push(board_stateidx - 4)

        if ((board_stateidx - 4) >= 0 &&
          (this.game_state.board_state[board_stateidx - 4] ==
            "b" ||
            this.game_state.board_state[board_stateidx - 4] ==
            "bq") &&
          (board_stateidx - 9) >= 0 && (board_stateidx - 9) <
          this.game_state.board_state.length &&
          row - 2 == Math.floor((board_stateidx - 9) / 4) &&
          this.game_state.board_state[board_stateidx - 9] ==
          "")
          killMove.push(board_stateidx - 9)

        if ((board_stateidx - 3) >= 0 && (this.game_state.board_state[
            board_stateidx - 3] == "") && row - 1 == Math.floor(
            (board_stateidx - 3) / 4))
          move.push(board_stateidx - 3)

        if ((board_stateidx - 3) >= 0 &&
          (this.game_state.board_state[board_stateidx - 3] ==
            "b" ||
            this.game_state.board_state[board_stateidx - 3] ==
            "bq") &&
          (board_stateidx - 7) >= 0 && (board_stateidx - 7) <
          this.game_state.board_state.length &&
          row - 2 == Math.floor((board_stateidx - 7) / 4) &&
          this.game_state.board_state[board_stateidx - 7] ==
          "")

          killMove.push(board_stateidx - 7)



      } else {
        if ((board_stateidx - 4) >= 0 && (this.game_state.board_state[
            board_stateidx - 4] == "") && row - 1 == Math.floor(
            (board_stateidx - 4) / 4))
          move.push(board_stateidx - 4)

        if ((board_stateidx - 4) >= 0 &&
          (this.game_state.board_state[board_stateidx - 4] ==
            "b" ||
            this.game_state.board_state[board_stateidx - 4] ==
            "bq") &&
          (board_stateidx - 7) >= 0 && (board_stateidx - 7) <
          this.game_state.board_state.length &&
          row - 2 == Math.floor((board_stateidx - 7) / 4) &&
          this.game_state.board_state[board_stateidx - 7] ==
          "")
          killMove.push(board_stateidx - 7)

        if ((board_stateidx - 5) >= 0 && (this.game_state.board_state[
            board_stateidx - 5] == "") && (row - 1 == Math.floor(
            (board_stateidx - 5) / 4)))
          move.push(board_stateidx - 5)

        if ((board_stateidx - 5) >= 0 &&
          (this.game_state.board_state[board_stateidx - 5] ==
            "b" ||
            this.game_state.board_state[board_stateidx - 5] ==
            "bq") &&
          (board_stateidx - 9) >= 0 && (board_stateidx - 9) <
          this.game_state.board_state.length &&
          row - 2 == Math.floor((board_stateidx - 9) / 4) &&
          this.game_state.board_state[board_stateidx - 9] ==
          "")
          killMove.push(board_stateidx - 9)

      }
      //return move;
    }
    if (turn == "b" && this.game_state.board_state[board_stateidx] ==
      "b") {
      if (row % 2 != 0) {
        if ((board_stateidx + 3) >= 0 && (this.game_state.board_state[
            board_stateidx + 3] == "") && row + 1 == Math.floor(
            (board_stateidx + 3) / 4))
          move.push(board_stateidx + 3);

        if ((board_stateidx + 3) >= 0 &&
          (this.game_state.board_state[board_stateidx + 3] ==
            "r" ||
            this.game_state.board_state[board_stateidx + 3] ==
            "rq") &&
          (board_stateidx + 7) >= 0 && (board_stateidx + 7) <
          this.game_state.board_state.length &&
          row + 2 == Math.floor((board_stateidx + 7) / 4) &&
          this.game_state.board_state[board_stateidx + 7] ==
          "")
          killMove.push(board_stateidx + 7)

        if ((board_stateidx + 4) >= 0 && (this.game_state.board_state[
            board_stateidx + 4] == "") && row + 1 == Math.floor(
            (board_stateidx + 4) / 4))
          move.push(board_stateidx + 4)

        if ((board_stateidx + 4) >= 0 &&
          (this.game_state.board_state[board_stateidx + 4] ==
            "r" ||
            this.game_state.board_state[board_stateidx + 4] ==
            "rq") &&
          (board_stateidx + 9) >= 0 && (board_stateidx + 9) <
          this.game_state.board_state.length &&
          row + 2 == Math.floor((board_stateidx + 9) / 4) &&
          this.game_state.board_state[board_stateidx + 9] ==
          "") {
          killMove.push(board_stateidx + 9)
        }

      } else {
        if ((board_stateidx + 4) >= 0 && (this.game_state.board_state[
            board_stateidx + 4] == "") && row + 1 == Math.floor(
            (board_stateidx + 4) / 4))
          move.push(board_stateidx + 4);

        if ((board_stateidx + 4) >= 0 &&
          (this.game_state.board_state[board_stateidx + 4] ==
            "r" ||
            this.game_state.board_state[board_stateidx + 4] ==
            "rq") &&
          (board_stateidx + 7) >= 0 && (board_stateidx + 7) <
          this.game_state.board_state.length &&
          row + 2 == Math.floor((board_stateidx + 7) / 4) &&
          this.game_state.board_state[board_stateidx + 7] ==
          "")
          killMove.push(board_stateidx + 7)

        if ((board_stateidx + 5) >= 0 && (this.game_state.board_state[
            board_stateidx + 5] == "") && (row + 1) == Math
          .floor((board_stateidx + 5) / 4))
          move.push(board_stateidx + 5);

        if ((board_stateidx + 5) >= 0 &&
          (this.game_state.board_state[board_stateidx + 5] ==
            "r" ||
            this.game_state.board_state[board_stateidx + 5] ==
            "rq") &&
          (board_stateidx + 9) >= 0 && (board_stateidx + 9) <
          this.game_state.board_state.length &&
          row + 2 == Math.floor((board_stateidx + 9) / 4) &&
          this.game_state.board_state[board_stateidx + 9] ==
          "")
          killMove.push(board_stateidx + 9)

      }
      //return move;
    }
    if ((turn == "r" && this.game_state.board_state[board_stateidx] ==
        "rq") ||
      (turn == "b" && this.game_state.board_state[board_stateidx] ==
        "bq")) {
      if (row % 2 == 0) {
        if ((board_stateidx - 3) >= 0 && (this.game_state.board_state[
            board_stateidx - 3] == "") && row - 1 == Math.floor(
            (board_stateidx - 3) / 4))
          move.push(board_stateidx - 3);

        if ((board_stateidx - 3) >= 0 &&
          ((this.game_state.board_state[board_stateidx] ==
              "rq" && (this.game_state.board_state[
                  board_stateidx - 3] == "b" ||
                this.game_state.board_state[
                  board_stateidx - 3] == "bq")) ||
            (this.game_state.board_state[board_stateidx] ==
              "bq" && (this.game_state.board_state[
                  board_stateidx - 3] == "r" ||
                this.game_state.board_state[
                  board_stateidx - 3] == "rq"))) &&
          (board_stateidx - 7) >= 0 && (board_stateidx - 7) <
          this.game_state.board_state.length &&
          row - 2 == Math.floor((board_stateidx - 7) / 4) &&
          this.game_state.board_state[board_stateidx - 7] ==
          "")
          killMove.push(board_stateidx - 7)

        if ((board_stateidx - 4) >= 0 &&
          (board_stateidx - 4) < 32 &&
          row - 1 == Math.floor((board_stateidx - 4) / 4) &&
          (this.game_state.board_state[board_stateidx - 4] ==
            ""))
          move.push(board_stateidx - 4);

        if ((board_stateidx - 4) >= 0 &&
          ((this.game_state.board_state[board_stateidx] ==
              "rq" && (this.game_state.board_state[
                  board_stateidx - 4] == "b" ||
                this.game_state.board_state[
                  board_stateidx - 4] == "bq")) ||
            (this.game_state.board_state[board_stateidx] ==
              "bq" && (this.game_state.board_state[
                  board_stateidx - 4] == "r" ||
                this.game_state.board_state[
                  board_stateidx - 4] == "rq"))) &&
          (board_stateidx - 9) >= 0 && (board_stateidx - 9) <
          this.game_state.board_state.length &&
          row - 2 == Math.floor((board_stateidx - 9) / 4) &&
          this.game_state.board_state[board_stateidx - 9] ==
          "")
          killMove.push(board_stateidx - 9)

        if ((board_stateidx + 4) >= 0 && (this.game_state.board_state[
            board_stateidx + 4] == "") && row + 1 == Math.floor(
            (board_stateidx + 4) / 4))
          move.push(board_stateidx + 4);

        let validMoveIdx = board_stateidx + 4
        let killMoveIdx = board_stateidx + 7
        if ((validMoveIdx) >= 0 &&
          ((this.game_state.board_state[board_stateidx] ==
              "rq" && (this.game_state.board_state[
                  validMoveIdx] == "b" ||
                this.game_state.board_state[
                  validMoveIdx] == "bq")) ||
            (this.game_state.board_state[board_stateidx] ==
              "bq" && (this.game_state.board_state[
                  validMoveIdx] == "r" ||
                this.game_state.board_state[
                  validMoveIdx] == "rq"))) &&
          (killMoveIdx) >= 0 && (killMoveIdx) < this.game_state
          .board_state.length &&
          row + 2 == Math.floor((killMoveIdx) / 4) &&
          this.game_state.board_state[killMoveIdx] == "")
          killMove.push(killMoveIdx)

        if ((board_stateidx + 5) >= 0 &&
          (this.game_state.board_state[board_stateidx + 5] ==
            "") &&
          row + 2 == Math.floor((board_stateidx + 5) / 4))
          move.push(board_stateidx + 5);

        validMoveIdx = board_stateidx + 5
        killMoveIdx = board_stateidx + 9
        if ((validMoveIdx) >= 0 &&
          ((this.game_state.board_state[board_stateidx] ==
              "rq" && (this.game_state.board_state[
                  validMoveIdx] == "b" ||
                this.game_state.board_state[
                  validMoveIdx] == "bq")) ||
            (this.game_state.board_state[board_stateidx] ==
              "bq" && (this.game_state.board_state[
                  validMoveIdx] == "r" ||
                this.game_state.board_state[
                  validMoveIdx] == "rq"))) &&
          (killMoveIdx) >= 0 && (killMoveIdx) < this.game_state
          .board_state.length &&
          row + 2 == Math.floor((killMoveIdx) / 4) &&
          this.game_state.board_state[killMoveIdx] == "")
          killMove.push(killMoveIdx)

      } else {
        if ((board_stateidx - 4) >= 0 && (this.game_state.board_state[
            board_stateidx - 4] == "") && row - 1 == Math.floor(
            (board_stateidx - 4) / 4))
          move.push(board_stateidx - 4);

        let validMoveIdx = board_stateidx - 4
        let killMoveIdx = board_stateidx - 7
        if ((validMoveIdx) >= 0 &&
          ((this.game_state.board_state[board_stateidx] ==
              "rq" && (this.game_state.board_state[
                  validMoveIdx] == "b" ||
                this.game_state.board_state[
                  validMoveIdx] == "bq")) ||
            (this.game_state.board_state[board_stateidx] ==
              "bq" && (this.game_state.board_state[
                  validMoveIdx] == "r" ||
                this.game_state.board_state[
                  validMoveIdx] == "rq"))) &&
          (killMoveIdx) >= 0 && (killMoveIdx) < this.game_state
          .board_state.length &&
          row - 2 == Math.floor((killMoveIdx) / 4) &&
          this.game_state.board_state[killMoveIdx] == "")
          killMove.push(killMoveIdx)

        if ((board_stateidx - 5) >= 0 && (this.game_state.board_state[
            board_stateidx - 5] == "") && row - 1 == Math.floor(
            (board_stateidx - 5) / 4))
          move.push(board_stateidx - 5);

        validMoveIdx = board_stateidx - 5
        killMoveIdx = board_stateidx - 9
        if ((validMoveIdx) >= 0 &&
          ((this.game_state.board_state[board_stateidx] ==
              "rq" && (this.game_state.board_state[
                  validMoveIdx] == "b" ||
                this.game_state.board_state[
                  validMoveIdx] == "bq")) ||
            (this.game_state.board_state[board_stateidx] ==
              "bq" && (this.game_state.board_state[
                  validMoveIdx] == "r" ||
                this.game_state.board_state[
                  validMoveIdx] == "rq"))) &&
          (killMoveIdx) >= 0 && (killMoveIdx) < this.game_state
          .board_state.length &&
          row - 2 == Math.floor((killMoveIdx) / 4) &&
          this.game_state.board_state[killMoveIdx] == "")
          killMove.push(killMoveIdx)

        if ((board_stateidx + 3) >= 0 && (this.game_state.board_state[
            board_stateidx + 3] == "") && row + 1 == Math.floor(
            (board_stateidx + 3) / 4))
          move.push(board_stateidx + 3);

        validMoveIdx = board_stateidx + 3
        killMoveIdx = board_stateidx + 7
        if ((validMoveIdx) >= 0 &&
          ((this.game_state.board_state[board_stateidx] ==
              "rq" && (this.game_state.board_state[
                  validMoveIdx] == "b" ||
                this.game_state.board_state[
                  validMoveIdx] == "bq")) ||
            (this.game_state.board_state[board_stateidx] ==
              "bq" && (this.game_state.board_state[
                  validMoveIdx] == "r" ||
                this.game_state.board_state[
                  validMoveIdx] == "rq"))) &&
          (killMoveIdx) >= 0 && (killMoveIdx) < this.game_state
          .board_state.length &&
          row + 2 == Math.floor((killMoveIdx) / 4) &&
          this.game_state.board_state[killMoveIdx] == "")
          killMove.push(killMoveIdx)

        if ((board_stateidx + 4) >= 0 && (this.game_state.board_state[
            board_stateidx + 4] == "") && row + 1 == Math.floor(
            (board_stateidx + 4) / 4))
          move.push(board_stateidx + 4);

        validMoveIdx = board_stateidx + 4
        killMoveIdx = board_stateidx + 9
        if ((validMoveIdx) >= 0 &&
          ((this.game_state.board_state[board_stateidx] ==
              "rq" && (this.game_state.board_state[
                  validMoveIdx] == "b" ||
                this.game_state.board_state[
                  validMoveIdx] == "bq")) ||
            (this.game_state.board_state[board_stateidx] ==
              "bq" && (this.game_state.board_state[
                  validMoveIdx] == "r" ||
                this.game_state.board_state[
                  validMoveIdx] == "rq"))) &&
          (killMoveIdx) >= 0 && (killMoveIdx) < this.game_state
          .board_state.length &&
          row + 2 == Math.floor((killMoveIdx) / 4) &&
          this.game_state.board_state[killMoveIdx] == "")
          killMove.push(killMoveIdx)

      }
      //return move;
    }
    return {
      move: move,
      killMove: killMove
    };
  }

  moveCoin(fromIdx, toIdx, game_channel) {
    console.log("push now!", fromIdx, toIdx)
    game_channel.push(
        'game:update_border', {
          next_step: {
            "from": fromIdx,
            "to": toIdx
          }
        })
      .receive('ok', (payload) => {
        // console.log("receive now!", payload.state);
        if (payload.state.turn.length != 1) {
          // need to change this state.
          this.find_kill_moves(parseInt(payload.state.turn.slice(2)));
        }

        // this.re_render(payload.state);

        // this.setState(this.initial_state);
        // console.log("Debug: update", payload.state);
      })
      .receive('error', (info) => {
        console.log("Error to see game data", info);
      });
  }

  render() {
    // console.log("refresh will here is");

    if (this.game_state.turn.length != 1) {
      if (this.check_player_this_turn()) {
        // console.log("yes set multi");
        this.is_multi_jump = true;
      }
    } else {
      this.is_multi_jump = false;
    }

    return (
      <div>
          <StopMutltiJumpButton root={this} game_channel={this.game_channel}/>
          <ShowTurn root={this}/>
          <div id="board">
            <BoardCells is_multi_jump={this.is_multi_jump} game_state={this.game_state} root= {this} game_channel={this.game_channel}/>
          </div>
        </div>
    );
  }
}

function StopMutltiJumpButton(params) {
  if (params.root.is_multi_jump) {
    return (
      <button
      onClick={()=>{
        let from = parseInt(params.root.game_state.turn.slice(2));

        params.game_channel.push(
          'game:update_border', {
                next_step: {
                    "from": from,
                    "to": from
                }
            })
            .receive('ok', (payload) => {
                console.log("receive now!", payload.state);
                params.root.is_multi_jump = false;
                // params.root.re_render(payload.state);
                // this.setState(this.initial_state);
                // console.log("Debug: update", payload.state);
            })
            .receive('error', (info) => {
                console.log("Error to see game data", info);
            });
      }}>
      You can renounce multi jump by clicking me!</button>
    );
  }
  return (<div></div>);
}

function ShowTurn(params) {
  if (params.root.check_player_this_turn()) {
    return (<p className="turn_info">Please make your choice. Good luck!</p>)
  }
  return (<p className="turn_info">Your opponent's turn now. Think hard!</p>)
}

// param: list[32] to tell the piece situation
function BoardCells(params) {
  // console.log("Just see cells", params.is_multi_jump)
  var rows = [];
  var stateidx = 0;
  //  console.log("our state", this.state);
  // {[...Array(8)].map((x,i) =>
  for (var j = 0; j < 8; j++) {
    var cols = []
    // {[...Array(8)].map((y,j) =>
    for (var i = 0; i < 8; i++) {
      let canMove = false;
      if (stateidx < 32)
        canMove = params.root.canMove(params.game_state.turn, stateidx);

      cols.push(
        <BoardCell idx={stateidx}
                           check_player_this_turn={params.root.check_player_this_turn}
                           is_multi_jump = {params.is_multi_jump}
                           row={j}
                           col={i}
                           game_channel = {params.game_channel}
                           game_state = {params.game_state}
                           current_elem={params.game_state.board_state[stateidx]}
                           canMove = {canMove}
                           clicked= {params.root.state.clickedItem == stateidx}
                           validMoves = {params.root.state.validMoves}
                           killMoves={params.root.state.killMoves}
                           root={params.root}/>
      )
      if ((j % 2 == 0 && i % 2 != 0) || (j % 2 != 0 && i % 2 == 0)) {
        stateidx++;

      }
    }
    rows.push(cols)
  }
  // let pos = params.root.game_state.turn.slice(2);
  // params.root.find_kill_moves(parseInt(pos));
  return (
    <div className="inner">
         {rows}
     </div>
  );
}

function BoardCell(params) {
  let alters = [];
  let pos;
  if (params.is_multi_jump) {
    // console.log("yes multi!")
    pos = parseInt(params.game_state.turn.slice(2));
    alters = params.root.return_kill_moves(pos);
    // console.log(pos,alters);
  }
  // console.log(alters);

  // just find how to return special for pos and in alters



  if (
    pos == params.idx &&
    ((params.row % 2 == 0 && params.col % 2 != 0) ||
      (params.row % 2 != 0 && params.col % 2 == 0))
  ) {

    // console.log("Yes I am right!", params.row, params.col);
    if (params.current_elem == "r") {
      return (<div className ='boardcell redyellowhighlight'>&nbsp;</div>);
    }
    if (params.current_elem == "rq") {
      return (<div className ='boardcell redqueenyellowhighlight'>&nbsp;</div>);
    }
    if (params.current_elem == "b") {
      return (<div className ='boardcell blackyellowhighlight'>&nbsp;</div>);
    }
    if (params.current_elem == "bq") {
      return (
        <div className ='boardcell blackqueenyellowhighlight'>&nbsp;</div>);
    }
  }

  for (let i = 0; i < alters.length; i++) {

    if (
      alters[i] == params.idx &&
      ((params.row % 2 == 0 && params.col % 2 != 0) ||
        (params.row % 2 != 0 && params.col % 2 == 0))
    ) {
      return (
        <div className = "boardcell killMove"
          onClick =
          { () => params.root.moveCoin(pos, params.idx, params.game_channel)}>
          &nbsp;</div>
      );
    }
  }

  if ((params.row % 2 == 0 && params.col % 2 == 0) || (params.row % 2 != 0 &&
      params.col % 2 != 0)) {
    return (<div className = "boardcell">&nbsp;</div>);
  } else {
    if (params.validMoves.indexOf(params.idx) != -1)
      return (
        <div className = "boardcell validMove"
                onClick =
                { () => params.root.moveCoin(params.root.state.clickedItem, params.idx, params.game_channel)}>
                &nbsp;</div>
      );
    if (params.killMoves.indexOf(params.idx) != -1)
      return (
        <div className = "boardcell killMove"
                onClick =
                { () => params.root.moveCoin(params.root.state.clickedItem, params.idx, params.game_channel)}>
                &nbsp;</div>
      );

    if (params.current_elem == "b")
      return (
        <div className = {(params.canMove && params.check_player_this_turn()) ?
                  (params.clicked ? 'boardcell blackyellowhighlight' :'boardcell blackwhitehighlight')
                  : 'boardcell blackSoldier' }
                  onClick= { () => {params.root.highlightMoves(params.root.game_state.turn, params.idx)} }>
                  &nbsp;</div>
      );
    else if (params.current_elem == "r")
      return (
        <div className =
                {(params.canMove && params.check_player_this_turn()) ?
                  (params.clicked ? 'boardcell redyellowhighlight' :'boardcell redwhitehighlight')
                  : 'boardcell redSoldier' }
                  onClick= { () =>
                    {params.root.highlightMoves(params.root.game_state.turn, params.idx)} }>
                    &nbsp;</div>
      );
    else if (params.current_elem == "rq")
      return (
        <div className =
                {(params.canMove && params.check_player_this_turn()) ?
                  (params.clicked ? 'boardcell redqueenyellowhighlight' :'boardcell redqueenwhitehighlight')
                  : 'boardcell redQueen' }
                  onClick=
                  { () => params.root.highlightMoves(params.root.game_state.turn, params.idx) }>
                  &nbsp;</div>
      );
    else if (params.current_elem == "bq")
      return (
        <div className =
                {(params.canMove && params.check_player_this_turn()) ?
                  (params.clicked ? 'boardcell blackqueenyellowhighlight' :'boardcell blackqueenwhitehighlight')
                  : 'boardcell blackQueen' }
                  onClick=
                  { () => params.root.highlightMoves(params.root.game_state.turn, params.idx) }>&nbsp;</div>
      );
    else
      return (<div className = "boardcell">&nbsp;</div>);
  }

}
