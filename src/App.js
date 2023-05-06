import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Stack from 'react-bootstrap/Stack'

import {useEffect, useReducer} from 'react';

import {Api} from "./Api.js";
import {SudokuList, reducerSudokuListState, SudokuListState} from './List.js';
import {Board} from './Board.js';
import {MainNavBar} from './NavBar.js';
import {reducerGameState, getDefaultGameState } from './Game.js';
import {History} from './History.js';

function App(){
	const [sudokuList, dispatchSudokuList] = useReducer(reducerSudokuListState, new SudokuListState(null, null, true));
	const [gameState, dispatchGame] = useReducer(reducerGameState, getDefaultGameState());

	function confirmIfModified(){
		return !gameState.modified || window.confirm("This will reset your progress. Continue?");
	}

	function handleNew() {
		if (confirmIfModified())
			dispatchGame({type: 'new'});
	}
	function handleSave(opts){
		let params = {
			"name": gameState.name,
			"value": gameState.board.toString()
		};
		if (opts){
			params.name = opts.name;
			params.history = (opts.saveHistory) ? (gameState.history)?gameState.history.serialize() : null : null;
		} else if (gameState.id){
			params.id = gameState.id;
			params.history = (gameState.history)?gameState.history.serialize():null;
		}

		Api.call('save', params, (data)=>{
			dispatchSudokuList({type:"save", row:data.row});
			// modify game
			dispatchGame({type:'load', gamedata: data.row});
		});
	}
	function handleListDelete(listitem){
		if (window.confirm("Delete permanently?")){
			Api.call('delete', {id:listitem.id}, 
				(data) => dispatchSudokuList({type:'delete', id:listitem.id}) 
			);
		}
	}
	function handleListClick(listitem){
		if (confirmIfModified())
			dispatchGame({type:'load', gamedata: listitem});
	}
	function handleCellClick(index, val){
		dispatchGame({type:'setvalue', index: index, val:val});
	};
	function handleHistoryClick({history, board}){
		if (confirmIfModified())
			dispatchGame({type:'loadfromhistory', history: history, board: board });
	}

	useEffect(() => {
		dispatchSudokuList({type:'loading'});
		Api.call("fetch", null, 
			(data) => dispatchSudokuList({type:'fetch', rows: data.rows}),
			(error)=> dispatchSudokuList({type:'error', error: error})
		);
	}, []);
	

	return (
		<>
			<MainNavBar id={gameState.id} name={gameState.name} move={gameState.move} modified={gameState.modified} onNew={handleNew} onSave={handleSave}/>		
			<Container fluid={true}>
				<Row>
					<Col sm={8}>
						<Stack gap="1">
							<Board board={gameState.board} readonly={false} lastindex={gameState.last} onCellClick={handleCellClick}/>
							<History historyState={gameState.history} onItemClick={handleHistoryClick}/>
						</Stack>
					</Col>
					<Col sm={"auto"}>
						<SudokuList list={sudokuList} onDeleteClick={handleListDelete} onItemClick={handleListClick}/>
					</Col>
				</Row>
			</Container>
		</>
	);
}

export default App;
