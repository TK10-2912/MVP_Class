
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import AppConsts from '@src/lib/appconst';
import { ImportingDetail, MachineDetailDto } from '@src/services/services_autogen';
import { ProductDetailDto } from '@src/stores/productStore';
import { stores } from '@src/stores/storeInitializer';
import { Image, Space } from 'antd';
import * as React from 'react';
export class IProps {
    productDetail: ImportingDetail;
    slot: number;
}
export default class ItemProductImporting extends AppComponentBase<IProps> {
    render() {
        const { productDetail, slot } = this.props;

        return (
            <Space
                className='layout'
                key={"refill_row"}
            >
                <div
                    key={"refill_row"}
                    className='layout__block'
                    style={{
                        border: "2px solid darkgray",
                    }}
                >
                    <div >
                        <div style={{ width: 105, height: 165 }} >
                            <span style={{ height: 16, color: '#1DA57A' }}>
                                <strong>
                                    {slot != undefined && "Khay số " + slot}
                                </strong>

                            </span>
                            <>
                                <Image
                                    title={productDetail.dr_name}
                                    height={100}
                                    src={
                                        new URL(this.getImageProduct(stores.sessionStore.getMD5ProductUseName(productDetail.dr_name!))).searchParams.get("path")                                      ?
                                            this.getImageProduct(stores.sessionStore.getMD5ProductUseName(productDetail.dr_name!))
                                            :
                                            process.env.PUBLIC_URL + '/image/botle.png'}
                                    alt={productDetail.dr_name}
                                    preview={false}
                                />
                                <div>
                                    <div className='text-wrap'><span>{"Số lượng: "}<strong>{productDetail.im_de_quantity}</strong></span></div>
                                </div>
                                <div
                                    style={{
                                        backgroundColor: '#389e0d',
                                        height: 25,
                                        color: '#ffffff',
                                        fontSize: 15,
                                        borderRadius: '0px 0px 13px 13px',
                                    }}
                                >
                                    <strong>{AppConsts.formatNumber(productDetail.im_de_money) + " VND"}</strong>
                                </div>
                            </>
                        </div>
                    </div>
                </div>
            </Space>
        )
    }
}