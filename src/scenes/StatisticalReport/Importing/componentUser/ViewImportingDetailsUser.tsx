import FileAttachments from '@src/components/FileAttachments';
import AppConsts from '@src/lib/appconst';
import { eDrinkType } from '@src/lib/enumconst';
import { AttachmentItem, ImportingDto } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Row, message } from 'antd';
import moment from 'moment';
import * as React from 'react';

export interface IProps {
    onCancel: () => void;
    importingSelected: ImportingDto;
    importing_id: number,
    onSuccess?: () => void;
}

export default class ViewImportingDetailsUser extends React.Component<IProps> {
    state = {
        isLoadDone: false,
        isLoadFile: false,
        im_is_selected: undefined,
    }
    combinedArrayVending: any;
    combinedArrayRefill: any
    listAttachmentItem: AttachmentItem[] = [];
    onCancel = () => {
        if (!!this.props.onCancel) {
            this.props.onCancel();
        }
    }
    async componentDidUpdate(prevProps, prevState) {
        if (prevProps.importing_id !== this.props.importing_id) {
            this.setState({ im_is_selected: this.props.importing_id })
            this.getDictionaryImportingVending();
            this.getDictionaryImportingRefill();
        }
    }
    async componentDidMount() {
        await this.getDictionaryImportingVending();
        this.setState({ im_is_selected: this.props.importing_id })
    }
    getDictionaryImportingVending = () => {
        const { importingSelected } = this.props;
        if (importingSelected !== undefined) {
            const detailsArray = importingSelected.importingDetails !== undefined ? importingSelected.importingDetails : [];
            let detailsDict = {};
            detailsArray.forEach(item => {
                const slotId = item.im_de_slot_id;
                if (item.im_de_product_type === 0) {
                    if (!detailsDict[slotId]) {
                        detailsDict[slotId] = { before: null, after: null };
                    }
                    if (item.im_de_type === 0) {
                        detailsDict[slotId].before = item;
                    } else if (item.im_de_type === 1) {
                        detailsDict[slotId].after = item;
                    }
                }
            });

            const combinedArray = Object.keys(detailsDict).map(slotId => ({
                slotId,
                before: detailsDict[slotId].before,
                after: detailsDict[slotId].after,
            }));

            this.combinedArrayVending = combinedArray;
            this.setState({ isLoadDone: true });
        }
    }
    getDictionaryImportingRefill = () => {
        const { importingSelected } = this.props;
        if (importingSelected !== undefined) {
            const detailsArray = importingSelected.importingDetails !== undefined ? importingSelected.importingDetails : [];
            let detailsDict = {};
            detailsArray.forEach(item => {
                const slotId = item.im_de_slot_id;
                if (item.im_de_product_type === 1) {
                    if (!detailsDict[slotId]) {
                        detailsDict[slotId] = { before: null, after: null };
                    }
                    if (item.im_de_type === 0) {
                        detailsDict[slotId].before = item;
                    } else if (item.im_de_type === 1) {
                        detailsDict[slotId].after = item;
                    }
                }
            });

            const combinedArray = Object.keys(detailsDict).map(slotId => ({
                slotId,
                before: detailsDict[slotId].before,
                after: detailsDict[slotId].after,
            }));

            this.combinedArrayRefill = combinedArray;
            this.setState({ isLoadDone: true, isLoadFile: !this.state.isLoadFile });
        }
    }
    onSuccess = () => {
        if (!!this.props.onSuccess) {
            this.props.onSuccess();
        }
    }
    render() {
        const { importingSelected } = this.props;
        return (
            <Card>
                <Row>
                    <Col span={18} style={{ display: 'flex', alignItems: "center" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>{"Thông tin lần nhập sản phẩm" + moment(importingSelected.im_created_at).format(" DD/MM/YYYY")}</h3>
                    </Col>
                    <Col span={6} style={{ textAlign: "right" }}>
                        <Button
                            danger
                            onClick={() => this.onCancel()}
                            style={{ marginLeft: "5px", marginTop: "5px", marginBottom: "20px" }}>
                            Hủy
                        </Button>
                    </Col>
                </Row>
                <Row style={{ marginBottom: 20 }}>
                    <Col span={24}>
                        <h3>{"Mã nhập: "} <strong>{importingSelected.im_code}</strong></h3>
                    </Col>
                    <Col span={24}>
                        <h3>{"Đợt nhập: "}
                            <strong>{!!importingSelected.im_period ? (importingSelected.im_period.match(/Đợt nhập lần (\d+)/) ? importingSelected.im_period.match(/Đợt nhập lần (\d+)/)![1] : "") : ""}</strong>
                        </h3>
                    </Col>
                    <Col span={24}>
                        <h3>{"Thời gian: "} <strong>{moment(importingSelected.im_created_at).format("DD/MM/YYYY - HH:mm:ss")}</strong></h3>
                    </Col>
                    <h2 style={{ margin: 0 }}>Sản phẩm có bao bì</h2>
                    <div style={{ maxHeight: '400px', overflowY: 'auto', width: "100%", }}>
                        {
                            this.combinedArrayVending !== undefined && this.combinedArrayVending.map(({ slotId, before, after }) =>
                                <Col span={24} key={slotId}>
                                    <br />
                                    <table className='tableImport'>
                                        <thead>
                                            <tr>
                                                <th>{"Khay số "}{Number(slotId) + 1}</th>
                                                <th>Trước nhập</th>
                                                <th>Sau nhập</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Tên sản phẩm</td>
                                                <td>{before.dr_name}</td>
                                                <td>{after.dr_name}</td>
                                            </tr>
                                            <tr>
                                                <td>Giá bán</td>
                                                <td>{AppConsts.formatNumber(before.im_de_money)}</td>
                                                <td>{AppConsts.formatNumber(after.im_de_money)}</td>
                                            </tr>
                                            <tr>
                                                <td>Số lượng(chai)</td>
                                                <td>{before.im_de_quantity}</td>
                                                <td>{after.im_de_quantity}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </Col>)
                        }
                    </div>
                </Row>
                <hr />
                <Row style={{ marginTop: 15 }}>
                    <h2 style={{ margin: 0 }}>Sản phẩm không bao bì</h2>
                    <div style={{ maxHeight: '400px', overflowY: 'auto', width: "100%", }}>
                        {
                            this.combinedArrayRefill !== undefined && this.combinedArrayRefill.map(({ slotId, before, after }) =>
                                <Col span={24} key={slotId}>
                                    <br />
                                    <table className='tableImport'>
                                        <thead>
                                            <tr>
                                                <th>{"Khay số "}{Number(slotId) + 1}</th>
                                                <th>Trước nhập</th>
                                                <th>Sau nhập</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Tên sản phẩm</td>
                                                <td>{before.dr_name}</td>
                                                <td>{after.dr_name}</td>
                                            </tr>
                                            <tr>
                                                <td>Giá bán</td>
                                                <td>{AppConsts.formatNumber(before.im_de_money)}</td>
                                                <td>{AppConsts.formatNumber(after.im_de_money)}</td>
                                            </tr>
                                            <tr>
                                                <td>Dung tích (ml)</td>
                                                <td>{AppConsts.formatNumber(before.im_de_quantity * 100)}</td>
                                                <td>{AppConsts.formatNumber(after.im_de_quantity * 100)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </Col>)
                        }
                    </div>
                </Row>
            </Card>
        )
    }
}
