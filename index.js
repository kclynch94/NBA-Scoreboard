'use strict';

const apiKey = "c51fc71da5msh3bb44d0a97fca28p155c3bjsn3b4520d0a98a"

const baseURL = `https://api-nba-v1.p.rapidapi.com`;


function getLiveGames(){
  const url = `${baseURL}/games/live/`;
  console.log(url);

  const options = {
    headers: new Headers({
      "X-RapidAPI-Key": apiKey})
  };

  fetch (url, options)
  .then (response => {
    if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
  })
  .then (responseJson => displayLiveGames(responseJson))
  .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function displayLiveGames(responseJson){
  $('#liveResults').empty();
  $('#liveResults').append('<h2>Live Games</h2>');
  if (responseJson.api.results>0){
    responseJson.api.games.forEach(function(game){
      $('#liveResults').append(`<section class="game"><p>Q${String(game.currentPeriod.charAt(0))} - ${game.clock}</p><p>${game.vTeam.nickName}   ${game.vTeam.score.points} - ${game.hTeam.score.points}  ${game.hTeam.nickName}</p></section>`)
    })
  } else {
    $('#liveResults').append('<p>There are currently no live games.</p>')
  }

  $('#liveResults').removeClass("hidden");
}

function getRecentGames(){
  const url = `${baseURL}/games/seasonYear/2018`;
  console.log(url);

  const options = {
    headers: new Headers({
      "X-RapidAPI-Key": apiKey})
  };

  fetch (url, options)
  .then (response => {
    if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
  })
  .then (responseJson => displayRecentGames(responseJson))
  .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function displayRecentGames(responseJson){
  $('#recentResults').empty();
  $('#recentResults').append('<h2>Recent Games</h2>');

  let finishedGames=[];
  responseJson.api.games.forEach(function(game) {
    if (game.statusGame=="Finished") {
      finishedGames.push(game);
    }
  })
  console.log(finishedGames);
 
  let recentGamesDate = String(new Date(finishedGames[finishedGames.length-2].startTimeUTC)).substring(0,10);
  console.log(recentGamesDate);
  for (let i=0; i<finishedGames.length-1; i++){
      console.log(String(new Date(finishedGames[i].startTimeUTC)).substring(0,10));
    if (String(new Date(finishedGames[i].startTimeUTC)).substring(0,10)==recentGamesDate) {
      let newDate = new Date(finishedGames[i].startTimeUTC);
      $('#recentResults').append(`<section class="game"><p>${String(newDate).substring(0,10)}</p><p>${finishedGames[i].vTeam.nickName}   ${finishedGames[i].vTeam.score.points} - ${finishedGames[i].hTeam.score.points}  ${finishedGames[i].hTeam.nickName}</p></section>`)
    }
  }

  $('#recentResults').removeClass("hidden");
}

function getGamesByTeam(team){
  const url = `${baseURL}/games/teamId/${team}/`;
  console.log(url);

  const options = {
    headers: new Headers({
      "X-RapidAPI-Key": apiKey})
  };

  fetch (url, options)
  .then (response => {
    if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
  })
  .then (responseJson => displayTeamGames(responseJson))
  .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function displayTeamGames(responseJson) {
  $('#recentResults').empty();
  $('#dateResults').empty();
  $('#liveResults').empty();
  $('#recentResults').append('<h2>Recent Games</h2>');
    $('#dateResults').append('<h2>Upcoming Games</h2>');

  let finishedGames=[];
  responseJson.api.games.forEach(function(game) {
    if (game.statusGame=="Finished") {
      finishedGames.push(game);
    }
  })

  let scheduledGames=[];
  responseJson.api.games.forEach(function(game) {
    if (game.statusGame=="Scheduled") {
      scheduledGames.push(game);
    }
  })
 
  for (let i=finishedGames.length-3; i<finishedGames.length; i++){
    let newDate = new Date(finishedGames[i].startTimeUTC);
    $('#recentResults').append(`<section class="game"><p>${String(newDate).substring(0,10)}</p><p>${finishedGames[i].vTeam.nickName}   ${finishedGames[i].vTeam.score.points} - ${finishedGames[i].hTeam.score.points}  ${finishedGames[i].hTeam.nickName}</p></section>`)
  }

  for (let i=0; i<3; i++){
    let newDate = new Date(scheduledGames[i].startTimeUTC);
    $('#dateResults').append(`<section class="game"><p>${String(newDate).substring(0,10)}</p><p>${String(newDate).substring(15,21)}</p><p>${scheduledGames[i].vTeam.nickName}   @   ${scheduledGames[i].hTeam.nickName}</p></section>`)
  }
  $('#recentResults').removeClass("hidden");
  $('#dateResults').removeClass("hidden");
}

function getGamesByDate(date, teamName){
  const url = `${baseURL}/games/seasonYear/2018`;
  console.log(url);

  const options = {
    headers: new Headers({
      "X-RapidAPI-Key": apiKey})
  };

  fetch (url, options)
  .then (response => {
    if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
  })
  .then (responseJson =>{
    displayGamesByDate(responseJson, date, teamName)})
  .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function displayGamesByDate(responseJson, date, teamName){
  console.log(date);
  console.log(teamName);
  $('#dateResults').empty();
  $('#recentResults').empty();
  $('#results').empty();
  $('#liveResults').addClass("hidden");
  $('#recentResults').append('<h2>Recent Games</h2>');
  $('#dateResults').append('<h2>Upcoming Games</h2>');
  let someGames=0;
 
  responseJson.api.games.forEach(function(game){
    const newDate = new Date(game.startTimeUTC);
    const month = newDate.getMonth();
    const day = newDate.getDate();
    const year = newDate.getFullYear();
    const gameDate = new Date(`${year}-${month+1}-${day}`);
    const isSameDate = gameDate.getTime() === date.getTime();
    
    if ((game.statusGame=="Scheduled" && game.hTeam.nickName==teamName && isSameDate)||(game.statusGame=="Scheduled" && game.vTeam.nickName==teamName && isSameDate)) {
      $('#dateResults').append(`<section class="game"><p>${String(newDate).substring(0,10)}</p><p>${String(newDate).substring(15,21)}</p><p>${game.vTeam.nickName} @ ${game.hTeam.nickName}</p></section>`)
      $('#dateResults').removeClass("hidden");
      someGames++;
    } else if ((game.statusGame=="Finished" && game.hTeam.nickName==teamName && isSameDate)||(game.statusGame=="Finished" && game.vTeam.nickName==teamName && isSameDate)){
      $('#recentResults').append(`<section class="game"><p>${String(newDate).substring(0,10)}</p><p>${game.vTeam.nickName}   ${game.vTeam.score.points} - ${game.hTeam.score.points}  ${game.hTeam.nickName}</p></section>`)
      $('#recentResults').removeClass("hidden");
      someGames++;
    } else if (game.statusGame=="Scheduled" && teamName=="default" && isSameDate) {
      $('#dateResults').append(`<section class="game"><p>${String(newDate).substring(0,10)}</p><p>${String(newDate).substring(15,21)}</p><p>${game.hTeam.nickName} @ ${game.vTeam.nickName}</p></section>`)
      $('#dateResults').removeClass("hidden");
      someGames++;
    } else if (game.statusGame=="Finished" && teamName=="default" && isSameDate){
      $('#recentResults').append(`<section class="game"><p>${String(newDate).substring(0,10)}</p><p>${game.vTeam.nickName}   ${game.vTeam.score.points} - ${game.hTeam.score.points}  ${game.hTeam.nickName}</p></section>`)
      $('#recentResults').removeClass("hidden");
      someGames++;
    } 
  }) 

  if (someGames===0) {
      $('#message').append('<p>No games played. Try again</p>');
  }
  
  
}

function getTeams() {
  const url = `${baseURL}/teams/league/vegas`;
  console.log(url);

  const options = {
    headers: new Headers({
      "X-RapidAPI-Key": apiKey})
  };

  fetch (url, options)
  .then (response => {
    if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
  })
  .then (responseJson => createTeamOptions(responseJson))
  .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function createTeamOptions(responseJson) {
  responseJson.api.teams.forEach(function(team) {
    $('.teams').append(`<option value="${team.teamId}" data-nickname="${team.nickname}">${team.fullName}</option>`)
  })
}

function watchForm() {
  $('form').submit(event => {
    const team = $('#nbaTeam').val();
    const teamName = $('#nbaTeam').find(`option[value=${team}]`).data('nickname');
    const date = $('#date').val();
    event.preventDefault();
    if (!date.trim() && team=="default"){
      $('#js-error-message').html('Please enter a team, a date, or both');
    } else if (team!="default" && date==""){
      getGamesByTeam(team);
      $('#js-error-message').empty();
    } else {
      const inputDate = new Date(date);
      const month = inputDate.getMonth();
      const day = date.split('-')[2];
      const year = inputDate.getFullYear();
      const trueInputDate = new Date(`${year}-${month+1}-${day}`);
      getGamesByDate(trueInputDate, teamName);
      $('#js-error-message').empty();
    }
    $('#dateResults').addClass("hidden");
    $('#recentResults').addClass("hidden");
  })
}

$(getTeams());
$(getRecentGames());
$(getLiveGames());
$(watchForm());
