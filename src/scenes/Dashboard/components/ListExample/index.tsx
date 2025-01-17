import * as React from 'react';
import { List } from 'antd';
import './index.less';

export interface ListItem {
	title: string;
	body: string | React.ReactNode;
}

export interface IListExampleProps {
	value: ListItem[];
	header?: string;
	footer?: string;
}

const ListExample: React.SFC<IListExampleProps> = (props: IListExampleProps) => {
	return (
		<List
			header={props.header}
			footer={props.footer}
			split={false}
			size="small"
			dataSource={props.value}
			renderItem={(item: any) => (
				<List.Item  style={{padding: 0}}>
					<List.Item.Meta title={item.title}/>
					<span style={{color: '#fff'}}>{item.body}</span>
				</List.Item>
			)}
		/>
	);
};

export default ListExample;
