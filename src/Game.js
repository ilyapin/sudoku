import {BoardState} from './Board.js';
import { HistoryState } from './History.js';

const emptyGameState = {
	id: 0,
	name: "",
	move: 0,
	modified: false,
	board: null, 
	last: -1,
	history: null
};

export function getDefaultGameState(){
	return {
		...emptyGameState,
		name : "Default",
		board : new BoardState()
	};
}

export function reducerGameState(game, action){
	switch (action.type) {
		case 'new':
			return getDefaultGameState();
		case 'load':
			return {
				...emptyGameState,
				id : action.gamedata.id,
				name : action.gamedata.name,
				board : new BoardState(action.gamedata.value),
				history : (action.gamedata.history) ? HistoryState.parse(action.gamedata.history) : null
			};
		case 'loadfromhistory':{
			return {
				...game,
				board: new BoardState(action.board),
				history: action.history
			};
		}
		case 'setvalue':{
			let newBoard = game.board.copy();
			newBoard.setValueByIndex(action.index, action.val);
			let newHistory = (game.history)? game.history.copy() : new HistoryState(game.board.toString());
			newHistory.add(action.index, action.val);
			return {
				...game,
				move: (game.move+1),
				last: action.index,
				modified: true,
				board: newBoard,
				history: newHistory
			};
		}
		default:
			throw new Error('reducerGameState unknown action:'+action.type);
	}
}