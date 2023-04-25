import { Sudoku } from "./utils";

export function Board({sudoku, readonly, lastindex, onCellClick, onCellUndoClick}){
	function renderCell(index, value, pvals, isLast){
		return (
			<Cell key={index} index={index} readonly={readonly} value={value} pvals={pvals} isLast={isLast} 
				onCellClick={onCellClick} onCellUndoClick={onCellUndoClick}>
			</Cell>
		);
	}

	let rows = [];
	for (let i=0; i<9; i++){
		let row = [];
		for (let j=0; j<9; j++){
			const index = i*9 + j;
			row.push(renderCell(index, 
								sudoku.getVal(i, j), 
								sudoku.getPVals(i, j), 
								lastindex===index));
		}
		rows.push(row);
	}
	let className = (readonly)? "readonly" : "board";
	return (
		<table className={className}><tbody>{rows.map((row, index)=>(<tr key={index}>{row}</tr>))}</tbody></table>
	);
}

function Cell({index, readonly, value, pvals, isLast, onCellClick, onCellUndoClick}){
	function handleCellClick(e, value){
		e.preventDefault();
		onCellClick(index, value);
	};
	function handleCellUndoClick(e){
		e.preventDefault();
		onCellUndoClick(index);
	};

	let content = "";
	if (value) {
		let digit = <strong className={isLast?"lastvalue":"value"}>{value}</strong>;
		if (readonly)
			content = digit;
		else
			content = <a href={"board/undo/" + index} onClick={(e)=>handleCellUndoClick(e)}>{digit}</a>;
	} else if (pvals && pvals.size) {
		content = [];
		for (const v of pvals) {
			content.push(<a href={"board/" + index + "/" + v} key={v} onClick={(e)=>handleCellClick(e, v)}>{v}</a>)
		}
	}

	return Sudoku.isGreySqr(index) ?	
			<td className="bgclg">{content}</td> : 
			<td>{content}</td>;
}
