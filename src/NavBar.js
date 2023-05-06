import {useState, useRef} from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export function MainNavBar({id, name, move, modified, onSave, onNew})
{
	const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);

	function handleSelect(selectedKey){
		if ("new" === selectedKey)
			onNew();
		else if ("save" === selectedKey){
			if (Boolean(id))
				onSave();		
			else
				setShowSaveAsDialog(true);
		} else if ("saveas" === selectedKey)
			setShowSaveAsDialog(true)			
		else 
			console.log(`handleSelect(${selectedKey})`);
	}

	function handleSave(opts){
		setShowSaveAsDialog(false);
		onSave(opts);
	}

	let asterisk = null;
	if (modified){
		asterisk = 	(
			<OverlayTrigger	placement="bottom" overlay={<Tooltip>Modified</Tooltip>}>
				<strong>*</strong>
			</OverlayTrigger>
		);
	}
	const title = <>{name}{asterisk} - Move #{move}</>;
	return (
		<>
			<Navbar bg="light">
				<Navbar.Text>{title}</Navbar.Text>
				<Navbar.Toggle aria-controls="basic-navbar-nav" />
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className="me-auto" onSelect={handleSelect}>
						<Nav.Link eventKey="new">New</Nav.Link>
						<Nav.Link eventKey="save" disabled={!Boolean(modified)}>Save</Nav.Link>
						<Nav.Link eventKey="saveas">Save as</Nav.Link>
					</Nav>
				</Navbar.Collapse>
			</Navbar>
			<SaveAsDialog show={showSaveAsDialog} defname={name} onSave={handleSave} onClose={()=>setShowSaveAsDialog(false)}/>
		</>
	);
}

function SaveAsDialog({defname, show, onSave, onClose}){
	const [nameValid, setNameValid] = useState("init");
	const nameRef = useRef(null);
	const saveHistoryRef = useRef(null);

	function handleSave(e){
		let saveHistory = saveHistoryRef.current.checked;
		let newname = nameRef.current.value;
		if (newname.length > 0){
			setNameValid("true");
			onSave({name:newname, saveHistory:saveHistory}); 
		} else{
			e.preventDefault();
			e.stopPropagation();
			setNameValid("false");
		}
	}

	return(
		<Modal show={show} onHide={onClose} animation={false}>
			<Modal.Header closeButton>
				<Modal.Title>Save as</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form.Group>
					<Form.Label>Name</Form.Label>
					<Form.Control type="text" defaultValue={defname} ref={nameRef} isInvalid={nameValid === "false"}/>
					<Form.Control.Feedback type="invalid">Please provide a valid name.</Form.Control.Feedback>
				</Form.Group>
				<br/>
				<Form.Group>
					<Form.Check type="switch" ref={saveHistoryRef} label="Save History"/>
				</Form.Group>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={onClose}>Close</Button>
				<Button variant="primary" onClick={handleSave}>Save</Button>
			</Modal.Footer>
		</Modal>	
	);
}
