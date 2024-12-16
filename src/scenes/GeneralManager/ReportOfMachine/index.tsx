import AppConsts from "@src/lib/appconst";
import * as React from "react";
import { isGranted } from "@src/lib/abpUtility";
import ReportOfMachineAdmin from "./componentAdmin";
import ReportOfMachineUser from "./componentUser";
export interface Iprops{
    ma_id: number;
}
export default class ReportOfMachine extends React.Component<Iprops> {
    render() {
        return (
            <>
            {isGranted(AppConsts.Permission.Pages_Manager_General_Admin_ReportOfMachine) ? 
                <ReportOfMachineAdmin ma_id={this.props.ma_id}/> : <ReportOfMachineUser ma_id={this.props.ma_id}/>
            }
            </>
        )
    }
}