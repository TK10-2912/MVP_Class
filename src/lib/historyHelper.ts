export default class HistoryHelper{
	static history:any=undefined;
	static unlisten:any =null
	static changeHistory(_history:any){
		this.history=_history;
	}
	static listenerHistoryChange(doSomething:(localtion,done)=>void){
		if(this.history=== undefined || this.history===null){
			console.log("Please init again history");
			return;
		}
		this.unlisten=this.history.listen(doSomething);
	}
	static unlistener(){
		if(this.unlisten=== undefined || this.unlisten===null){
			return;
		}
		this.unlisten();
	}
	static redirect(url:string){
		if(this.history=== undefined || this.history===null){
			console.log("Please init again history");
			return;
		}
		if(url===undefined || url===""){
			return
		}
		this.unlistener();
		this.history.push(url);
		
	}
	static back(){
		window.history.back();
		/*
		if(this.history=== undefined || this.history===null){
			console.log("Please init again history");
			return;
		}
		this.history.back(url);
		*/
	}
}