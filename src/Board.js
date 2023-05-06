class SudokuIdx{
	constructor() {
		this.idxByRow = Array(9);
		for (let i=0; i<9; i++){
			let a = [];
			// by row
			for(let k=0; k<9; k++){
				a.push(i*9 + k);
			}
			// result
			this.idxByRow[i] = a;
		}
		this.idxByCol = Array(9);
		for (let i=0; i<9; i++){
			let a = [];
			// by col
			for(let k=0; k<9; k++){
				a.push(k*9 + i);
			}
			// result
			this.idxByCol[i] = a;
		}

		this.idxBySqr = Array(9);
		for (let i=0; i<9*9; i++){
			let sqr = this.getSqrByIndex(i);
			let a = this.idxBySqr[sqr];
			if (!a)
				a = [];
			a.push(i);
			this.idxBySqr[sqr] = a;
		}

		// for (let i=0;i<9;i++) // row
		// 	console.log(this.idxByRow[i].toString());		
		// console.log("-- by cols - ");
		// for (let i=0;i<9;i++) // col
		// 	console.log(this.idxByCol[i].toString());
		// console.log("-- by sqr - ");
		// for (let i=0;i<9;i++) // sqr
		// 	console.log(this.idxBySqr[i].toString());		
	}
	getSqrByIndex(index){
		return this.getSqr((index/9) |0, (index % 9) |0);
	}
	getSqr(row, col){
		return ((col / 3) |0) + ((row / 3) |0) * 3;
	}
}

const sudokuIdxSinglton = new SudokuIdx();

export class BoardStateReadonly{
	vals = null;
	constructor(param){
		if (param instanceof BoardStateReadonly)
			this.vals = [...param.vals];
		else{
			let str = param
			let len = 9*9;
			this.vals = Array(len).fill(0);
			if (str){
				let i = 0;
				for (const char of str){
					let v = parseInt(char, 10);
					this.vals[i++] = v;
					if (i >= len)
						break;
				}
			}
		}
	}
	copy(){
		let result = new BoardStateReadonly();
		result.vals = [...this.vals];
		return result;
	}
	toString(cols=0){
		let result = "";
		let iCols = 0;
		let iTriple = 0;
		for (let i=0; i < this.vals.length; i++){
			result += this.vals[i].toString();
			if (cols){
				iCols++;
				iTriple++;
				if (iCols >= cols){
					result += "\n";
					iCols = 0;
					iTriple = 0;
				} 
				if (iTriple >= 3){
					result += ".";
					iTriple = 0;
				}
			}
		}
		return result.trim();
	}
	getVal(row, col) {	
		return this.vals[row*9 + col];	
	}
	setValueByIndex(index, v){
		this.vals[index] = v;
	}
	static isGreySqr(index){
		const x = (index / 9) | 0;
		const y = (index % 9) | 0;
		const greySqrs = [[0,3],[3,0],[3,6],[6,3]];
		for(let i=0; i<greySqrs.length; i++){
			const sqr = greySqrs[i];
			if (x>=sqr[0] && x<(sqr[0]+3) && y>=sqr[1] && y<(sqr[1]+3))
				return true;
		}
		return false;
	}
}

export class BoardState extends BoardStateReadonly{
	pvals = null;
	constructor(param, readonly=false){
		super(param);
		if (!readonly){
			const len = 9*9;
			this.pvals = Array(len);
			this.modifyAllDependentCells();
		}
	}
	copy(){
		let result = new BoardState();
		result.vals = [...this.vals];
		result.pvals = this.pvals.map((pval)=> (pval)? new Set(pval) : null);
		return result;
	}
	getPValsByIndex(index){
		if (!this.pvals)
			return null;
		return this.pvals[index];
	}
	getPVals(row, col) {
		if (!this.pvals)
			return null;
		let index = row*9+col;
		return this.getPValsByIndex(index);
	}
	delPVal(dCellIdx, v){
		if (this.pvals[dCellIdx])
			this.pvals[dCellIdx].delete(v);
	}
	modifyDependentCells(index, v){
		let row = (index / 9)|0;
		let col = (index % 9)|0;
		let sqr = sudokuIdxSinglton.getSqr(row, col);
		for (const dCellIdx of sudokuIdxSinglton.idxBySqr[sqr])
			this.delPVal(dCellIdx, v);
		for (const dCellIdx of sudokuIdxSinglton.idxByRow[row])
			this.delPVal(dCellIdx, v);
		for (const dCellIdx of sudokuIdxSinglton.idxByCol[col])
			this.delPVal(dCellIdx, v);
	}
	modifyAllDependentCells(){
		let len = 9*9;
		for (let i=0; i<len; i++)
			this.pvals[i] = (this.vals[i] > 0) ? null : new Set([1,2,3,4,5,6,7,8,9]);
		for (let i=0; i<len; i++)
			if (this.vals[i] > 0)
				this.modifyDependentCells(i, this.vals[i]);
	}
	setValueByIndex(index, v){
		if(this.vals[index] === v)
			return;
		if (this.vals[index] > 0) {
			this.vals[index] = v;
			this.modifyAllDependentCells();
		} else {
			this.vals[index] = v;
			this.modifyDependentCells(index, v);
		}
	}
	setValue(row, col, v){
		let index = row*9+col;
		this.setValueByIndex(index,v);
	}
	static isGreySqr(index){
		const x = index / 9;
		const y = index % 9;
		const greySqrs = [[0,3],[3,0],[3,6],[6,3]];
		for(let i=0; i<greySqrs.length; i++){
			const sqr = greySqrs[i];
			if (x>=sqr[0] && x<(sqr[0]+3) && y>=sqr[1] && y<(sqr[1]+3))
				return true;
		}
		return false;
	}
}

export function Board({board, readonly, lastindex, onCellClick}){
	function renderCell(index, value, pvals, isLast){
		return (
			<Cell key={index} 
				index={index} readonly={readonly} value={value} pvals={pvals} isLast={isLast} 
				onCellClick={onCellClick}>
			</Cell>
		);
	}

	let rows = [];
	for (let i=0; i<9; i++){
		let row = [];
		for (let j=0; j<9; j++){
			const index = i*9 + j;
			row.push(renderCell(index, board.getVal(i, j), (readonly)? null : board.getPVals(i, j), lastindex===index));
		}
		rows.push(row);
	}
	let className = (readonly)? "readonly" : "board";
	return (
		<table className={className}><tbody>{rows.map((row, index)=>(<tr key={index}>{row}</tr>))}</tbody></table>
	);
}

function Cell({index, readonly, value, pvals, isLast, onCellClick}){
	function handleCellClick(e, value){
		e.preventDefault();
		onCellClick(index, value);
	};

	let content = "";
	if (value) {
		let digit = <strong>{value}</strong>;
		if (readonly)
			content = digit;
		else
			content = <a href={"board/undo/" + index} className={isLast?"lastvalue":"value"} onClick={(e)=>handleCellClick(e, 0)}>{digit}</a>;
	} else if (pvals && pvals.size) {
		content = [];
		for (const v of pvals) {
			content.push(<a href={"board/" + index + "/" + v} className={isLast?"lastvalue":"value"} key={v} onClick={(e)=>handleCellClick(e, v)}>{v}</a>)
		}
	}
	const className = BoardStateReadonly.isGreySqr(index) ?	"bgclg" : "";
	return (content) ? <td className={className}>{content}</td> : <td className={className}>&nbsp;</td>;
}