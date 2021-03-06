// @flow
import callApi from '../utils/apiCaller';
import type { Dispatch } from './types';
import type { Game } from '../utils/globalTypes';

export function addGame(game: Game) {
  return {
    type: 'ADD_GAME',
    game,
  };
}

export function addGameRequest(game: Game) {
  return (dispatch: Dispatch) =>
  callApi('games', 'post', {
    game: {
      name: game.name,
      description: game.description,
      img: game.img,
      backgroundImg: game.backgroundImg,
      availableOn: game.availableOn,
      videoLinks: game.videoLinks,
      galleryLinks: game.galleryLinks,
      developer: game.developer,
      winBuildURL: game.winBuildURL,
      macBuildURL: game.macBuildURL,
      macFilename: game.macFilename,
      winFilename: game.winFilename,
      winExe: game.winExe,
      isPrivate: game.isPrivate,
      allowedPlayers: [game.developer]
    }
  }).then(res => dispatch(addGame(res.game)));
}

export function addGames(games: Array<Game>) {
  console.log('dispatching addGames');
  return {
    type: 'ADD_GAMES',
    games,
  };
}

function requestGames() {
  return {
    type: 'REQUEST_GAMES'
  };
}

function receiveGames(games: Array<Game>) {
  return {
    type: 'RECEIVE_GAMES',
    games
  };
}

function fetchGames() {
  return dispatch => {
    dispatch(requestGames());
    return callApi('games').then(res =>
      dispatch(receiveGames(res))
    );
  };
}

function shouldFetchGames(state) {
  const games = state.game.items;
  if (games.length === 0) {
    return true;
  } else if (games.isFetching) {
    return false;
  }
}

export function fetchGamesIfNeeded() {
  return (dispatch: Dispatch, getState: Function) => {
    if (shouldFetchGames(getState())) {
      return dispatch(fetchGames());
    }
  };
}

function fetchGame(id) {
  return (dispatch) => {
    dispatch(requestGames());
    return callApi(`games/${id}`).then(res => dispatch(addGame(res)));
  };
}

function shouldFetchGame(state, id) {
  state.game.items.forEach((game) => {
    if (game._id === id) {
      return false;
    }
  });
  return true;
}

export function fetchGameIfNeeded(id: string) {
  return (dispatch: Dispatch, getState: Function) => {
    if (shouldFetchGame(getState(), id)) {
      return dispatch(fetchGame(id));
    }
  };
}

export function fetchEditGameIfNeeded(id: string) {
  return (dispatch: Dispatch, getState: Function) => {
    if (shouldFetchEditGame(getState(), id)) {
      return dispatch(fetchEditGame(id));
    }
  };
}

function shouldFetchEditGame(state, id) {
  if (state.game.editGame) {
    return state.game.editGame._id === id;
  }
  return true;
}

function fetchEditGame(id) {
  return dispatch => {
    dispatch(requestGames());
    return callApi(`games/${id}`).then(res => dispatch(addEditGame(res)));
  };
}

function addEditGame(game) {
  return {
    type: 'ADD_EDIT_GAME',
    game
  };
}

export function editGameRequest(game: Game, id: string) {
  return () =>
    callApi(`games/${id}`, 'put', { game });
}


export function allowPlayer(index: number, user: string) {
  return {
    type: 'ALLOW_PLAYER',
    index,
    user
  };
}

export function markFeedbackRequest(
  feedbackId: string,
  mark: number,
  childIndex: number,
  parentIndex: number
) {
  return (dispatch: Dispatch) =>
    callApi('feedbacks/mark', 'post', {
      feedbackId,
      mark
    }).then(() => dispatch(markFeedback(childIndex, parentIndex, mark)));
}

function markFeedback(childIndex, parentIndex, mark) {
  return {
    type: 'MARK_FEEDBACK',
    childIndex,
    parentIndex,
    mark
  };
}
