import React from 'react';
import ReactDOM from 'react-dom';
import {
  Button
} from 'reactstrap';

export default function run_room_list(root, current_rooms) {
  ReactDOM.render(<RoomList rooms={current_rooms}/>, root);
}

class RoomList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    // return (
    //   <p>{this.props.rooms[0].id}</p>
    // );

    // return (
    //   this.props.rooms.map((room) =>{
    //     <li>room.id</li>
    //   })
    // );
    console.log("in RoomList", this.props.rooms);
    let rooms = this.props.rooms.map((room) =>
      <RoomInfomation room={room} key={room.id}/>
    );

    // rooms = this.props.rooms.map((room) => {
    //   room
    // });

    // console.log(rooms);
    // let x = <RoomInfomation room={this.props.rooms[0]}/>;
    // console.log(x);
    return (
      <ul>
        {rooms}
      </ul>
    )
  }
}

function RoomInfomation(params) {
  // console.log(params.room.id);
  return (<li>{params.room.id}</li>);
}
