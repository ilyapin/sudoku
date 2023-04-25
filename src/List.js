import {Board} from './Board.js';
import {Sudoku} from "./utils.js";
import Stack from 'react-bootstrap/Stack'

export function SudokuList({list, onItemClick, onDeleteClick}){ 
	const items = (list.items)?
		list.items.map((item)=><SudokuListItem key={item.id} item={item} onItemClick={onItemClick} onDeleteClick={onDeleteClick}/>):
		null;
	// console.log("SudokuList render");
	return  <Stack gap={1}>
				{(list.isLoading)? <span>Loading...</span> : null}
				{(list.error)? <span>Loading Error: { list.error }</span> : null}
				{(list.items)? items : null}
			</Stack>;
}

function SudokuListItem({item, onItemClick, onDeleteClick}){
	function handleClick(e){
		e.preventDefault();
		onItemClick(item);
	}
	function handleDelete(e){
		e.preventDefault();
		onDeleteClick(item);
	}
	// console.log("SudokuListItem render "+JSON.stringify(item));
	return (
		<div className="d-flex justify-content-center">
			<Stack gap={1}>
				<Board readonly={true} sudoku={new Sudoku(item.value, true)}></Board>
				<div>
					<a href={"/load/" + item.id} onClick={handleClick}>{item.name}</a>&nbsp;&bull;&nbsp;
					<a href={"/delete/" + item.id} onClick={handleDelete}>Delete</a>
				</div>
			</Stack>
		</div>
	);
}
