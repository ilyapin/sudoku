export class Api{
	static handleFetchErrors(response) {
		if (!response.ok) 
			throw Error(response.statusText);
		return response;
	}
	static call(method, params, callbackOnSuccess = null, callbackOnError = null){
		if (!method)
			throw Error('fetchSudokusrv !method');
		let opt = null;
		let url = "https://print2flash.com/ilya/sudoku/srv/?method=" + method;
		if (params){
			let data = new FormData();
			for (const paramName in params)
				data.append(paramName, params[paramName]);
			opt = {
				method: "POST",
				body: data
			};
		}
		
		window.fetch(url, opt)
		.then(this.handleFetchErrors)
		.then((res) => { return res.json(); })
		.then((data)=> {
			if (data.result){
				if (typeof callbackOnSuccess === "function")
					callbackOnSuccess(data);
			} else 
				throw Error(data.error);
		})
		.catch((error) => {
			if (typeof callbackOnError === "function")
				callbackOnError(error);
			else
				console.log(error);				
		});
	}
}