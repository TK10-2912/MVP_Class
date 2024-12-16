
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts from '@src/lib/appconst';
import { MachineDetailDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Image } from 'antd';
import * as React from 'react';
export class IProps {
    machineDetail: MachineDetailDto;
}
export default class ItemDetail extends AppComponentBase<IProps> {
    getBackgroundColor = (): React.CSSProperties => {
        const { hostSetting } = stores.settingStore;

        if (this.props.machineDetail.ma_de_cur <= 0) {
            return { backgroundColor: "#ffecd9" };
        } else if (this.props.machineDetail.ma_de_cur < hostSetting.general.soLuongSapHetHangVending) {
            return { backgroundColor: "#ffe0e6" };
        } else {
            return { backgroundColor: "white" };
        }
    };
    render() {
        const { machineDetail } = this.props;
        return (
            <div className='product-card' style={this.getBackgroundColor()} >
                <h3>{"Vị trí "}{this.props.machineDetail.ma_de_slot_id + 1}</h3>
                {machineDetail.pr_id > 0 &&
                    < Image
                        width={60}
                        style={{ marginBottom: 8 }}
                        src={(this.props.machineDetail.productDto != undefined && this.props.machineDetail.productDto.fi_id.id != undefined) ? this.getImageProduct(this.props.machineDetail.productDto.fi_id.md5 != undefined ? this.props.machineDetail.productDto.fi_id.md5 : "") : AppConsts.appBaseUrl + "/image/no_image.jpg"}
                    />
                }
                <span style={{ color: 'green', lineHeight: 'normal' }}><strong>{this.props.machineDetail.pr_name}</strong></span>
                <div style={{ height: 100, display: 'flex', flexDirection: 'column', justifyContent: 'end' }}>
                    <span><strong>{AppConsts.formatNumber(this.props.machineDetail.pr_money)}</strong></span>
                    <span>{this.props.machineDetail.ma_de_cur}{"/"}{this.props.machineDetail.ma_de_max}</span>
                </div>
            </div>
        )
    }
}