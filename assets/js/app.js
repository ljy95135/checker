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
import $ from "jquery";

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
  // console.log("Join it", channel);

  if (document.getElementById('create-room-page')) {
    $('#create-room-button').click(() => {
      let xx = $('#room-input').val();
      // new_game
      if (xx) {
        let params = {
          game_name: xx
        };
        console.log(params);
        channel.push('new_game', params)
          .receive('ok', (payload) => {
            // console.log("successful new game", payload);
            // need to ask glabal make a broadcast
            channel.push("broadcast_current_games", {});
            window.location = "/game/" + xx;
          })
          .receive('error', (info) => {
            console.log("error new game", info);
          })
        // window.location = "/game/" + xx;
      }
    });
  }

  // checker board part
  let root = document.getElementById('root');
  if (root) {
    // we are at /game/game_id
    // and we should build the game channel.
    let game_channel = socket.channel("game:" + window.gameID, {});
    game_channel.join()
      .receive("ok", resp => {
        console.log("Joined Game successfully", resp)
      })
      .receive("error", resp => {
        console.log("Unable to join game", resp)
      });

    game_channel.push('game:get_data', {})
      .receive('ok', (payload) => {
        // use the infomation about the game_channel
        // do the giveup button for users
        // Button should be implemented
        // every user will channel.on that information.
        console.log("From app.js: See the game state", payload);
        // let user_id = window.userID;
        let game_state = payload.game_state;

        run_checker(root, game_state, game_channel);
        // run_checker(root, game_state);

        // Update user info function &&n resign button
        update_user_info(game_state, channel);

      })
      .receive('error', (info) => {
        console.log("Error to see game data", info);
      });

    // console.log("on", msg)
    game_channel.on("update_user_info", msg => {
      update_user_info(msg.game, channel);
    });
    game_channel.on("game_result", (msg) => {
      end_game(msg.loser);
    });
    game_channel.on("someone_win", (msg) => {
      game_over_winner(msg.winner);
    });
  }

  // current_games
  if (document.getElementById('current_room_list')) {
    channel.push('current_games')
      .receive('ok', (payload) => {
        console.log("get current_games", payload);
        let current_rooms = payload.games;
        // put list render after receive.
        let rooms_root = document.getElementById('current_room_list');
        if (rooms_root) {
          channel.on("update_current_rooms", (msg) => {
            run_room_list(rooms_root, msg.games, socket);
          })
          run_room_list(rooms_root, current_rooms, socket);
        }
      })
      .receive('error', (info) => {
        console.log("error current_games", info);
      });
  }
}

// Based on who you are, make change after a game is over
function end_game(loser) {
  let user_id = window.userID;
  if (user_id == loser) {
    // You lose
    alert("You lose the game.")
  } else {
    // winner and viewer
    alert("user " + loser + " losed in the game. It's a nice game!");
    window.location = "/rooms";
  }
}

function game_over_winner(winner) {
  let user_id = window.userID;
  if (user_id == winner) {
    // You lose
    alert("You win!")
    window.location = "/rooms";
  } else {
    // winner and viewer
    alert("Game is over, nice game!");
    window.location = "/rooms";
  }
}

// user info and resign_button
function update_user_info(game_state, global_channel) {
  // console.log("see state to update user info", game_state);
  let user_id = window.userID; // it is number (bad idea but I am lazy to change.)
  if (user_id == game_state.red) {
    // User is red
    $("#resign_btn").click({
      global_channel: global_channel,
      game_id: game_state.id
    }, resign);
    let black = game_state.black;
    if (black) {
      $("#board_info").text(
        "You are the red player. Your opponent's user id is " + black);
    } else {
      $("#board_info").text(
        "You are the red player. Please wait for your opponent.");
    }
  } else if (user_id == game_state.black) {
    // User is black
    $("#resign_btn").click({
      global_channel: global_channel,
      game_id: game_state.id
    }, resign);
    let red = game_state.red;
    if (red) {
      $("#board_info").text(
        "You are the black player. Your opponent's user id is " + red);
    } else {
      $("#board_info").text(
        "You are the black player. Please wait for your opponent.");
    }
    // user_id+"" in game_state.viewers wrong! use in for dict
  } else if (game_state.viewers.indexOf(user_id + "") != -1) {
    // User is viewer
    let red = game_state.red;
    let black = game_state.black;
    if (red && black) {
      $("#board_info").text("You are a viewer, red player's user id is " + red +
        " and black player's user id is " + black + ". Enjoy!");
    } else {
      $("#board_info").text("Please wait until two players join.");
    }
    // remove resign button
    // console.log("Going to remove button!")
    $("#resign_btn").remove();
  } else {
    // console.log(red);
    alert("Please join the room at first!");
  }
}

// resign button
// global_channel to kill the Genserver by game_id and user
function resign(ev) {
  let user_id = window.userID;
  let channel = ev.data.global_channel;
  // only the player has button.
  channel.push("resign", {
      user_id: user_id,
      game_id: ev.data.game_id
    })
    .receive('ok', (msg) => {
      // nothing need to do in fact.
      window.location = "/rooms";
      // alert("You resigned and the game ended. Nice game!");
    })
}

function test_login() {
  if (window.userID) {
    init();
  }
}


$(test_login);
