import * as React from 'react';
import { Spin } from 'antd';

const Loading = () => (
	<div style={{ margin: '150px 0', textAlign: 'center' }}>
		<Spin size="large" />
	</div>
);

export default Loading;
