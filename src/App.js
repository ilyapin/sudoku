import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {useState, useEffect} from 'react';
import {SudokuListHelper, SudokuFetchHelper, Sudoku} from "./utils.js";
import {SudokuList} from './List.js';
import {Board} from './Board.js';
import {MainNavBar} from './NavBar.js';

function App(){
	const [id, setId] = useState(0);
	const [name, setName] = useState("Default");
	const [move, setMove] = useState(0);
	const [modified, setModified] = useState(false);
	const [sudoku, setSudoku] = useState(new Sudoku());
	const [last, setLast] = useState(-1);

	const [sudokuList, setSudokuList] = useState(new SudokuListHelper(null, null, true));

	function newGame(){
		setId(0);
		setName("Default");
		setMove(0);
		setModified(false);
		setSudoku(new Sudoku());
		setLast(-1);
	}
	function loadGame(gamedata){
		setId(gamedata.id);
		setName(gamedata.name);
		setMove(0);//??
		setModified(false);
		setSudoku(new Sudoku(gamedata.value));
		setLast(-1);
	}
	function confirmIfModified(){
		return !modified || window.confirm("This will reset your progress. Continue?");
	}

	function handleNew() {
		if (confirmIfModified())
			newGame();
	}
	function handleSave(opts){
		let params = {
			"name": name,
			"value": sudoku.toString()
		};
		if (opts){
			params.name = opts.name
			//?? todo 'history'
		} else if (id)
			params.id = id;

		SudokuFetchHelper.fetchSudokusrv('save', params, (data)=>{
			// modify list
			// eslint-disable-next-line eqeqeq
			if (data.id == id) { // update
				// eslint-disable-next-line eqeqeq
				const idx = sudokuList.items.findIndex((i)=>i.id == data.id);
				if (idx >=0)
					sudokuList.items[idx] = data.row;
			} else // insert
				sudokuList.items.unshift(data.row);
			setSudokuList(sudokuList);
			// modify game
			loadGame(data.row);
		});
	}
	function handleListDelete(listitem){
		if (window.confirm("Delete permanently?")){
			SudokuFetchHelper.fetchSudokusrv('delete', {id:listitem.id}, 
				(data) => {
					// eslint-disable-next-line eqeqeq
					setSudokuList(new SudokuListHelper(sudokuList.items.filter((i) => i.id != listitem.id)));
				}
			);
		}
	}
	function handleListClick(listitem){
		if (confirmIfModified())
			loadGame(listitem);
	}
	function handleCellClick(index, val){
		sudoku.setValueByIndex(index, val);
		setSudoku(sudoku);
		setMove(move+1);
		setLast(index);
		setModified(true);
	};
	function handleCellUndoClick(index){
		sudoku.setValueByIndex(index, 0);
		setSudoku(sudoku);
		setModified(true);
		setMove(move+1);
	}

	useEffect(() => {
		SudokuFetchHelper.fetchSudokusrv("fetch", null, 
			(data) => setSudokuList(new SudokuListHelper(data.rows, null)),
			(error)=> setSudokuList(new SudokuListHelper(null, error))
		);
	}, []);
	

	return (
		<>
			<MainNavBar id={id} name={name} move={move} modified={modified} onNew={handleNew} onSave={handleSave}/>		
			<Container fluid={true}>
				<Row>
					<Col sm={8}>
						<Board sudoku={sudoku} readonly={false} lastindex={last} onCellClick={handleCellClick} onCellUndoClick={handleCellUndoClick} />
						Log
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
