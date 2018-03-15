import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'reactstrap';

export default function run_checker(root) {
  ReactDOM.render(<Checker />, root);
}

class Checker extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="board">
        <BoardCells />
      </div>
    );
  }
}

// param: list[32] to tell the piece situation
function BoardCells(params) {
  return (
    <div className="inner">
    {/* row1 */}
    <div className="boardcell">&nbsp;</div>
    <div id="0" className="boardcell blackSoldier">&nbsp;</div>
    <div className="boardcell">&nbsp;</div>
    <div id="1" className="boardcell blackSoldier">&nbsp;</div>
    <div className="boardcell">&nbsp;</div>
    <div id="2" className="boardcell blackSoldier">&nbsp;</div>
    <div className="boardcell">&nbsp;</div>
    <div id="3" className="boardcell blackSoldier">&nbsp;</div>
    {/* row2 */}
    {/* ... */}
    </div>
  );
}

function BordCell(params) {

}
