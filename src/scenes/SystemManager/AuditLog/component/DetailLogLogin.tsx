import AppComponentBase from "@src/components/Manager/AppComponentBase";
import { AuditLogDto, } from "@src/services/services_autogen";
import { Avatar, Card, Col, Image, Row, Form, Input } from "antd";
import React from "react";
// import { stores } from '@stores/storeInitializer';
// import UserConsts from '@lib/userConsts';
// import User from "../../Users";
import moment from "moment";
import AppConsts from "@src/lib/appconst";
import { L } from '@lib/abpUtility';
import { CheckCircleFilled, CheckCircleOutlined, CloseCircleFilled, CloseCircleOutlined } from "@ant-design/icons";

interface IProps {
    auditLogSelected: AuditLogDto | undefined;
    onCancel?: () => void;
}


export default class DetailLogLogin extends AppComponentBase<IProps>{

    state = {
        // isLoadDone:false,
        // visibleImage: false,
        skipCount: 0,
        currentPage: 1,
        pageSize: 5,

    }



    async componentDidMount() {
        await this.getAll();
    }

    async getAll() {
        console.log(this.props.auditLogSelected)
        this.setState({ isLoadDone: false });
        // await stores.documentInforStore.getAll(this.props.auditLogSelected!.id, undefined, undefined, undefined, undefined, undefined);
        this.setState({ isLoadDone: true });
    }


    render() {

        const self = this;
        const auditLogSelected = this.props.auditLogSelected != undefined ? this.props.auditLogSelected : new AuditLogDto();
        return (
            <Card className="detailDocument">
                <h3 style={{ textTransform: 'uppercase' }}>{L('thong_tin_nguoi_dung')} </h3>
                <Row>

                    <Col span={6}>
                        <p>{L('ten_truy_cap')} : </p>
                        <p>{L('dia_chi_ip')} :</p>
                        <p>{L('khach_hang')} :</p>
                        <p>{L('trinh_duyet')} :</p>
                    </Col>
                    <Col span={18}>
                        <p>{auditLogSelected.clientName ? auditLogSelected.clientName : (L('chua_dang_nhap'))}</p>
                        <p>{auditLogSelected.clientIpAddress}</p>
                        <p>{auditLogSelected.clientName ? auditLogSelected.clientName : (L('chua_dang_nhap'))}</p>
                        <p>{auditLogSelected.browserInfo}</p>
                    </Col>
                </Row>
                <h3 style={{ textTransform: 'uppercase' }}>{L('thong_tin_hanh_dong')} </h3>
                <Row>
                    <Col span={6}>
                        <p>{L('dich_vu')} :</p>
                        <p>{L('hoat_dong')} :</p>
                        <p>{L('thoi_gian')} :</p>
                        <p>{L('khoang_thoi_gian')} :</p>
                        <p>{L('thong_so')} :</p>
                    </Col>
                    <Col span={18}>
                        <p>{auditLogSelected.serviceName}</p>
                        <p>{auditLogSelected.methodName}</p>
                        <p>{moment(auditLogSelected.executionTime).format('DD/MM/YYYY')}</p>
                        <p>{auditLogSelected.executionDuration + "  ms"}</p>
                        <div style={{ backgroundColor: '#FFF8dc', height: '50px', position: 'relative' }}>
                            <p style={{ position: 'absolute', top: '20%', }}>{auditLogSelected.parameters}</p>
                        </div>
                    </Col>
                </Row>
                <h3 style={{ textTransform: 'uppercase' }}>{L('du_lieu_tuy_chinh')} </h3>
                <Row>
                    <p>{auditLogSelected.customData ? auditLogSelected.customData : (L('khong'))}</p>
                </Row>
                <h3 style={{ textTransform: 'uppercase' }}>{L('trang_thai_loi')} </h3>
                <Row>
                    <p>{auditLogSelected.customData ? <div><CloseCircleFilled style={{ color: 'red' }} />{L('that_bai')}</div> : <div><CheckCircleFilled style={{ color: 'green' }} />{L('thanh_cong')}</div>}</p>
                </Row>
            </Card>
        )
    }
}