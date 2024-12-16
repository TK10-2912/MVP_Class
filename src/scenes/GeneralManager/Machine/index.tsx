
import { isGranted } from '@src/lib/abpUtility';
import * as React from 'react';
import AppConsts from '@src/lib/appconst';
import MachineForAdmin from './componentsAdmin';
import MachineForUser from './componentsUser';
export interface IProps {
	gr_ma_id: number;
	isModal?: boolean
	isActive?:boolean;
}
export default class Machine extends React.Component<IProps> {

	render() {
		return (
			<>
				{isGranted(AppConsts.Permission.Pages_Manager_General_Admin_Machine) ? <MachineForAdmin isActive={this.props.isActive} isModal={this.props.isModal} gr_ma_id={this.props.gr_ma_id} /> : <MachineForUser isActive={this.props.isActive} gr_ma_id={this.props.gr_ma_id} isModal={this.props.isModal} />}
			</>
		)
	}
}
