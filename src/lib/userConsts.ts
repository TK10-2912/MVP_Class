import { UserDto} from '@services/services_autogen';
	
export default class UserConsts{
	//static userCurLogin:UserLoginDto=new UserLoginDto();

	static userDic:{[id: number] :UserDto;}={};
	
	// static async addUserLoginIntoDic(user:UserLoginDto){
		
	// 	if(user!==undefined && user.id!==undefined){
	// 		let us=new UserForGuestDto()
	// 		us.init(user);
	// 		await this.initUser.addUserIntoDic(us);
	// 	}
	// 	this.userCurLogin.init(user);
	// }
	
	static checkUserExist(id:number){
		if((this.userDic[id]!= undefined) || (this.userDic[id] != null)){
			return true;
		}
		return false;
	}
	static addUserIntoDic(user:UserDto){
		if(user!==undefined && user.id!==undefined){
			
			if(this.checkUserExist(user.id)){
				return;
			}
			
			this.userDic[user.id]= user;
		}
	}
	
	static getUserFullName(id:number){
		
		if(this.userDic[id]!==undefined && this.userDic[id].fullName!==undefined){
			return this.userDic[id].fullName!;
		}
		return "";
		
	}
}