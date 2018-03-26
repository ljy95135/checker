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
        this.game_channel = props.game_channel;
        this.game_state = props.game_state;
        this.game_state.board_state = this.game_state.board_state;
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

        this.game_channel.on("someone_moves", msg => {
            this.re_render(msg.state);
        });
    }

    check_player_this_turn(){
      let len_turn = this.game_state.turn.length;
      if (len_turn == 1){
        return (this.game_state.turn == "r" && window.userID == this.game_state.red)
        || (this.game_state.turn == "b" && window.userID == this.game_state.black);
      }
      return (this.game_state.turn[1] == "r" && window.userID == this.game_state.red)
      || (this.game_state.turn[1] == "b" && window.userID == this.game_state.black);
    }

    re_render(new_state) {
        this.game_state = new_state;
        this.setState(this.initial_state);
    }

    canMove(turn, board_stateidx) {
        let result = this.getValidMoves(turn, board_stateidx);
        return result.move.length > 0 || result.killMove.length > 0;
    }

    highlightMoves(turn, board_stateidx) {
        if (
          this.check_player_this_turn() &&
          this.canMove(turn, board_stateidx) &&
            ((this.game_state.turn == "r" && parseInt(this.game_state.red) ==
                    window.userID) ||
                (this.game_state.turn == "b" && parseInt(this.game_state
                    .black) == window.userID))
                  ) {
            let result = this.getValidMoves(turn, board_stateidx);
            // console.log("I should not be here");
            this.setState({
                clickedItem: board_stateidx,
                validMoves: result.move,
                killMoves: result.killMove
            })
        } else
            this.setState({
                clickedItem: -1,
                validMoves: [],
                killMoves: []
            })
    }

    getValidMoves(turn, board_stateidx) {
      if (turn.length!=1){
        // to do return what it needs.
        return null;
      }
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
        console.log("push now!")
        game_channel.push('game:update_border', {
                next_step: {
                    "from": fromIdx,
                    "to": toIdx
                }
            })
            .receive('ok', (payload) => {
                  console.log("receive now!", payload.state);
                this.re_render(payload.state);
                this.setState(this.initial_state);
                // console.log("Debug: update", payload.state);
            })
            .receive('error', (info) => {
                console.log("Error to see game data", info);
            });
    }

    render() {
        return (
        <div>
          <ShowTurn root={this}/>
          <div id="board">
            <BoardCells game_state={this.game_state} root= {this} game_channel={this.game_channel}/>
          </div>
        </div>
        );
    }
}


function ShowTurn(params){
  if (params.root.check_player_this_turn()) {
    return (<p className="turn_info">Please make your choice. Good luck!</p>)
  }
  return (<p className="turn_info">Your opponent's turn now. Think hard!</p>)
}

// param: list[32] to tell the piece situation
function BoardCells(params) {
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
                           row={j}
                           col={i}
                           game_channel = {params.game_channel}
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
    return (
        <div className="inner">
         {rows}
     </div>
    );
}

function BoardCell(params) {


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
