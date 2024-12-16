
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts from '@src/lib/appconst';
import { MachineDetailDto } from '@src/services/services_autogen';
import { Image } from 'antd';
import * as React from 'react';
export class IProps {
    machineDetail: MachineDetailDto;
}
export default class ItemDetail extends AppComponentBase<IProps> {
    getBackgroundColor = (): React.CSSProperties => {
        if (this.props.machineDetail.ma_de_cur <= 0) {
            return { backgroundColor: "#FF6384" };
        } else if (this.props.machineDetail.ma_de_cur < 3) {
            return { backgroundColor: "#FFCD56" };
        } else {
            return { backgroundColor: "white" };
        }
    };
    render() {
        return (
            <div className='product-card' style={this.getBackgroundColor()}>
                <h3>{"Vị trí "}{this.props.machineDetail.ma_de_slot_id + 1}</h3>
                <Image
                    width={60}
                    style={{ marginBottom: 8 }}
                    src={(this.props.machineDetail.productItem != undefined && !!this.props.machineDetail.productItem.image_url) ? this.getFile(Number(this.props.machineDetail.productItem.image_url)) : process.env.PUBLIC_URL + '/image/no_image.jpg'}
                />
                <span style={{ color: 'green', lineHeight: 'normal' }}><strong>{this.props.machineDetail.pr_name}</strong></span>
                <div style={{ height: 100, display: 'flex', flexDirection: 'column', justifyContent: 'end' }}>
                    <span><strong>{AppConsts.formatNumber(this.props.machineDetail.pr_money)}</strong></span>
                    <span>{this.props.machineDetail.ma_de_cur}{"/"}{this.props.machineDetail.ma_de_max}</span>
                </div>
            </div>
        )
    }
}