import * as React from 'react';
import { Button, Card, Col, message, Modal, Row } from 'antd';
import CreateOrUpdateWebHookSubcription from './components/CreateOrUpdate';
import { GetAllSubscriptionsOutput, WebhookSubscription } from '@src/services/services_autogen';
import { L } from '@src/lib/abpUtility';
import TableMainWebHook from './components/TableMainWebHook';
import { stores } from '@src/stores/storeInitializer';
import DetailWebHookSubription from './components/DetailWebHookSubcription';

export const ActionSubcription = {
	CreateOrUpdate: 1,
	ViewDetail: 2,
	Delete: 3,
}

export default class WebHookSubcription extends React.Component {
	state = {
		isLoadDone: true,
		visiableAddNewHookSubscription: false,
		visbleDetailWebHookSubcription: false,
	}
	webHookSubcriptionSelected: WebhookSubscription = new WebhookSubscription();

	async componentDidMount() {
		this.setState({ isLoadDone: false });
		await this.getAllHookSubription();
		this.setState({ isLoadDone: true });
	}

	getAllHookSubription = async () => {
		await stores.webHookSubcriptionStore.getAllHookSubcription();
	}
	onSuccessCreateUpdate = async () => {
		this.setState({ isLoadDone: false });
		await this.getAllHookSubription();
		this.setState({ isLoadDone: true });
	}

	viewDetailOrUpdateWebhookSubcription = async (item: GetAllSubscriptionsOutput, action: number) => {
		this.webHookSubcriptionSelected = await stores.webHookSubcriptionStore.getSubcription(item.id);
		if (action == ActionSubcription.ViewDetail){
			this.setState({ visbleDetailWebHookSubcription: true });
		}else{
			this.setState({ visiableAddNewHookSubscription: true });
		}

	}

	onCreateNewSubscription = () => {
		this.webHookSubcriptionSelected = new WebhookSubscription();
		this.setState({ visiableAddNewHookSubscription: true })
	}

	deleteSubcription = async (input: GetAllSubscriptionsOutput) => {
		this.setState({ isLoadDone: false });
		await stores.webHookSubcriptionStore.deleteSubscription(input.id);
		this.onSuccessCreateUpdate();
		message.success("Đã xóa thành công!")
		this.setState({ isLoadDone: true });
	}

	onActionSubcription = (item: GetAllSubscriptionsOutput, action: number) => {
		action == ActionSubcription.ViewDetail && this.viewDetailOrUpdateWebhookSubcription(item, ActionSubcription.ViewDetail);
		action == ActionSubcription.CreateOrUpdate && this.viewDetailOrUpdateWebhookSubcription(item, ActionSubcription.CreateOrUpdate);
		action == ActionSubcription.Delete && this.deleteSubcription(item);
	}


	render() {
		const { webHookSubcriptionDtoListResult } = stores.webHookSubcriptionStore;
		return (
			<Card>
				<Row justify='space-between'>
					<Col> <h2>WebHook Subcription</h2></Col>
					<Col><Button type='primary' onClick={() => this.onCreateNewSubscription()}>Thêm mới Hook Subcription</Button></Col>
				</Row>
				<TableMainWebHook
					webHookSubcriptionList={webHookSubcriptionDtoListResult}
					onSuccessCreateUpdate={this.onSuccessCreateUpdate}
					actionSubcription={this.onActionSubcription}
				/>

				<Modal
					visible={this.state.visiableAddNewHookSubscription}
					title={<h2>{L('Thêm mới Hook Subcription')}</h2>}
					onCancel={() => { this.setState({ visiableAddNewHookSubscription: false }) }}
					footer={null}
					width='50vw'
					maskClosable={true}
				>
					<CreateOrUpdateWebHookSubcription
						webHookSubcription={this.webHookSubcriptionSelected}
						onCancel={() => this.setState({ visiableAddNewHookSubscription: false })}
						onCreateUpdateSuccess={this.onSuccessCreateUpdate}
					/>
				</Modal>
				<Modal
					visible={this.state.visbleDetailWebHookSubcription}
					title={<h2>{L('Thông tin Hook Subcription')}</h2>}
					onCancel={() => { this.setState({ visbleDetailWebHookSubcription: false }) }}
					footer={null}
					width='70vw'
					maskClosable={true}
				>
					<DetailWebHookSubription
						webHookSubcriptionSelected={this.webHookSubcriptionSelected}
						activeSuccess={this.onSuccessCreateUpdate}
					/>
				</Modal>
			</Card>
		)
	}
}