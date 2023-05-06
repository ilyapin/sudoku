import {Board, BoardStateReadonly} from './Board.js';
import Stack from 'react-bootstrap/Stack'

export class SudokuListState{
	items = null;
	isLoading = false;
	error = '';
	constructor(items = null, error=null, isLoading=false){
		if (items)
			this.items = items
		else if (error)
			this.error = error;
		else
			this.isLoading = isLoading;
	}
}

export function reducerSudokuListState(list, action) {
	switch (action.type) {
		case 'save': {
			// modify list
			// eslint-disable-next-line eqeqeq
			const idx = list.items.findIndex((i)=>i.id == action.row.id);
			if (idx >=0) // update
				return new SudokuListState(list.items.map((v,i) => ((idx===i) ? action.row : v) ));
			else // insert
				return new SudokuListState([action.row, ...list.items]);
		}
		case 'delete':
			// eslint-disable-next-line eqeqeq
			return new SudokuListState(list.items.filter((i) => i.id != action.id));
		case 'fetch':
			return new SudokuListState(action.rows);
		case 'loading':
			return new SudokuListState(null, null, true);
		case 'error':
			return new SudokuListState(null, action.error);
		default:
			throw new Error('reducerSudokuListState unknown action:'+action.type);
	}
}

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
				<Board readonly={true} board={new BoardStateReadonly(item.value)}></Board>
				<div>
					<a href={"/load/" + item.id} onClick={handleClick}>{item.name}</a>&nbsp;&bull;&nbsp;
					<a href={"/delete/" + item.id} onClick={handleDelete}>Delete</a>
				</div>
			</Stack>
		</div>
	);
}
