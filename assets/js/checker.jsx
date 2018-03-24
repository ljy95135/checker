import React from 'react';
import ReactDOM from 'react-dom';
import {
  Button
} from 'reactstrap';

export default function run_checker(root, game_state) {
  ReactDOM.render(<Checker game_state={game_state} />, root);
}

class Checker extends React.Component {
  constructor(props) {
    super(props);
    this.game_state = props.game_state;
    this.game_state.pos_state = ["b", "b", "b", "b", "b", "b", "b", "b",
      "b", "b", "b", "b", "", "", "", "", "", "", "", "", "r", "r", "r",
      "r", "r", "r", "r", "r", "r", "r", "r", "r"
    ];
    this.game_state.turns = "r";
  }

  render() {
    return (
      <div id="board">
        <BoardCells game_state={this.game_state} />
      </div>
    );
  }
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
      if (j % 2 == 0) {
        if (i % 2 == 0) {
          cols.push(<div className = "boardcell">&nbsp;</div>)
        } else {
          if (params.game_state.pos_state[stateidx] == "b")
            cols.push(<div className = "boardcell blackSoldier">&nbsp;</div>)
          else if (params.game_state.pos_state[stateidx] == "r")
            cols.push(<div className = "boardcell redSoldier">&nbsp;</div>)
          else
            cols.push(<div className = "boardcell">&nbsp;</div>)
          stateidx++;
        }
      } else {
        if (i % 2 != 0) {
          cols.push(<div className = "boardcell">&nbsp;</div>)
        } else {
          if (params.game_state.pos_state[stateidx] == "b")
            cols.push(<div className = "boardcell blackSoldier">&nbsp;</div>)
          else if (params.game_state.pos_state[stateidx] == "r")
            cols.push(<div className = "boardcell redSoldier">&nbsp;</div>)
          else
            cols.push(<div className = "boardcell">&nbsp;</div>)
          stateidx++;
        }

      }

    }
    rows.push(cols)
  }
  return (
    <div className="inner">
         {rows}
     </div>
    //  <div className="inner">
    //  {/* row1 */}
    //  <div className="boardcell">&nbsp;</div>
    //  <div id="0" className="boardcell blackSoldier">&nbsp;</div>
    //  <div className="boardcell">&nbsp;</div>
    //  <div id="1" className="boardcell blackSoldier">&nbsp;</div>
    //  <div className="boardcell">&nbsp;</div>
    //  <div id="2" className="boardcell blackSoldier">&nbsp;</div>
    //  <div className="boardcell">&nbsp;</div>
    //  <div id="3" className="boardcell blackSoldier">&nbsp;</div>
    //{/* row2 */}
    //{/* ... */}
    // </div>

  );
}

function BordCell(params) {

}
