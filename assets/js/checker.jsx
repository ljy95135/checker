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
    this.game_state.board_state = //this.game_state.borard_state;
    ["b", "b", "b", "b", "", "", "b", "b",
       "bq", "b", "b", "b", "", "rq", "", "", "", "", "", "", "r",
       "r", "r", "r", "r", "r", "r", "r", "r", "r", "r", "r"
     ];
    this.game_state.turn = 'b';
    this.state = {
      clickedItem : -1,
      validMoves: [],
      killMoves: []
    }
  }
  

  canMove(turn, board_stateidx) {
    let result = this.getValidMoves(turn, board_stateidx);
    return result.move.length > 0 || result.killMove.length > 0;
  }

   highlightMoves(turn, board_stateidx) {
      if(this.canMove(turn, board_stateidx)){
        let result = this.getValidMoves(turn, board_stateidx);
        this.setState({clickedItem: board_stateidx, validMoves: result.move, killMoves: result.killMove})
      }
      else
        this.setState({clickedItem: -1, validMoves:[]})
   }
   getValidMoves(turn, board_stateidx){
    let move = [];
    let killMove = [];
    if(board_stateidx < 0 || board_stateidx >= this.game_state.board_state.length)
      return false;
    let row  = Math.floor((board_stateidx)/4);
    if(turn == "r" && this.game_state.board_state[board_stateidx] == "r") {
      if(row % 2 == 0) {
        if((board_stateidx - 4) >= 0 && (this.game_state.board_state[board_stateidx - 4] == "") && row -1 == Math.floor((board_stateidx-4)/4))
          move.push(board_stateidx - 4)

         if((board_stateidx - 4) >= 0 
          && (this.game_state.board_state[board_stateidx - 4] == "b" 
              || this.game_state.board_state[board_stateidx - 4] == "bq")
          && (board_stateidx - 9) >=0 && (board_stateidx -9) < this.game_state.board_state.length
          && row - 2 == Math.floor((board_stateidx - 9)/4)
          && this.game_state.board_state[board_stateidx - 9] == "")
          killMove.push(board_stateidx - 9)

        if((board_stateidx - 3) >= 0 && (this.game_state.board_state[board_stateidx - 3] == "") && row - 1 == Math.floor((board_stateidx-3)/4))
          move.push(board_stateidx - 3)

        if((board_stateidx - 3) >= 0 
          && (this.game_state.board_state[board_stateidx - 3] == "b" 
              || this.game_state.board_state[board_stateidx - 3] == "bq")
          && (board_stateidx - 7) >=0 && (board_stateidx - 7) < this.game_state.board_state.length
          && row - 2 == Math.floor((board_stateidx-7)/4)
          && this.game_state.board_state[board_stateidx - 7] == "")

          killMove.push(board_stateidx - 7)

        
  
      }
     else {
        if((board_stateidx - 4) >= 0 && (this.game_state.board_state[board_stateidx - 4] == "") && row -1 == Math.floor((board_stateidx-4)/4))
          move.push(board_stateidx - 4)

        if((board_stateidx - 4) >= 0 
          && (this.game_state.board_state[board_stateidx - 4] == "b" 
              || this.game_state.board_state[board_stateidx - 4] == "bq")
          && (board_stateidx - 7) >=0 && (board_stateidx - 7) < this.game_state.board_state.length
          && row - 2 == Math.floor((board_stateidx-7)/4)
          && this.game_state.board_state[board_stateidx - 7] == "")
          killMove.push(board_stateidx - 7)

        if((board_stateidx - 5) >= 0 && (this.game_state.board_state[board_stateidx - 5] == "") && (row-1 == Math.floor((board_stateidx - 5)/4)))
          move.push(board_stateidx - 5)

        if((board_stateidx - 5) >= 0 
          && (this.game_state.board_state[board_stateidx - 5] == "b" 
              || this.game_state.board_state[board_stateidx - 5] == "bq")
          && (board_stateidx - 9) >=0 && (board_stateidx -9) < this.game_state.board_state.length
          && row - 2 == Math.floor((board_stateidx - 9)/4)
          && this.game_state.board_state[board_stateidx - 9] == "")
          killMove.push(board_stateidx - 9)

      }
      //return move;
     }
     if(turn == "b" && this.game_state.board_state[board_stateidx] == "b") {
      if(row % 2 != 0) {
        if((board_stateidx + 3) >= 0 && (this.game_state.board_state[board_stateidx + 3] == "") && row + 1 == Math.floor((board_stateidx+3)/4))
          move.push(board_stateidx + 3);

        if((board_stateidx + 3) >= 0 
          && (this.game_state.board_state[board_stateidx + 3] == "r" 
              || this.game_state.board_state[board_stateidx + 3] == "rq")
          && (board_stateidx + 7) >=0 && (board_stateidx + 7) < this.game_state.board_state.length
          && row + 2 == Math.floor((board_stateidx+7)/4)
          && this.game_state.board_state[board_stateidx + 7] == "")
          killMove.push(board_stateidx + 7)

        if((board_stateidx + 4) >= 0 && (this.game_state.board_state[board_stateidx + 4] == "") && row + 1 == Math.floor((board_stateidx+4)/4))
          move.push(board_stateidx + 4)

        if((board_stateidx + 4) >= 0 
          && (this.game_state.board_state[board_stateidx + 4] == "r" 
              || this.game_state.board_state[board_stateidx + 4] == "rq")
          && (board_stateidx + 9) >=0 && (board_stateidx + 9) < this.game_state.board_state.length
          && row + 2 == Math.floor((board_stateidx + 9)/4)
          && this.game_state.board_state[board_stateidx + 9] == ""){
          killMove.push(board_stateidx + 9)
        }
  
      }
     else {
        if((board_stateidx + 4) >= 0 && (this.game_state.board_state[board_stateidx + 4] == "") && row + 1 == Math.floor((board_stateidx+4)/4))
          move.push(board_stateidx + 4);

        if((board_stateidx + 4) >= 0 
          && (this.game_state.board_state[board_stateidx + 4] == "r" 
              || this.game_state.board_state[board_stateidx + 4] == "rq")
          && (board_stateidx + 7) >=0 && (board_stateidx + 7) < this.game_state.board_state.length
          && row + 2 == Math.floor((board_stateidx+7)/4)
          && this.game_state.board_state[board_stateidx + 7] == "")
          killMove.push(board_stateidx + 7)

        if((board_stateidx + 5) >= 0 && (this.game_state.board_state[board_stateidx + 5] == "") && (row + 1) == Math.floor((board_stateidx + 5)/4))
          move.push(board_stateidx + 5);
        
        if((board_stateidx + 5) >= 0 
          && (this.game_state.board_state[board_stateidx + 5] == "r" 
              || this.game_state.board_state[board_stateidx + 5] == "rq")
          && (board_stateidx + 9) >=0 && (board_stateidx + 9) < this.game_state.board_state.length
          && row + 2 == Math.floor((board_stateidx + 9)/4)
          && this.game_state.board_state[board_stateidx + 9] == "")
          killMove.push(board_stateidx + 9)

      }
      //return move;
     }
     if((turn == "r" && this.game_state.board_state[board_stateidx] == "rq") || 
      (turn == "b" && this.game_state.board_state[board_stateidx] == "bq")){
        if(row % 2 == 0) {
          if((board_stateidx - 3) >= 0 && (this.game_state.board_state[board_stateidx - 3] == "") && row - 1 == Math.floor((board_stateidx-3)/4))
             move.push(board_stateidx - 3);

          if((board_stateidx - 3) >= 0 
          && ((this.game_state.board_state[board_stateidx] == "rq" && (this.game_state.board_state[board_stateidx - 3] == "b" 
              || this.game_state.board_state[board_stateidx - 3] == "bq"))
          || (this.game_state.board_state[board_stateidx] == "bq" && (this.game_state.board_state[board_stateidx - 3] == "r" 
              || this.game_state.board_state[board_stateidx - 3] == "rq")))
          && (board_stateidx - 7) >=0 && (board_stateidx - 7) < this.game_state.board_state.length
          && row - 2 == Math.floor((board_stateidx - 7)/4)
          && this.game_state.board_state[board_stateidx - 7] == "")
          killMove.push(board_stateidx - 7)

          if((board_stateidx - 4) >= 0 
            && (board_stateidx - 4) <32
            && row - 1 == Math.floor((board_stateidx - 4)/4) 
            && (this.game_state.board_state[board_stateidx - 4] == ""))
             move.push(board_stateidx - 4);

          if((board_stateidx - 4) >= 0 
          && ((this.game_state.board_state[board_stateidx] == "rq" && (this.game_state.board_state[board_stateidx - 4] == "b" 
              || this.game_state.board_state[board_stateidx - 4] == "bq"))
          || (this.game_state.board_state[board_stateidx] == "bq" && (this.game_state.board_state[board_stateidx - 4] == "r" 
              || this.game_state.board_state[board_stateidx - 4] == "rq")))
          && (board_stateidx - 9) >=0 && (board_stateidx - 9) < this.game_state.board_state.length
          && row - 2 == Math.floor((board_stateidx - 9)/4)
          && this.game_state.board_state[board_stateidx - 9] == "")
          killMove.push(board_stateidx - 9)
          
          if((board_stateidx + 4) >= 0 && (this.game_state.board_state[board_stateidx + 4] == "") && row + 1 == Math.floor((board_stateidx+4)/4))
              move.push(board_stateidx + 4);

          let validMoveIdx = board_stateidx + 4
          let killMoveIdx = board_stateidx + 7
          if((validMoveIdx) >= 0 
          && ((this.game_state.board_state[board_stateidx] == "rq" && (this.game_state.board_state[validMoveIdx] == "b" 
              || this.game_state.board_state[validMoveIdx] == "bq"))
          || (this.game_state.board_state[board_stateidx] == "bq" && (this.game_state.board_state[validMoveIdx] == "r" 
              || this.game_state.board_state[validMoveIdx] == "rq")))
          && (killMoveIdx) >=0 && (killMoveIdx) < this.game_state.board_state.length
          && row + 2 == Math.floor((killMoveIdx)/4)
          && this.game_state.board_state[killMoveIdx] == "")
          killMove.push(killMoveIdx)
            
          if((board_stateidx + 5) >= 0 
            && (this.game_state.board_state[board_stateidx + 5] == "")
            && row + 2 == Math.floor((board_stateidx + 5)/4))
              move.push(board_stateidx + 5);

          validMoveIdx = board_stateidx + 5
          killMoveIdx = board_stateidx + 9
          if((validMoveIdx) >= 0 
          && ((this.game_state.board_state[board_stateidx] == "rq" && (this.game_state.board_state[validMoveIdx] == "b" 
              || this.game_state.board_state[validMoveIdx] == "bq"))
          || (this.game_state.board_state[board_stateidx] == "bq" && (this.game_state.board_state[validMoveIdx] == "r" 
              || this.game_state.board_state[validMoveIdx] == "rq")))
          && (killMoveIdx) >=0 && (killMoveIdx) < this.game_state.board_state.length
          && row + 2 == Math.floor((killMoveIdx)/4)
          && this.game_state.board_state[killMoveIdx] == "")
          killMove.push(killMoveIdx)

        }
        else {
          if((board_stateidx - 4) >= 0 && (this.game_state.board_state[board_stateidx - 4] == "") && row - 1 == Math.floor((board_stateidx-4)/4))
             move.push(board_stateidx - 4);

          let validMoveIdx = board_stateidx - 4
          let killMoveIdx = board_stateidx - 7
          if((validMoveIdx) >= 0 
          && ((this.game_state.board_state[board_stateidx] == "rq" && (this.game_state.board_state[validMoveIdx] == "b" 
              || this.game_state.board_state[validMoveIdx] == "bq"))
          || (this.game_state.board_state[board_stateidx] == "bq" && (this.game_state.board_state[validMoveIdx] == "r" 
              || this.game_state.board_state[validMoveIdx] == "rq")))
          && (killMoveIdx) >=0 && (killMoveIdx) < this.game_state.board_state.length
          && row - 2 == Math.floor((killMoveIdx)/4)
          && this.game_state.board_state[killMoveIdx] == "")
          killMove.push(killMoveIdx)

          if((board_stateidx - 5) >= 0 && (this.game_state.board_state[board_stateidx - 5] == "") && row - 1 == Math.floor((board_stateidx-5)/4))
             move.push(board_stateidx - 5);

          validMoveIdx = board_stateidx - 5
          killMoveIdx = board_stateidx - 9
          if((validMoveIdx) >= 0 
          && ((this.game_state.board_state[board_stateidx] == "rq" && (this.game_state.board_state[validMoveIdx] == "b" 
              || this.game_state.board_state[validMoveIdx] == "bq"))
          || (this.game_state.board_state[board_stateidx] == "bq" && (this.game_state.board_state[validMoveIdx] == "r" 
              || this.game_state.board_state[validMoveIdx] == "rq")))
          && (killMoveIdx) >=0 && (killMoveIdx) < this.game_state.board_state.length
          && row - 2 == Math.floor((killMoveIdx)/4)
          && this.game_state.board_state[killMoveIdx] == "")
          killMove.push(killMoveIdx)          
          
          if((board_stateidx + 3) >= 0 && (this.game_state.board_state[board_stateidx + 3] == "") && row + 1 == Math.floor((board_stateidx+3)/4))
              move.push(board_stateidx + 3);

          validMoveIdx = board_stateidx + 3
          killMoveIdx = board_stateidx + 7
          if((validMoveIdx) >= 0 
          && ((this.game_state.board_state[board_stateidx] == "rq" && (this.game_state.board_state[validMoveIdx] == "b" 
              || this.game_state.board_state[validMoveIdx] == "bq"))
          || (this.game_state.board_state[board_stateidx] == "bq" && (this.game_state.board_state[validMoveIdx] == "r" 
              || this.game_state.board_state[validMoveIdx] == "rq")))
          && (killMoveIdx) >=0 && (killMoveIdx) < this.game_state.board_state.length
          && row + 2 == Math.floor((killMoveIdx)/4)
          && this.game_state.board_state[killMoveIdx] == "")
          killMove.push(killMoveIdx)
          
          if((board_stateidx + 4) >= 0 && (this.game_state.board_state[board_stateidx + 4] == "") && row + 1 == Math.floor((board_stateidx+4)/4))
              move.push(board_stateidx + 4);

          validMoveIdx = board_stateidx + 4
          killMoveIdx = board_stateidx + 9
          if((validMoveIdx) >= 0 
          && ((this.game_state.board_state[board_stateidx] == "rq" && (this.game_state.board_state[validMoveIdx] == "b" 
              || this.game_state.board_state[validMoveIdx] == "bq"))
          || (this.game_state.board_state[board_stateidx] == "bq" && (this.game_state.board_state[validMoveIdx] == "r" 
              || this.game_state.board_state[validMoveIdx] == "rq")))
          && (killMoveIdx) >=0 && (killMoveIdx) < this.game_state.board_state.length
          && row + 2 == Math.floor((killMoveIdx)/4)
          && this.game_state.board_state[killMoveIdx] == "")
          killMove.push(killMoveIdx)  

        }
        //return move;
     }
     return {move: move, killMove: killMove};
   }

  moveCoin(fromIdx, toIdx){
    console.log("moving coin", fromIdx, toIdx);
  }
  render() {
    var canMove = this.canMove.bind(this);
    var highlightMoves = this.highlightMoves.bind(this);
    var moveCoin = this.moveCoin.bind(this);
    return (
      <div id="board">
        <BoardCells game_state={this.game_state} root= {this}/>
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
      let canMove = false;
      if(stateidx <32)
        canMove = params.root.canMove(params.game_state.turn, stateidx);
      
      cols.push(<BoardCell idx={stateidx} 
                           row={j} 
                           col={i} 
                           current_elem={params.game_state.board_state[stateidx]} 
                           canMove = {canMove} 
                           clicked= {params.root.state.clickedItem == stateidx} 
                           validMoves = {params.root.state.validMoves} 
                           killMoves={params.root.state.killMoves}
                           root={params.root}/>)
      if((j%2 == 0  && i%2 !=0) || (j%2 !=0 && i %2 == 0)){
        stateidx++;

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

function BoardCell(params){
  

  if ((params.row %2 == 0 && params.col %2 == 0) || (params.row %2 != 0 && params.col%2 !=0)){
      return (<div className = "boardcell">&nbsp;</div>);
  }
  else{
    if (params.validMoves.indexOf(params.idx) != -1)
      return (<div className = "boardcell validMove">&nbsp;</div>);
    if(params.killMoves.indexOf(params.idx) != -1)
      return (<div className = "boardcell killMove">&nbsp;</div>);
    
    if(params.current_elem == "b")
      return (<div className = {params.canMove ? (params.clicked ? 'boardcell blackyellowhighlight' :'boardcell blackwhitehighlight') : 'boardcell blackSoldier' } onClick= { () => params.root.highlightMoves(params.root.game_state.turn, params.idx) }>&nbsp;</div>);
    else if(params.current_elem == "r")
      return (<div className = {params.canMove ? (params.clicked ? 'boardcell redyellowhighlight' :'boardcell redwhitehighlight') : 'boardcell redSoldier' } onClick= { () => params.root.highlightMoves(params.root.game_state.turn, params.idx) }>&nbsp;</div>);
    else if(params.current_elem == "rq")
      return (<div className = {params.canMove ? (params.clicked ? 'boardcell redqueenyellowhighlight' :'boardcell redqueenwhitehighlight') : 'boardcell redQueen' } onClick= { () => params.root.highlightMoves(params.root.game_state.turn, params.idx) }>&nbsp;</div>);
    else if(params.current_elem == "bq")
      return (<div className = {params.canMove ? (params.clicked ? 'boardcell blackqueenyellowhighlight' :'boardcell blackqueenwhitehighlight') : 'boardcell blackQueen' } onClick= { () => params.root.highlightMoves(params.root.game_state.turn, params.idx) }>&nbsp;</div>);
    else
      return (<div className = "boardcell">&nbsp;</div>);
  }
  
}
