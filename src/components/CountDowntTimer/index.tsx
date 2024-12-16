import { stores } from '@src/stores/storeInitializer';
import React, { Component } from 'react';
import AppComponentBase from '../Manager/AppComponentBase';
export class IProps {
	handleSearch: () => void;
}
class CountdownTimer extends AppComponentBase<IProps> {
	interval: NodeJS.Timeout | null = null;
	state = {
		isLoadDone: false,
	};
	countDown = 0;
	async componentDidMount() {
		const { hostSetting } = stores.settingStore;
		this.countDown = (hostSetting.general.thoiGianKiemTraMayOnline ?? 0) * 60;
		if (!this.countDown) {
			await stores.settingStore.getAll();
		}
		this.updateTime();
	}

	componentWillUnmount() {
		if (this.interval) {
			clearInterval(this.interval);
		}
	}

	updateTime = async () => {
		const { hostSetting } = stores.settingStore;
		const timeMachineOnline = (hostSetting.general.thoiGianKiemTraMayOnline ?? 0) * 60;
		this.countDown = timeMachineOnline;
		this.interval = setInterval(() => {
			this.countDown -= 1;
			if (this.countDown <= 0) {
				this.countDown = timeMachineOnline;
				this.props.handleSearch();
			}
			this.setState({ isLoadDone: !this.state.isLoadDone });
		}, 1000);
	};

	formatTime = (seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const sec = seconds % 60;
		return `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(sec)}`;
	};

	padZero = (num: number) => {
		return num < 10 ? `0${num}` : num;
	};

	render() {
		return (
			<div style={{ display: 'flex', alignItems: 'end' }}>
				<h4 style={{ margin: 0, color: 'green' }}>{"Load lại sau: "}{this.formatTime(this.countDown)}</h4>
			</div>
		);
	}
}

export default CountdownTimer;
