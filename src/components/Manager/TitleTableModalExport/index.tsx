import * as React from 'react';
import AppComponentBase from '@src/components/Manager/AppComponentBase';


export interface IProps {
	title: string;
}

export default class TitleTableModalExport extends AppComponentBase<IProps> {
	render() {
		return (
			<div className='noneBorder' style={{ display: 'flex', textAlign: 'center', flexDirection: 'column' }}>
				<table style={{ border: 'none' }}>
					<thead style={{ border: 'none' }}>
						<tr style={{ border: 'none' }}>
							<th></th>
							<th >
								<h2>{this.props.title}</h2>
							</th>
						</tr>

					</thead>
				</table>
			</div>
		);
	}

}

