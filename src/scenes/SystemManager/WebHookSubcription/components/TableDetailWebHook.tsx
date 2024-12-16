import * as React from 'react';
import { Col, Table } from "antd";
import { GetAllSendAttemptsOutput, WebhookSubscription } from '@src/services/services_autogen';
import { stores } from '@src/stores/storeInitializer';
export interface IProps{
	webHookSubcriptionSelected?: WebhookSubscription;
}
export default class TableDetailWebHook extends React.Component<IProps> {
    state = {
        isLoadDone: true,
        hookSendAttemptListDto:false,
        totalCount: false,
		maxResultCount: 100,
		skipCount: 0
    };
    webhookSendAttemptSelected: GetAllSendAttemptsOutput;

    async componentDidMount() {
        await this.getAll();
    }
    async getAll() {
		const {webHookSubcriptionSelected} = this.props;
        this.setState({ isLoadDone: false });
        await stores.hookSendAttemptStore.getAllSendAttempts(webHookSubcriptionSelected!.id,this.state.maxResultCount,this.state.skipCount)
        this.setState({ isLoadDone: true });
    }

    render() {
        const {hookSendAttemptListDto} = stores.hookSendAttemptStore;
        const columns = [
            { key: 'act', title: <b>Hành động</b>, dataIndex: 'act', className: "center", render: (text: string, item: GetAllSendAttemptsOutput, index: number) => <div>{this.webhookSendAttemptSelected.data}</div> },
            { key: 'WebhookName', title: <b>WebhookEvent</b>, className: "center", dataIndex: 'WebhookName', render: (text: string, item: GetAllSendAttemptsOutput, index: number) => <div>{this.webhookSendAttemptSelected.webhookName}</div> },
            { key: 'WebhookEventId', title: <b>WebhookEventId</b>, dataIndex: 'WebhookEventId', className: "center", render: (text: string, item: GetAllSendAttemptsOutput, index: number) => <div>{this.webhookSendAttemptSelected.webhookEventId}</div> },
            { key: 'creationTime', title: <b>Thời gian tạo mới</b>, dataIndex: 'creationTime', className: "center", render: (text: string, item: GetAllSendAttemptsOutput, index: number) => <div>{this.webhookSendAttemptSelected.creationTime}</div> },
            { key: 'responseStatusCode', title: <b>HttpStatusCode</b>, dataIndex: 'responseStatusCode', className: "center", render: (text: string, item: GetAllSendAttemptsOutput, index: number) => <div>{this.webhookSendAttemptSelected.responseStatusCode}</div> },
            { key: 'response', title: <b>Response</b>, dataIndex: 'response', className: "center", render: (text: string, item: GetAllSendAttemptsOutput, index: number) => <div>{this.webhookSendAttemptSelected.response}</div> },
        ]

        return (
            <div style={{marginTop:'20px' }}>
                <h1 style={{ fontSize: 17, textAlign: 'left' }}>WebhookSendAttempts</h1>
                <Col span={24}>
                    <Table
                        // sticky
                        rowKey={record => "quanlyhocvien_index__" + JSON.stringify(record)}
                        size={'small'}
                        bordered={true}
                        locale={{ "emptyText": 'No Data' }}
                        columns={columns}
                        dataSource={hookSendAttemptListDto}
                    />
                </Col>
            </div>
        )
    }
}