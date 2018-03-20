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
import {Socket} from "phoenix";

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

// import socket from "./socket"
function init() {
  let socket = new Socket("/socket", {params: {token: window.userToken, id:window.userID}});
  socket.connect();
  let channel = socket.channel("global", {id:window.userID});
  channel.join()
       .receive("ok", resp => { console.log("Joined Global successfully", resp) })
       .receive("error", resp => { console.log("Unable to join", resp) });
  console.log("Join it", channel);

  channel.push('current_games')
  .receive('ok', (payload) => {
    console.log(payload);
    });



  let root = document.getElementById('root');
  if(root){
    run_checker(root);
  }
}

$(init);
