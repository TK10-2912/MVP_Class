
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts from '@src/lib/appconst';
import { MachineDetailDto, ProductDto } from '@src/services/services_autogen';
import { Image } from 'antd';
import * as React from 'react';
export class IProps {
    productDetail: ProductDto;
    isBorder: boolean;
}
export default class ItemProductDetail extends AppComponentBase<IProps> {
    // getBackgroundColor = (): React.CSSProperties => {
    //     if (this.props.machineDetail.ma_de_cur <= 0) {
    //         return { backgroundColor: "#FF6384" };
    //     } else if (this.props.machineDetail.ma_de_cur < 3) {
    //         return { backgroundColor: "#FFCD56" };
    //     } else {
    //         return { backgroundColor: "white" };
    //     }
    // };
    render() {
        return (
            <div className="product-card_detail" style={{ backgroundColor: "white", border: this.props.isBorder ? " 1px solid #ddd" : "none" }}>
                <Image
                    width={50}
                    src={(this.props.productDetail.fi_id != undefined && !!this.props.productDetail.fi_id) ? this.getFile(Number(this.props.productDetail.fi_id.id)) : process.env.PUBLIC_URL + '/image/no_image.jpg'}
                />
                <br />
                <span style={{ color: 'green', lineHeight: 'normal' }}><strong>{this.props.productDetail.pr_name}</strong></span>
                <br />
                <span style={{ color: 'green', lineHeight: 'normal' }}><strong>{this.props.productDetail.pr_price}</strong></span>
            </div>
        )
    }
}