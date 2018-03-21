// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.
// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html";
import run_checker from "./checker";
import run_room_list from "./room_list";
import {
  Socket
} from "phoenix";

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

// import socket from "./socket"
function init() {
  // create socket only when there is user_id
  let socket = new Socket("/socket", {
    params: {
      token: window.userToken,
      user_id: window.userID
    }
  });
  socket.connect();

  // global channel
  let channel = socket.channel("global", {});
  channel.join()
    .receive("ok", resp => {
      console.log("Joined Global successfully", resp)
    })
    .receive("error", resp => {
      console.log("Unable to join", resp)
    });
  console.log("Join it", channel);

  if (document.getElementById('create-room-page')) {
    $('#create-room-button').click(() => {
      let xx = $('#room-input').val();
      // new_game
      if (xx) {
        let params = {game_name: xx};
        console.log(params);
        channel.push('new_game', params)
          .receive('ok', (payload) => {
            console.log("successful new game", payload);
          })
          .receive('error', (info) => {
            console.log("error new game", info);
          })
      }
      // window.location = "/game/" + xx;
    });
  }

  let root = document.getElementById('root');
  if (root) {
    run_checker(root);
  }

  // current_games
  if (document.getElementById('current_room_list')){
    channel.push('current_games')
      .receive('ok', (payload) => {
        console.log("get current_games", payload);
        let current_rooms = payload.games;
        // put list render after receive.
        let rooms_root = document.getElementById('current_room_list');
        if (rooms_root) {
          run_room_list(rooms_root, current_rooms);
        }
      })
      .receive('error', (info) => {
        console.log("error current_games", info);
      });
  }
}

function test_login(){
  if(window.userID){
    init();
  }
}


$(test_login);
