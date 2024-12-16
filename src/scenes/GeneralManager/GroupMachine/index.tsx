import { isGranted } from '@src/lib/abpUtility';
import * as React from 'react';
import AppConsts from '@src/lib/appconst';
import GroupMachineAdmin from './GroupMachineAdmin';
import GroupMachineUser from './GroupMachineUser';
export interface Iprops{
	visibleMachine?: boolean;
}
export default class GroupMachine extends React.Component<Iprops> {

	render() {
		return (
			<>
			{isGranted(AppConsts.Permission.Pages_Manager_General_Admin_GroupMachine) ? <GroupMachineAdmin visibleMachine={this.props.visibleMachine} />:<GroupMachineUser visibleMachine={this.props.visibleMachine}/>}
		</>
		)
	}
}
