import FileAttachments from '@src/components/FileAttachments';
import FileAttachmentsImages from '@src/components/FileAttachmentsImages';
import AppConsts from '@src/lib/appconst';
import { eDrinkType } from '@src/lib/enumconst';
import { AttachmentItem, ImportingDto, UpdateImportingInput } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
import { Button, Card, Col, Row, Tabs, message } from 'antd';
import moment from 'moment';
import * as React from 'react';
import ItemProductImporting from '../componentsAdmin/ItemProductImporting';

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
    fileAttachmentItem: AttachmentItem[] = [];
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
        await this.getDictionaryImportingRefill();
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
    UpdateImporting = async () => {
        this.setState({ isLoadDone: false });
        let x: UpdateImportingInput = new UpdateImportingInput();
        x.im_id = this.props.importingSelected.im_id;
        x.fi_id_list = this.fileAttachmentItem!;
        await stores.importingStore.update(x);
        message.success("Cập nhật thành công");
        this.onSuccess();
        this.setState({ isLoadFile: !this.state.isLoadFile, isLoadDone: true });
    }
    render() {
        const { importingSelected } = this.props;
        const self = this;
        const { TabPane } = Tabs;
        return (
            <Card>
                <Row>
                    <Col span={18} style={{ display: 'flex', alignItems: "center" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>{"Thông tin lần nhập sản phẩm" + moment(importingSelected.im_created_at).format(" DD/MM/YYYY")}</h3>
                    </Col>
                    <Col span={6} style={{ textAlign: "right", display: "flex" }}>
                        <Button
                            danger
                            onClick={() => this.onCancel()}
                            style={{ marginLeft: "5px", marginTop: "5px", marginBottom: "20px" }}>
                            Hủy
                        </Button>
                        <Button
                            type='primary'
                            onClick={() => this.UpdateImporting()}
                            style={{ marginLeft: "5px", marginTop: "5px", marginBottom: "20px" }}>
                            Lưu
                        </Button>
                    </Col>
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
                </Row>
                <Tabs defaultActiveKey="1" style={{ height: 500 }}>
                    <TabPane tab="Sản phẩm có bao bì" key="1">
                        <Row style={{ maxHeight: '400px', width: "100%", overflowY: 'auto' }}>
                            {
                                this.combinedArrayVending != undefined && this.combinedArrayVending.map(({ slotId, before, after }, index) =>
                                    <Col span={12} style={{ display: 'flex', justifyContent: "center", borderRight: `${index % 2 == 0 ? "1px solid black" : ""}` }}>
                                        <Row key={slotId} align="middle" justify="center" style={{ marginBottom: '20px' }}>
                                            <Col span={10} style={{ textAlign: 'center', display: "flex", justifyContent: "center" }} >
                                                <ItemProductImporting productDetail={before} slot={Number(slotId) + 1} />
                                            </Col>
                                            <Col span={3} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" height="100" width="100" viewBox="0 0 512 512">
                                                    <path fill="#1da57a" d="M334.5 414c8.8 3.8 19 2 26-4.6l144-136c4.8-4.5 7.5-10.8 7.5-17.4s-2.7-12.9-7.5-17.4l-144-136c-7-6.6-17.2-8.4-26-4.6s-14.5 12.5-14.5 22l0 72L32 192c-17.7 0-32 14.3-32 32l0 64c0 17.7 14.3 32 32 32l288 0 0 72c0 9.6 5.7 18.2 14.5 22z" />
                                                </svg>
                                            </Col>
                                            <Col span={10} style={{ textAlign: 'center', marginLeft: "10px", display: "flex", justifyContent: "center" }}>
                                                <ItemProductImporting productDetail={after} slot={Number(slotId) + 1} />
                                            </Col>
                                        </Row>
                                    </Col>
                                )
                            }
                        </Row>
                    </TabPane>

                    <TabPane tab="Sản phẩm không có bao bì" key="2">
                        <Row style={{ maxHeight: '400px', width: "100%", overflowY: 'auto' }}>

                            {
                                this.combinedArrayRefill != undefined && this.combinedArrayRefill.map(({ slotId, before, after }, index) =>
                                    <Col span={12} style={{ display: 'flex', justifyContent: "center", borderRight: `${index % 2 == 0 ? "1px solid black" : ""}` }}>

                                        <Row key={slotId} align="middle" justify="center" style={{ marginBottom: '20px' }}>
                                            <Col span={10} style={{ textAlign: 'center' }}>
                                                <ItemProductImporting productDetail={before} slot={Number(slotId) + 1} />
                                            </Col>
                                            <Col span={3} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" height="100" width="100" viewBox="0 0 512 512">
                                                    <path fill="#1da57a" d="M334.5 414c8.8 3.8 19 2 26-4.6l144-136c4.8-4.5 7.5-10.8 7.5-17.4s-2.7-12.9-7.5-17.4l-144-136c-7-6.6-17.2-8.4-26-4.6s-14.5 12.5-14.5 22l0 72L32 192c-17.7 0-32 14.3-32 32l0 64c0 17.7 14.3 32 32 32l288 0 0 72c0 9.6 5.7 18.2 14.5 22z" />
                                                </svg>
                                            </Col>
                                            <Col span={10} style={{ textAlign: 'center' }}>
                                                <ItemProductImporting productDetail={after} slot={Number(slotId) + 1} />
                                            </Col>
                                        </Row>
                                    </Col>
                                )
                            }
                        </Row>
                    </TabPane>
                </Tabs>
                <hr />
                <h2 style={{ margin: 0 }}>Tệp đính kèm</h2>
                <FileAttachmentsImages
                    isUpLoad={true}
                    maxLength={5}
                    files={self.fileAttachmentItem}
                    isLoadFile={this.state.isLoadFile}
                    allowRemove={true}
                    isMultiple={true}
                    onSubmitUpdate={async (itemFile: AttachmentItem[]) => {
                        self.fileAttachmentItem = itemFile.slice(0, 5);
                    }}
                />
            </Card>
        )
    }
}
