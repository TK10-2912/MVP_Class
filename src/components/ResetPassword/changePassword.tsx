import * as React from 'react';

import { Input, Button, message} from 'antd';
import { L } from 'src/lib/abpUtility';
import {stores} from 'src/stores/storeInitializer';
import {
	ChangePasswordDto
} from 'src/services/services_autogen';

export interface IChangePasswordProps {
	onSuccessChangePass?:()=>void;
	
}
export interface IChangePasswordState {
	oldPassword:string,
	password1:string;
	password2:string;
}
export default class ChangePassword extends React.Component<IChangePasswordProps,IChangePasswordState> {
	state = {
		oldPassword:"",
		password1:"",
		password2:"",
	};
	
	handleChange=(e:any)=>{
		this.setState({
			oldPassword: e.target.value,
		});
	}

	setPassword1=(e:any)=>{
		this.setState({
			password1: e.target.value,
		});
	}
	setPassword2=(e:any)=>{
		this.setState({
			password2: e.target.value,
		});
	}
	
	onSubmit= async()=>{
		const {oldPassword,password1, password2} = this.state;
		if(oldPassword===undefined || oldPassword.length===0){
			message.error("ReEnterOldPassword!");
			return;
		}
		if(password1===undefined || password1.length<8){
			message.error("PasswordLongerThan8Characters");
			return;
		}
		if(password1!==password2){
			message.error("PasswordDoNotMatch");
			return;
		}
		let input = new ChangePasswordDto();
		input.currentPassword = oldPassword;
		input.newPassword = password1;
		await stores.userStore.changePassword(input);
		
		message.success("PasswordUpdateSuccessful");
		if(this.props.onSuccessChangePass!==undefined){
			this.props.onSuccessChangePass();
		}
	}
	render() {
		
		
		const {oldPassword,password1, password2} = this.state;
		return (
			<div>
				
				<div >
					<Input 
						placeholder={L("OldPassword")} 
						value={oldPassword} 
						onChange={this.handleChange} 
						
					/>
				</div>
				<div style={{marginTop:10}}>
					<Input 
						placeholder={L("NewPassword")} 
						value={password1} 
						type="password"
						onChange={this.setPassword1} 
					/>
				</div>
				<div style={{marginTop:10}}>
					<Input 
						placeholder={L("RePassword")} 
						value={password2} 
						type="password"
						onChange={this.setPassword2} 
					/>
				</div>
				<div style={{marginTop:10, alignItems:"center",justifyContent:"center", display:"flex", flexDirection:"row"}}>
					
					<Button type="primary" onClick={this.onSubmit}>{L("xac_nhan")}</Button>
					
				</div>
			</div>
		);
	}
}