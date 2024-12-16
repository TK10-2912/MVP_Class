import { RouterPath } from '@src/lib/appconst';
import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';

export class NotFoundRoute extends Component {
	render() {
		return (
			<>
				<Route
					render={props => {
						return (
							<Redirect
								to={{
									pathname: RouterPath.g_exception,
									state: { from: props.location },
								}}
							/>
						);
					}}
				/>
			</>
		);
	}
}

export default NotFoundRoute;
