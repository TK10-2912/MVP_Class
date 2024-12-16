import * as React from 'react';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { GetAllSubscriptionsOutput } from '@src/services/services_autogen';
import { Button, Checkbox, Popconfirm, Table } from 'antd'
import { ColumnsType } from 'antd/lib/table';
import { ActionSubcription } from '..';

export interface IProps {
	webHookSubcriptionList: GetAllSubscriptionsOutput[];
	onSuccessCreateUpdate?: () => void;
	actionSubcription?: (item: GetAllSubscriptionsOutput, action: number) => void;

}
export default class TableMainWebHook extends React.Component<IProps> {
	state = {
		isLoadDone: false,
	}

	actionSubcription = (item: GetAllSubscriptionsOutput, action: number) => {
		if (!!this.props.actionSubcription) {
			this.props.actionSubcription(item, action);
		}
	}

	onSuccessCreateUpdate = () => {
		if (!!this.props.onSuccessCreateUpdate) {
			this.props.onSuccessCreateUpdate();
		}
	}


	render() {
		const { webHookSubcriptionList } = this.props;
		const columns: ColumnsType<GetAllSubscriptionsOutput> = [
			{
				title: 'N.O', key: 'no_hookSub_index', width: 50,
				render: (text: string, item: GetAllSubscriptionsOutput, index: number) => <div>{index + 1}</div>
			},
			{
				title: 'WebHook Uri', key: 'no_hookui_index',
				render: (text: string, item: GetAllSubscriptionsOutput, index: number) => <div><a href={item.webhookUri}>{item.webhookUri}</a></div>
			},
			{
				title: 'Trạng thái', key: 'no_isActive_index', width: 100,
				render: (text: string, item: GetAllSubscriptionsOutput, index: number) => <div>
					{item.isActive ?
						<Checkbox checked></Checkbox> :
						<Checkbox disabled></Checkbox>
					}
				</div>
			},
			{
				title: 'WebHooks', key: 'no_webHook_index',
				render: (text: string, item: GetAllSubscriptionsOutput, index: number) => <div>{item.webhooks?.join(', ')}</div>
			},
			{
				title: 'Action', key: 'no_active_index', render: (text: string, item: GetAllSubscriptionsOutput, index: number) => <div >
					<Button
						type="primary" icon={<EyeOutlined />} title='Xem chi tiết'
						style={{ marginLeft: '10px' }}
						onClick={() => this.actionSubcription(item, ActionSubcription.ViewDetail)}
					></Button>
					<Button
						type="primary" icon={<EditOutlined />} title='Chỉnh sửa'
						style={{ marginLeft: '10px' }}
						onClick={() => this.actionSubcription(item, ActionSubcription.CreateOrUpdate)}
					></Button>
					<Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={() => this.actionSubcription(item, ActionSubcription.Delete)}>
						<Button
							danger icon={<DeleteOutlined />} title='Xóa'
							style={{ marginLeft: '10px' }}
						></Button>
					</Popconfirm>
				</div>
			}
		]

		return (
			<>
				<Table
					// sticky
					columns={columns}
					bordered={true}
					rowKey={record => "quanlyhocvien_index__" + JSON.stringify(record)}
					dataSource={webHookSubcriptionList}
					className='centerTable'
				/>
			</>

		)
	}
}