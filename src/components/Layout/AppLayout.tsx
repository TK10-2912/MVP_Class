import './AppLayout.less';
import * as React from 'react';
import { Redirect, Switch } from 'react-router-dom';
import DocumentTitle from 'react-document-title';
import Footer from '../Manager/Footer';
import Header from '../Manager/Header';
import { Layout } from 'antd';
import ProtectedRoute from '@src/components/Router/ProtectedRoute';
import SiderMenu from '../SiderMenu';
import { appRouters } from '../Router/router.config';
import NotFoundRoute from '../Router/NotFoundRoute';
import { RouterPath } from '@src/lib/appconst';
import HistoryHelper from '@src/lib/historyHelper';
import './../../index.css'
const { Content } = Layout;

class AppLayout extends React.Component<any> {
	state = {
		collapsed: false,
	};
	isMobile: boolean = false;

	// async componentDidMount() {
	// 	window.addEventListener("resize", this.resize.bind(this));
	// 	this.resize();
	// }
	// resize() {
	// 	this.isMobile = window.innerWidth <= 1200;
	// 	if (this.isMobile) {
	// 		this.setState({ collapsed: this.isMobile });
	// 	}
	// }

	// componentWillUnmount() {
	// 	window.removeEventListener("resize", this.resize.bind(this));
	// }
	toggle = () => {
		this.setState({ collapsed: !this.state.collapsed });
	}

	onCollapse = (collapsed: any) => {
		var isMenu = localStorage.getItem("isMenu");
		if(isMenu == 'true'){
			this.setState({ collapsed });
		}
	}
	handleMouseEnter = () => {
		this.setState({ collapsed: false });
	};

	handleMouseLeave = () => {
		this.setState({ collapsed: true });
	}
	renderMenu = (route: any, index: number) => {
		if (Array.isArray(route.component)) {
			let arrr = route.component;
			return arrr
				.filter((itemChild: any) => !itemChild.isLayout)
				.map((routeChild: any, indexChild: number) => {
					return this.renderMenu(routeChild, indexChild);
				});
		}
		return (
			<ProtectedRoute key={index} path={route.path} component={route.component} permission={route.permission} />
		);

	}
	render() {
		const {
			history,
			location: { pathname },
		} = this.props;

		const { path } = this.props.match;
		const { collapsed } = this.state;
		HistoryHelper.changeHistory(history);

		const layout = (
			<Layout className='layout-container'>
				<SiderMenu onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} path={path} onCollapse={this.onCollapse} history={history} collapsed={collapsed} onChangeMenuPath={() => { if (this.isMobile) { this.setState({ collapsed: true }) } }} />
				<Layout className='layout-container__layout'>
					<Layout.Header className='layout-container__header'>
						<Header collapsed={this.state.collapsed} toggle={this.toggle} />
					</Layout.Header>
					<Content style={{ margin: 16 }}>
						<Switch>
							{pathname === RouterPath.admin && <Redirect from={RouterPath.admin} to={RouterPath.admin_dashboard} />}

							{appRouters
								.filter((item: any) => !item.isLayout)
								.map((route: any, index: any) => (
									this.renderMenu(route, index)

								))}
							{pathname !== RouterPath.admin && <NotFoundRoute />}
						</Switch>
					</Content>
					<Footer />
				</Layout>
			</Layout>
		);

		return <DocumentTitle title={"Vending Machine"}>{layout}</DocumentTitle>;
	}
}

export default AppLayout;
