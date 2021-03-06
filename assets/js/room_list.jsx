import React from 'react';
import ReactDOM from 'react-dom';
import {
  Button
} from 'reactstrap';

export default function run_room_list(root, current_rooms, socket) {
  ReactDOM.render(<RoomList rooms={current_rooms} socket={socket}/>, root);
}

class RoomList extends React.Component {
  constructor(props) {
    super(props);
    this.handleJoin = this.handleJoin.bind(this);
  }

  handleJoin(room_id) {
    let socket = this.props.socket;
    let user_id = window.userID;
    // console.log(room_id);
    // use channel join with your user_id
    let game_channel = socket.channel("game:" + room_id, {});
    game_channel.join()
      .receive("ok", resp => {
        console.log("Joined Game successfully", resp)
      })
      .receive("error", resp => {
        console.log("Unable to join game", resp)
      });
    window.location = "/game/" + room_id;
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
      <RoomInfomation room={room} key={room.id} on_click_fun={this.handleJoin}/>
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
  return (
    <li>{params.room.id} | red:{params.room.red} | black:{params.room.black} |
  &nbsp;<button className="btn btn-primary" onClick={() => params.on_click_fun(params.room.id)}>Join</button> </li>
  );
}
