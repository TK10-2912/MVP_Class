import { CustomUserNotification, UpdateStateNotificationInput, UserNotification, UserNotificationState } from '@src/services/services_autogen';
import { Button, Card, Col, List, Popover, Row, Space } from "antd";
import AppComponentBase from "../AppComponentBase";
import * as React from 'react';
import { stores } from '@src/stores/storeInitializer';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { eTypeNotification, valueOfeTypeNotification } from '@src/lib/enumconst';
import { CheckOutlined, CloseOutlined, EllipsisOutlined } from '@ant-design/icons';
import { cssColResponsiveSpan } from '@src/lib/appconst';
import VirtualList from 'rc-virtual-list';

export interface IProps {
	notificationListResult: CustomUserNotification[];
	loadDone: boolean;
	totalUnreadNotification: number;
	getAllNotification: (maxResultCount?: number) => void;
	updateAllNotification: (typeNotification?: number) => void;
}

export default class NotificationList extends AppComponentBase<IProps> {
	state = {
		isLoadDone: false,
		activeButton: 0,
		takeNumberOfNotification: 20,
		notificationIdSelected: '',
	};
	notificationListResult: CustomUserNotification[] = this.props.notificationListResult;
	componentDidMount() {
		const { notificationListResult } = this.props;
		this.notificationListResult = notificationListResult.filter(a => a.userNotification.notification.data.properties!["Type"] == eTypeNotification.TRANSACTION.num).slice(0, this.state.takeNumberOfNotification);
		this.setState({ isLoadDone: !this.state.isLoadDone });
	}
	componentDidUpdate(prevProps) {
		if (prevProps.loadDone != this.props.loadDone) {
			this.handleButtonClick(this.state.activeButton);
		}
	}

	async updateStateNotification(item: UserNotification, isRead: boolean) {
		let x: UpdateStateNotificationInput = new UpdateStateNotificationInput();
		x.notificationId = item.id!;
		x.state = isRead ? 1 : 0;
		await stores.notificationStore.updateStateNotification(x);
		this.props.getAllNotification();
		this.setState({ isLoadDone: !this.state.isLoadDone });
	}
	handleButtonClick = async (notificationType: number) => {
		const { notificationListResult } = this.props;

		this.notificationListResult = notificationListResult.filter(a => a.userNotification.notification.data.properties!["Type"] == notificationType)
		if (this.state.takeNumberOfNotification) {
			this.notificationListResult = this.notificationListResult.slice(0, this.state.takeNumberOfNotification);
		}
		await this.setState({ isLoadDone: !this.state.isLoadDone, activeButton: notificationType })
	}

	render() {
		const { activeButton } = this.state;
		const { totalUnreadNotification, notificationListResult } = this.props;

		const buttons = Object.values(eTypeNotification).map(a => a.num);
		const unreadCounts = buttons.reduce((acc, label) => {
			acc[label] = notificationListResult.some(
				(noti) => noti.customData.properties!["Type"] === label
					&& noti.userNotification.state === UserNotificationState._0
			);
			return acc;
		}, {});

		const contentMoreInfo = (item: UserNotification, isRead: boolean) => {
			return (
				<Space direction='vertical' size={0}>
					{isRead
						?
						<Button
							className='notification-card__button'
							type='text'
							icon={<CheckOutlined />}
							onClick={() => this.updateStateNotification(item, isRead)}
						>
							Đánh dấu là đã đọc
						</Button>
						:
						<Button
							className='notification-card__button'
							type='text'
							icon={<CloseOutlined />}
							onClick={() => this.updateStateNotification(item, isRead)}
						>
							Đánh dấu là chưa đọc
						</Button>
					}
				</Space>
			);
		}
		return (
			<Card className="notification-card -border-no" >
				<Row justify='space-between'>
					<h2>Thông báo</h2>
					{totalUnreadNotification > 0 &&
						<Button className='buttonNotification' onClick={() => this.props.updateAllNotification()}>Đánh dấu đã đọc tất cả</Button>
					}
				</Row>
				<Row className='notification-card__row-actions'>
					<Space>
						{buttons.map((label) => (
							<Button
								key={label}
								className={`${activeButton === label ? "active-button" : ""} buttonNotification`}
								onClick={() => this.handleButtonClick(label)}
							>
								{valueOfeTypeNotification(label)}
								{unreadCounts[label] > 0 && <span className="notification-dot-button"></span>}
							</Button>
						))}
					</Space>
				</Row>
				<List
					className={'notification-card__list'}
					size="small"
					footer={
						<Row justify='center'>
							{(this.notificationListResult.length > 0 && this.state.takeNumberOfNotification) ?
								<Col style={{ display: "flex", justifyContent: "center" }} span={this.notificationListResult.filter(item => item.userNotification.state === UserNotificationState._0).length > 0 ? 12 : 24}>
									<Button style={{ border: "none" }} onClick={async () => { await this.setState({ takeNumberOfNotification: undefined }); this.props.getAllNotification(); }} className='buttonNotificationFooter'>
										Xem thông báo cũ hơn
									</Button>
								</Col>
								:
								<Col style={{ display: "flex", justifyContent: "center" }} span={this.notificationListResult.filter(item => item.userNotification.state === UserNotificationState._0).length > 0 ? 12 : 24}>
									<Button style={{ border: "none" }} onClick={async () => { await this.setState({ takeNumberOfNotification: 10 }); this.props.getAllNotification(); }} className='buttonNotificationFooter'>
										Thu gọn
									</Button>
								</Col>
							}
							{this.notificationListResult.filter(item => item.userNotification.state === UserNotificationState._0).length > 0 &&
								<Col {...cssColResponsiveSpan(24, 24, 24, 12, 12, 12)}>
									<Button style={{ border: "none" }} className='buttonNotificationFooter' onClick={() => this.props.updateAllNotification(this.state.activeButton)}>Đánh dấu đã đọc tất cả</Button>
								</Col>
							}
						</Row>
					}
				>
					<VirtualList
						height={420}
						itemHeight={105}
						itemKey={(item) => item.userNotification.id}
						data={this.notificationListResult}
					>
						{(item) => (
							<List.Item key={item.userNotification.id} className="notification-card__list-item" onMouseEnter={() => this.setState({ notificationIdSelected: item.userNotification.id })}>
								<Link style={{ color: 'black', opacity: item.userNotification.state === UserNotificationState._0 ? 1 : 0.5 }} to={item.customData.route!} target="_blank">
									<div onClick={() => this.updateStateNotification(item.userNotification, true)}>
										<div className='notification-card__message' dangerouslySetInnerHTML={{ __html: item.customData.message! }} style={{ margin: 0 }} />
										<small className="notification-date">{"Ngày tạo: " + moment(item.userNotification.notification.creationTime).format("DD/MM/YYYY HH:mm:ss")}</small>
										{item.userNotification.state === UserNotificationState._0 && (
											<span className="notification-dot"></span>
										)}
									</div>
								</Link>
								{this.state.notificationIdSelected === item.userNotification.id &&
									<Popover
										className='notification-card__popover'
										trigger="click"
										content={() => contentMoreInfo(item.userNotification, item.userNotification.state === UserNotificationState._0)}
									>
										<Button className='notification-card__more-info' shape="circle" icon={<EllipsisOutlined style={{ fontSize: 24 }} />}></Button>
									</Popover>
								}
							</List.Item>
						)}
					</VirtualList>
				</List>
			</Card>
		);
	}
}
