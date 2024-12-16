
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts from '@src/lib/appconst';
import { MachineDetailDto } from '@src/services/services_autogen';
import { ProductDetailDto } from '@src/stores/productStore';
import { Image } from 'antd';
import * as React from 'react';
import "./../style.css"
export class IProps {
    productDetail: ProductDetailDto | undefined;
    machineDetail?: MachineDetailDto;
    slot?: number;
    isMachineGridLayout: boolean;
    isLayoutDeleted?: boolean;
}
export default class ItemProductDetail extends AppComponentBase<IProps> {
    render() {
        const { productDetail, machineDetail, slot, isMachineGridLayout, isLayoutDeleted } = this.props;
        return (
            <div className={`product-detail ${isMachineGridLayout && 'product-detail--height-large'} ${(isLayoutDeleted || productDetail?.pr_id === -2) ? 'product-detail--layout-deleted' : ''}`} >
                {(isLayoutDeleted || productDetail?.pr_id === -2) && <div className='product-detail__text-deleted'>Đã xóa</div>}
                <div className='product-detail__slot'>{slot}</div>
                {productDetail != undefined && productDetail.pr_id != undefined &&
                    <div className={(isLayoutDeleted || productDetail?.pr_id === -2) ? 'product-detail--opacity-half' : ''}>
                        <Image
                            title={productDetail.pr_name}
                            height={100}
                            src={productDetail.pr_id === -2 ? process.env.PUBLIC_URL + '/image/no_image.jpg' : this.getImageProduct(productDetail.fi_id?.md5!)}
                            alt={productDetail.pr_name}
                            preview={false}
                        />
                        {machineDetail ?
                            <>
                                <div className='product-detail__name product-detail__name--font-weight-bold'>{productDetail.pr_name}</div>
                                <div className='product-detail_info-container'>
                                    {machineDetail &&
                                        <div className='product-detail__remaining-quantity'>{`Còn: ${machineDetail.ma_de_cur + '/' + machineDetail.ma_de_max}`}</div>
                                    }
                                    <div className='product-detail__price'>{`Giá NY: ${AppConsts.formatNumber(productDetail.pr_price)}`}</div>
                                    <div className='product-detail__money'><strong>{AppConsts.formatNumber(machineDetail.pr_money)}</strong></div>
                                </div>
                            </>
                            :
                            <>
                                <div className='product-detail__name'><strong>{productDetail.pr_name}</strong></div>
                                <div className='product-detail__money'><strong>{AppConsts.formatNumber(productDetail.pr_price)}</strong></div>
                            </>
                        }
                    </div>
                }
            </div>
        )
    }
}