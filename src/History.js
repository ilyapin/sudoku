import { Container, Stack } from "react-bootstrap";
import { Board, BoardStateReadonly } from "./Board";

export class HistoryState{
	start = '';
	items = [];
	constructor(start=''){
		this.start = start;
	}
	add(index, val){
		this.items.push({i: index, v: val});
	}
	serialize(){
		let result = this.start + "->";
		let comma = "";
		for (let item of this.items){
			const row = (item.i / 9) | 0;
			const col = (item.i % 9) | 0;
			result += comma + row + col + item.v;
			comma = ",";
		}
		return result;
	}
	copy(){
		let result = new HistoryState(this.start);
		result.items = this.items.map(a => Object.assign({}, a));
		return result;
	}
	static parse(historyStr){
		let result = null;
		let items = historyStr.split('->');
		if (items.length === 2){
			result = new HistoryState(items[0]);
			items = items[1].split(',');
			for (let item of items){
				if (item.length === 3){
					let row = parseInt(item[0]);
					let col = parseInt(item[1]);
					let v = parseInt(item[2]);
					result.add(9*row+col, v);
				} else 
					console.log("History parse error (2)");
			}
		} else 
			console.log("History parse error (1)");
		return result;
	}
	historyFromID(arrayIndex){
		let board = new BoardStateReadonly(this.start);
		let newHistory = new HistoryState(this.start);
		for (let i=0; i<this.items.length; i++){
			const item = this.items[i];
			newHistory.add(item.i, item.v);
			board.setValueByIndex(item.i, item.v);
			if (i >= arrayIndex)
				break;
		}
		return {history:newHistory, board: board};
	}
}

export function History({historyState, onItemClick}){
	function HandleItemClick(arrayIndex){
		if (historyState)
			onItemClick(historyState.historyFromID(arrayIndex));
	}

	let items = [];
	if (historyState){
		let board = new BoardStateReadonly(historyState.start);
		for (let i=0; i<historyState.items.length; i++){
			const item = historyState.items[i];
			let newBoard = board.copy();
			newBoard.setValueByIndex(item.i, item.v);
			board = newBoard;
			items.push(<HistoryItem key={i} board={board} index={item.i} value={item.v} arrayIndex={i} onItemClick={HandleItemClick}/>);
		}
	}
	return <Container className="historyContainer">{items}</Container>;
}

function HistoryItem({board, index, value, arrayIndex, onItemClick}){
	function handleClick(e){
		e.preventDefault();
		onItemClick(arrayIndex);
	}

	const row = (index / 9) | 0;
	const col = (index % 9) | 0;
	const label = `${row+1}x${col+1} = ${value}`;
	return(
		<Stack className="historyItem" gap="1">
			<Board board={board} readonly={true} lastindex={index}/>
			<div className="historyItemLabel"><a href={"/load/" + index} onClick={(e)=>handleClick(e)}>{label}</a></div>
		</Stack>
	);
}