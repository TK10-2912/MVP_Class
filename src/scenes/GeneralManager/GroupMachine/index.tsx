import { isGranted } from '@src/lib/abpUtility';
import * as React from 'react';
import AppConsts from '@src/lib/appconst';
import GroupMachineAdmin from './GroupMachineAdmin';
import GroupMachineUser from './GroupMachineUser';
export default class GroupMachine extends React.Component {

	render() {
		return (
			<>
			{isGranted(AppConsts.Permission.Pages_Manager_General_Admin_GroupMachine) ? <GroupMachineAdmin/>:<GroupMachineUser />}
		</>
		)
	}
}
