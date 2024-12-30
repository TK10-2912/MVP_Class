import './index.less';
import * as React from 'react';
import { useState, useRef } from 'react';
import { Button, Carousel, Col, Drawer, Form, Input, Modal, Row } from 'antd';
import { UserOutlined, LockOutlined, LogoutOutlined, KeyOutlined } from '@ant-design/icons';
import { inject, observer } from 'mobx-react';
import AccountStore from '@stores/accountStore';
import AuthenticationStore from '@stores/authenticationStore';
import { FormInstance } from 'antd/lib/form';
import { L } from '@lib/abpUtility';
import { Link, Redirect } from 'react-router-dom';
import SessionStore from '@stores/sessionStore';
import Stores from '@stores/storeIdentifier';
import TenantAvailabilityState from '@services/account/dto/tenantAvailabilityState';
import AppConsts, { cssColResponsiveSpan } from '@src/lib/appconst';
import rules from '@src/scenes/Validation';
import ResetPassword from './Forgot';

const FormItem = Form.Item;
declare var abp: any;
export interface ILoginProps {
	authenticationStore?: AuthenticationStore;
	sessionStore?: SessionStore;
	accountStore?: AccountStore;
	history: any;
	location: any;
}

const Login = inject(Stores.AuthenticationStore, Stores.SessionStore, Stores.AccountStore)(observer(({authenticationStore,sessionStore,accountStore,location}: ILoginProps
    
) => {
    
    const formRef = useRef<FormInstance>(null);
    const [visibleRegister, setVisibleRegister] = useState(false);
    const [visibleResetPass, setVisibleResetpass] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const changeTenant = async () => {
		let localStorageTenant = localStorage.getItem('tenantName')!;

		let tenancyName = (formRef.current?.getFieldValue('tenancyName') || formRef.current?.getFieldValue('tenancyName') == "") ? formRef.current?.getFieldValue('tenancyName') : localStorageTenant;
		const { loginModel } = authenticationStore!;
		if (!tenancyName) {
			abp.multiTenancy.setTenantIdCookie(undefined);
			return;
		} else {
			await accountStore!.isTenantAvailable(tenancyName);
			const { tenant } = accountStore!;
			let state: number = tenant.state!;

			switch (state) {
				case TenantAvailabilityState.Available:
					abp.multiTenancy.setTenantIdCookie(tenant.tenantId);
					loginModel.tenancyName = tenancyName;
					loginModel.toggleShowModal();
					return;
				case TenantAvailabilityState.InActive:
					setError(L('TenantIsNotActive'));
					break;
				case TenantAvailabilityState.NotFound:
					setError(L('ThereIsNoTenantDefinedWithName{0}', tenancyName));
					break;
			}
		}
	};
    const handleSubmit = async (values: any) => {
        setError(null);
		await changeTenant();
		const { loginModel } = authenticationStore!;
		await authenticationStore!.login(values);
		sessionStorage.setItem('rememberMe', loginModel.rememberMe ? '1' : '0');
		localStorage.setItem('tenantName', loginModel.tenancyName || "");
		const { state } = location;
		window.location = state ? state.from.pathname : '/';
	};
    let { from } = location.state || { from: { pathname: '/' } };
	if (authenticationStore!.isAuthenticated) return <Redirect to={from} />;
    return (
        <>
        <Row>
            <Drawer
                title={'Quên mật khẩu?'}
                width={500}
                maskClosable={false}
                closable={true}
                visible={visibleResetPass}
                headerStyle={{ justifyContent: 'center', display: 'flex' }}
                placement='right'
                onClose={() => setVisibleResetpass(false)}
            >
                <ResetPassword />
            </Drawer>
            <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', zIndex: 100, top: 10, left: 10 }}>
                    <img src={process.env.PUBLIC_URL + "/logo_mig.png"} style={{ width: 'auto', height: 60 }}></img>
                </div>
                <Carousel autoplay autoplaySpeed={5000} className='login-form-carousel'>
                    <div><img src={process.env.PUBLIC_URL + "/bg_login_2.png"} style={{ height: '100vh', width: '100%', objectFit: 'cover' }}></img></div>
                    <div><img src={process.env.PUBLIC_URL + "/bg_login_1.jpg"} style={{ height: '100vh', width: '100%', objectFit: 'cover' }}></img></div>
                    <div><img src={process.env.PUBLIC_URL + "/bg_login_3.jpg"} style={{ height: '100vh', width: '100%', objectFit: 'cover' }}></img></div>
                    <div><img src={process.env.PUBLIC_URL + "/bg_login_4.jpg"} style={{ height: '100vh', width: '100%', objectFit: 'cover' }}></img></div>
                    <div><img src={process.env.PUBLIC_URL + "/bg_login_5.jpg"} style={{ height: '100vh', width: '100%', objectFit: 'cover' }}></img></div>
                </Carousel>
            </div>
            <div className='login-form-info'>
                <h1 style={{ fontWeight: 'bold', marginTop: '7vh', color: 'rgb(254, 146, 22)' }}>Vending Machine</h1>
                <h2 style={{ fontWeight: 'bold' }}>Đăng nhập</h2>
                <Row className='login-form-input'>
                    <img src={process.env.PUBLIC_URL + "/vending_machine_icon.png"} style={{ width: '70px', height: "70px", margin: "15px 0 20px 0" }} />
                    <Col offset={3} span={18}>
                        <Form onFinish={handleSubmit} ref={formRef}>
                            <p className='login-form-label'>Tenancy</p>
                            <FormItem name={'tenancyName'}
                            // rules={[rules.required, rules.maxName, rules.noSpaces] }
                            >
                                <Input
                                    defaultValue={(localStorage.getItem('tenantName')! || "")}
                                    prefix={<KeyOutlined style={{ color: 'rgba(0,0,0,.25)', paddingRight: '5px' }} />}
                                    placeholder={L('Tenancy')}
                                    value={(localStorage.getItem('tenantName')! || "")}
                                />
                            </FormItem>
                            <p className='login-form-label'>Tên đăng nhập</p>
                            <FormItem name={'userNameOrEmailAddress'} rules={[rules.required, rules.noSpaces]}>
                                <Input
                                    maxLength={AppConsts.maxLength.name}
                                    placeholder={L('UserNameOrEmail')}
                                    prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)', paddingRight: '5px' }} />}
                                    size="large"
                                    style={{ width: '100%', height: '44px', borderRadius: '7px' }}
                                />
                            </FormItem>

                            <p className='login-form-label'>Mật khẩu</p>
                            <FormItem name={'password'} rules={[rules.required, rules.password]}>
                                <Input.Password
                                    placeholder={L('Password')}
                                    prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)', paddingRight: '5px' }} />}
                                    type="password"
                                    size="large"
                                    onPressEnter={handleSubmit}
                                    style={{ width: '100%', height: '44px', borderRadius: '7px' }}
                                />
                            </FormItem>

                            <Row style={{ marginTop: '-15px' }}>
                                <FormItem>
                                    <a className='login-form-label' onClick={() => setVisibleResetpass(true)}><LogoutOutlined /> <u>Quên mật khẩu?</u></a>
                                </FormItem>
                            </Row>
                            <Col style={{ fontSize: '15px', justifyItems: 'center' }}>
                                <Button
                                    htmlType={'submit'}
                                    type={"primary"}
                                    style={{ width: '100%', height: '40px', borderRadius: "20px", fontWeight: 700 }}
                                >
                                    Đăng nhập
                                </Button>
                            </Col>
                        </Form>
                    </Col>
                </Row>
            </div>
        </Row >
    </>
    )
  })) 

export default Login