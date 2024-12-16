import { ActivateWebhookSubscriptionInput, WebhookSubscription } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import { Button, Card, Col, Row, Space, Switch, message } from "antd";
import React from "react";
import TableDetailWebHook from "./TableDetailWebHook";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

export interface IProps {
	webHookSubcriptionSelected?: WebhookSubscription;
	onOpenModalUpdate?: () => void;
	activeSuccess: () => void;
}
export default class DetailWebHookSubription extends React.Component<IProps>{
	state = {
		isLoadDone: false,
	}
	webHookSubcriptionSelected: WebhookSubscription | undefined;

	onActive = async (webHook: WebhookSubscription | undefined) => {
		this.setState({ isLoadDone: false });
		let initData = new ActivateWebhookSubscriptionInput();
		if (webHook !== undefined) {
			initData.subscriptionId = webHook.id;
			initData.isActive = !this.props.webHookSubcriptionSelected!.isActive;
		}
		await stores.webHookSubcriptionStore.activateWebhookSubscription(initData);
		this.props.webHookSubcriptionSelected!.isActive = !this.props.webHookSubcriptionSelected!.isActive;
		if (this.props.webHookSubcriptionSelected!.isActive) {
			message.success("Bật thành công!");
			this.activeSuccess(webHook!);
		} else {
			message.success("Tắt thành công!");
			this.activeSuccess(webHook!);
		}
		this.setState({ isLoadDone: true });
	}

	activeSuccess = async (item: WebhookSubscription) => {
		if (!!this.props.activeSuccess) { this.props.activeSuccess(); }
		await stores.webHookSubcriptionStore.getAllHookSubcription();
		await stores.webHookSubcriptionStore.getSubcription(item.id);

	}

	render() {
		const webHookSubcriptionSelected = this.props.webHookSubcriptionSelected != undefined ? this.props.webHookSubcriptionSelected : new WebhookSubscription();
		return (
			<>
				<Card>
					<Row justify="end" style={{ alignItems: 'center', color: 'red' }}>
						<h4 style={{margin: '0 5px 0 0'}}>Kích hoạt: </h4>
						
						{this.props.webHookSubcriptionSelected!.isActive == false ?
							<Switch onChange={() =>this.onActive(this.props.webHookSubcriptionSelected)} />
							:
							<Switch defaultChecked onChange={() =>this.onActive(this.props.webHookSubcriptionSelected)} />
						}
					</Row>
					<Row>
						<Col span={7}>
							<h3>WebhookEnhPoint:</h3>
							<h3>WebhookEvents:</h3>
							<h3>AdditonalWebHookHeaders:</h3>
							<h3>WebhookSecret:</h3>
						</Col>
						<Col span={17} style={{ fontStyle: 'italic' }}>
							<p>http://{webHookSubcriptionSelected.webhookUri}</p>
							<p>{webHookSubcriptionSelected.webhooks?.join(' , ')}</p>
							<p>{webHookSubcriptionSelected.headers !== undefined && `"${Object.keys(webHookSubcriptionSelected.headers)}"` + "    " + `"${Object.values(webHookSubcriptionSelected.headers)}"`}</p>
							<Button style={{ backgroundColor: '#666363', color: '#fff' }}>{webHookSubcriptionSelected.secret}</Button>
						</Col>
					</Row>
					<TableDetailWebHook webHookSubcriptionSelected={this.props.webHookSubcriptionSelected} />
				</Card>
			</>
		)
	}
}