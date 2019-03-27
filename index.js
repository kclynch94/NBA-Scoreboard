'use strict';

const apiKey = "c51fc71da5msh3bb44d0a97fca28p155c3bjsn3b4520d0a98a"

const baseURL = `https://api-nba-v1.p.rapidapi.com`;

//Makes an API call to retrieve live game data and calls function to display it
function getLiveGames() {
  const url = `${baseURL}/games/live/`;

  const options = {
    headers: new Headers({
      "X-RapidAPI-Key": apiKey
    })
  };

  fetch(url, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayLiveGames(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

//Makes an API call to retrieve all games from the current season and calls function to display recent ones
function getRecentGames() {
  const url = `${baseURL}/games/seasonYear/2018`;

  const options = {
    headers: new Headers({
      "X-RapidAPI-Key": apiKey
    })
  };

  fetch(url, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayRecentGames(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

//Makes an API call to retrieve games relateed to a certain team that the user has input and calls function to display them
function getGamesByTeam(team) {
  const url = `${baseURL}/games/teamId/${team}/`;

  const options = {
    headers: new Headers({
      "X-RapidAPI-Key": apiKey
    })
  };

  fetch(url, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayTeamGames(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

//Makes an API call to retrieve all games from the current season and call function that displays game related to the date or date AND team the user has input
function getGamesByDate(date, teamName) {
  const url = `${baseURL}/games/seasonYear/2018`;

  const options = {
    headers: new Headers({
      "X-RapidAPI-Key": apiKey
    })
  };

  fetch(url, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => {
      displayGamesByDate(responseJson, date, teamName)
    })
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

//Makes an API call to retrive all teams in the league and calls function to add them to the dropdown selector
function getTeams() {
  const url = `${baseURL}/teams/league/vegas`;

  const options = {
    headers: new Headers({
      "X-RapidAPI-Key": apiKey
    })
  };

  fetch(url, options)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => createTeamOptions(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

//Displays live games. All time related logic is to avoid problems with the API
function displayLiveGames(responseJson) {
  $('#liveResults').empty();
  $('#liveResults').append('<h2>Live Games</h2><div class="games-container"></div>');
  if (responseJson.api.results > 0) {
    responseJson.api.games.forEach(function (game) {
      const newDate = new Date(game.startTimeUTC);
      const month = newDate.getMonth();
      const day = newDate.getDate();
      const year = newDate.getFullYear();
      const gameDate = new Date(`${year}-${month + 1}-${day}`);
      const today = new Date();
      const todayMonth = today.getMonth();
      const todayDay = today.getDate();
      const todayYear = today.getFullYear();
      const todayDate = new Date(`${todayYear}-${todayMonth + 1}-${todayDay}`);
      const isSameDate = gameDate.getTime() === todayDate.getTime();
      let anyGames = 0;
      if (isSameDate) {
        $('#liveResults div.games-container').append(
          createLiveGamesTemplate(
            String(game.currentPeriod.charAt(0)),
            game.clock,
            game.vTeam.nickName,
            game.vTeam.score.points,
            game.hTeam.nickName,
            game.hTeam.score.points,
            game.vTeam.logo,
            game.hTeam.logo
          )
        )

        anyGames++;
      }

      if (anyGames === 0) {
        $('#liveResults').append('<p class="message">There are currently no live games.</p>')
      }
    })
  } else {
    $('#liveResults').append('<p class="message">There are currently no live games.</p>')
  }

  $('#liveResults').removeClass("hidden");
}

//Displays all finished games from the last day that games were played
function displayRecentGames(responseJson) {
  $('#recentResults').empty();
  $('#recentResults').append('<h2>Recent Games</h2><div class="games-container"></div>');

  let finishedGames = [];
  responseJson.api.games.forEach(function (game) {
    if (game.statusGame === "Finished") {
      finishedGames.push(game);
    }
  })

  let recentGamesDate = String(new Date(finishedGames[finishedGames.length - 2].startTimeUTC)).substring(0, 10);
  finishedGames.forEach(function (game) {
    if (String(new Date(game.startTimeUTC)).substring(0, 10) == recentGamesDate) {
      let newDate = new Date(game.startTimeUTC);
      $('#recentResults div.games-container').append(
        createFinishedGameTemplate(
          String(newDate).substring(0, 3),
          String(newDate).substring(4, 10),
          game.vTeam.nickName,
          game.vTeam.score.points,
          game.hTeam.nickName,
          game.hTeam.score.points,
          game.vTeam.logo,
          game.hTeam.logo,
          game.gameId
        )
      )
      determineWinner(
        game.vTeam.score.points,
        game.hTeam.score.points,
        game.gameId
      )
    }
  })

  $('#recentResults').removeClass("hidden");
}

//Displays 3 most recent finished games and 3 upcoming games related to a team the user has input
function displayTeamGames(responseJson) {
  $('#recentResults').empty();
  $('#dateResults').empty();
  $('#liveResults').empty();
  $('#recentResults').append('<h2>Recent Games</h2><div class="games-container"></div>');
  $('#dateResults').append('<h2>Upcoming Games</h2><div class="games-container"></div>');

  let finishedGames = [];
  responseJson.api.games.forEach(function (game) {
    if (game.statusGame === "Finished") {
      finishedGames.push(game);
    }
  })

  let scheduledGames = [];
  responseJson.api.games.forEach(function (game) {
    if (game.statusGame === "Scheduled") {
      scheduledGames.push(game);
    }
  })

  for (let i = finishedGames.length - 3; i < finishedGames.length; i++) {
    let newDate = new Date(finishedGames[i].startTimeUTC);
    $('#recentResults div.games-container').append(
      createFinishedGameTemplate(
        String(newDate).substring(0, 3),
        String(newDate).substring(4, 10),
        finishedGames[i].vTeam.nickName,
        finishedGames[i].vTeam.score.points,
        finishedGames[i].hTeam.nickName,
        finishedGames[i].hTeam.score.points,
        finishedGames[i].vTeam.logo,
        finishedGames[i].hTeam.logo,
        finishedGames[i].gameId
      )
    )
    determineWinner(
      finishedGames[i].vTeam.score.points, finishedGames[i].hTeam.score.points,
      finishedGames[i].gameId
    )
  }

  for (let i = 0; i < 3; i++) {
    let newDate = new Date(scheduledGames[i].startTimeUTC);
    $('#dateResults div.games-container').append(
      createScheduledGameTemplate(
        String(newDate).substring(0, 10),
        String(newDate).substring(15, 21),
        scheduledGames[i].vTeam.nickName,
        scheduledGames[i].hTeam.nickName,
        scheduledGames[i].vTeam.logo,
        scheduledGames[i].hTeam.logo
      )
    )
  }
  $('#recentResults').removeClass("hidden");
  $('#dateResults').removeClass("hidden");
}

//Display games when user inputs only a date or a date AND team
function displayGamesByDate(responseJson, date, teamName) {
  $('#dateResults').empty();
  $('#recentResults').empty();
  $('#results').empty();
  $('#liveResults').addClass("hidden");
  $('#recentResults').append('<h2>Recent Games</h2><div class="games-container"></div>');
  $('#dateResults').append('<h2>Upcoming Games</h2><div class="games-container"></div>');
  let someGames = 0;

  for (let game of responseJson.api.games) {
    const newDate = new Date(game.startTimeUTC);
    const month = newDate.getMonth();
    const day = newDate.getDate();
    const year = newDate.getFullYear();
    const gameDate = new Date(`${year}-${month + 1}-${day}`);
    const isSameDate = gameDate.getTime() === date.getTime();

    if ((game.statusGame === "Scheduled" && game.hTeam.nickName === teamName && isSameDate) || (game.statusGame === "Scheduled" && game.vTeam.nickName === teamName && isSameDate)) {
      $('#dateResults div.games-container').append(
        createScheduledGameTemplate(
          String(newDate).substring(0, 10),
          String(newDate).substring(15, 21),
          game.vTeam.nickName,
          game.hTeam.nickName,
          game.vTeam.logo,
          game.hTeam.logo
        )
      )
      $('#dateResults ').removeClass("hidden");
      someGames++;
    } else if ((game.statusGame === "Finished" && game.hTeam.nickName === teamName && isSameDate) || (game.statusGame === "Finished" && game.vTeam.nickName === teamName && isSameDate)) {
      $('#recentResults div.games-container').append(
        createFinishedGameTemplate(
          String(newDate).substring(0, 3),
          String(newDate).substring(4, 10),
          game.vTeam.nickName,
          game.vTeam.score.points,
          game.hTeam.nickName,
          game.hTeam.score.points,
          game.vTeam.logo,
          game.hTeam.logo,
          game.gameId
        )
      )

      determineWinner(
        game.vTeam.score.points,
        game.hTeam.score.points,
        game.gameId
      )
      $('#recentResults').removeClass("hidden");
      someGames++;
      break;
    } else if (game.statusGame === "Scheduled" && teamName === "default" && isSameDate) {
      $('#dateResults div.games-container').append(
        createScheduledGameTemplate(
          String(newDate).substring(0, 10),
          String(newDate).substring(15, 21),
          game.vTeam.nickName,
          game.hTeam.nickName,
          game.vTeam.logo,
          game.hTeam.logo
        )
      )
      $('#dateResults').removeClass("hidden");
      someGames++;
    } else if (game.statusGame === "Finished" && teamName === "default" && isSameDate) {
      $('#recentResults div.games-container').append(
        createFinishedGameTemplate(
          String(newDate).substring(0, 3),
          String(newDate).substring(4, 10),
          game.vTeam.nickName,
          game.vTeam.score.points,
          game.hTeam.nickName,
          game.hTeam.score.points,
          game.vTeam.logo,
          game.hTeam.logo
        )
      )
      $('#recentResults').removeClass("hidden");
      someGames++;
    }
  }

  if (someGames === 0) {
    $('#message').append('<p>No games played. Try again</p>');
  }


}

//Adds all teams as options in the dropdown selector
function createTeamOptions(responseJson) {
  responseJson.api.teams.forEach(function (team) {
    $('.teamSelector').append(`<option value="${team.teamId}" data-nickname="${team.nickname}">${team.fullName}</option>`)
  })
}

//Creates teamplate for a finished game
function createFinishedGameTemplate(dateWeekDay, date, vTeamNickname, vTeamScore, hTeamNickname, hTeamScore, vTeamLogo, hTeamLogo, gameId) {
  return `<section class="game" id="${gameId}">
            <section class="box-score">
              <section class="teams">
                <p class="game-row vTeam">
                  ${getLogo(vTeamLogo, vTeamNickname)}
                  <span class="text-left team-name">${vTeamNickname}</span> 
                  <span class="text-right team-score">${vTeamScore}</span> 
                </p>
                <p class="game-row hTeam">
                  ${getLogo(hTeamLogo, hTeamNickname)}
                  <span class="text-left team-name">${hTeamNickname}</span> 
                  <span class="text-right team-score">${hTeamScore}</span>
                </p>
              </section>
              <section class="date">
                <p>${dateWeekDay}</p>
                <p>${date}</p>
              </section>
            </section>
          </section>`
}

//Determines who won and applies the appropriate class for styling purposes
function determineWinner(vTeamScore, hTeamScore, gameId) {
  if (+vTeamScore > +hTeamScore) {
    $(`#${gameId} .vTeam`).addClass("winner");
    $(`#${gameId} .hTeam`).addClass("loser");
  } else {
    $(`#${gameId} .vTeam`).addClass("loser");
    $(`#${gameId} .hTeam`).addClass("winner");
  }
}

//Retrieves the logo from local files in the event the API fails to provide one
function getLogo(imgURLString, teamNickname) {
  return `<img src="${imgURLString}" onerror="this.src='Images/Logo/${teamNickname.toLowerCase()}Logo.png'" alt="${teamNickname} logo" class="logo">`
}

//Creates teamplate for a live game
function createLiveGamesTemplate(period, clock, vTeamNickname, vTeamScore, hTeamNickname, hTeamScore, vTeamLogo, hTeamLogo) {
  return `<section class="game">
            <section class="box-score">
              <section class="teams">
                <p class="game-row vTeam">
                  ${getLogo(vTeamLogo, vTeamNickname)}
                  <span class="text-left team-name">${vTeamNickname}</span> 
                  <span class="text-right team-score">${vTeamScore}</span> 
                </p>
                <p class="game-row hTeam">
                  ${getLogo(hTeamLogo, hTeamNickname)}
                  <span class="text-left team-name">${hTeamNickname}</span> 
                  <span class="text-right team-score">${hTeamScore}</span>
                </p>
              </section>
              <section class="date">
                <p>Q ${period}</p>
                <p>${clock}</p>
              </section>
            </section>
        </section>`
}

//Creates teamplate for a scheduled game
function createScheduledGameTemplate(date, dateTime, vTeamNickname, hTeamNickname, vTeamLogo, hTeamLogo) {
  return `<section class="game">
            <section class="box-score">
              <section class="teams">
                <p class="game-row vTeam">
                  <img class="logo" src="${vTeamLogo}"></img>
                  <span class="text-left team-name">${vTeamNickname}</span> 
                </p>
                <p class="game-row hTeam">
                  <img class="logo" src="${hTeamLogo}"></img>
                  <span class="text-left team-name">${hTeamNickname}</span> 
                </p>
              </section>
              <section class="date">
                <p>${date}</p>
                <p>${dateTime}</p>
              </section>
            </section>
        </section>`
}

//Watches for submission from user and call the appropriate functions
function watchForm() {
  $('form').submit(event => {
    const team = $('#nbaTeam').val();
    const teamName = $('#nbaTeam').find(`option[value=${team}]`).data('nickname');
    const date = $('#date').val();
    event.preventDefault();
    if (!date.trim() && team === "default") {
      $('#js-error-message').html('Please enter a team, a date, or both');
    } else if (team != "default" && date === "") {
      getGamesByTeam(team);
      $('#js-error-message').empty();
    } else {
      const inputDate = new Date(date);
      const month = inputDate.getMonth();
      const day = date.split('-')[2];
      const year = inputDate.getFullYear();
      const trueInputDate = new Date(`${year}-${month + 1}-${day}`);
      getGamesByDate(trueInputDate, teamName);
      $('#js-error-message').empty();
    }
    $('#dateResults').addClass("hidden");
    $('#recentResults').addClass("hidden");
    $('#message').empty();
  })
}

//Runs all necessary functions on DOM ready
function runApp() {
  getTeams();
  getRecentGames();
  getLiveGames();
  watchForm();
}

$(runApp());

