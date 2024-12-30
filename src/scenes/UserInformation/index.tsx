// import * as React from 'react';
// import { Card, Col, Row, Modal, Button, message } from 'antd';
// import { inject, observer } from 'mobx-react';
// import AppComponentBase from '@src/components/Manager/AppComponentBase';
// import { L } from '@lib/abpUtility';
// import Stores from '@stores/storeIdentifier';
// import { stores } from '@stores/storeInitializer';
// import moment from 'moment'
// import { AttachmentItem, UpdateAvataInput, UserDto } from '@services/services_autogen';
// import { CalendarOutlined, FileDoneOutlined, HomeOutlined, MailOutlined, PlusOutlined, SolutionOutlined, UserOutlined, WomanOutlined } from '@ant-design/icons';
// import FormEditInforMember from './FormEditInforMember';
// import { valueOfeGENDER } from '@src/lib/enumconst';
// import FileAttachmentsTest from '@src/components/FileAttachmentsTest';
// const { currentLogin } = stores.sessionStore;

// @inject(Stores.UserStore, Stores.SessionStore)
// @observer

import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Modal, Button, message } from 'antd';
import { inject, observer } from 'mobx-react';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { L } from '@lib/abpUtility';
import Stores from '@stores/storeIdentifier';
import { stores } from '@stores/storeInitializer';
import moment from 'moment';
import { AttachmentItem, UpdateAvataInput, UserDto } from '@services/services_autogen';
import { CalendarOutlined, FileDoneOutlined, HomeOutlined, MailOutlined, PlusOutlined, SolutionOutlined, UserOutlined, WomanOutlined } from '@ant-design/icons';
import FormEditInforMember from './FormEditInforMember';
import { valueOfeGENDER } from '@src/lib/enumconst';
import FileAttachmentsTest from '@src/components/FileAttachmentsTest';
import { UploadFile } from 'antd/lib/upload/interface';

const userComponentBase = new AppComponentBase({});
const UserInformation = inject(Stores.UserStore, Stores.SessionStore)(observer(() => {
  const [currentId, setCurrentId] = useState(-1);
  const [isLoadDone, setIsLoadDone] = useState(true);
  const [visibleModalUpdateMember, setVisibleModalUpdateMember] = useState(false);
  const [usAvatar, setUsAvatar] = useState(-1);
  const [checkSize, setCheckSize] = useState(true);
  const [file, setFile] = useState<UploadFile | undefined>(undefined);

  const { userStore, sessionStore } = stores;
  const { editUser } = userStore;
  const { currentLogin } = sessionStore;

  useEffect(() => {
    const initialize = async () => {
      setIsLoadDone(false);
      setCurrentId(currentLogin.user?.id || -1);
      await getAll();
      setIsLoadDone(true);
    };
    initialize();
  }, []);

  const getAll = async () => {
    if (currentId >= 0) {
      await userStore.getUserById(currentId);
      await getUsAvatar();
    }
  };

  const getUsAvatar = async () => {
    setUsAvatar(editUser?.us_avatar || -1);
    setFile({
      uid: (editUser?.us_avatar || -1).toString(),
      name: 'image.png',
      status: 'done',
      url: userComponentBase.getFile(editUser?.us_avatar),
    } as UploadFile);
  };

  const updateSuccess = async () => {
    setIsLoadDone(false);
    await getAll();
    await sessionStore.getCurrentLoginInformations();
    setIsLoadDone(true);
    setVisibleModalUpdateMember(false);
  };

  const onUpdateAvataUser = async (data) => {
    setIsLoadDone(false);
    if (checkSize) {
      const result = new UpdateAvataInput();
      result.id = data.id;
      result.us_avatar = usAvatar;
      await userStore.updateAvataUser(result);
      window.location.reload();
    } else {
      message.warning('Hình ảnh không hợp lệ');
    }
  };

  return (
    <div>
      <Card>
        <h3 style={{ color: '#237804', fontSize: 18 }}><b>Thông tin đăng nhập</b></h3>
        <Col span={16} style={{ padding: '20px 20px 20px 40px', fontSize: '15px' }}>
          {editUser && (
            <div style={{ width: '100%' }}>
              <Row style={{ paddingBottom: '10px', fontSize: '15px' }} gutter={16}>
                <Col span={11}><UserOutlined style={{ zoom: 1.5 }} /><b> &nbsp;Tên đăng nhập: &nbsp;</b> <label>{currentLogin.user?.userName}</label></Col>
                <Col span={13}><MailOutlined style={{ zoom: 1.5 }} /><b>&nbsp;Hòm thư điện tử: &nbsp;</b> <label>{currentLogin.user?.emailAddress}</label></Col>
              </Row>
              <Row gutter={16} style={{ marginTop: '20px', paddingBottom: '10px' }}>
                <Col span={11}><SolutionOutlined style={{ zoom: 1.5 }} /><b>&nbsp;Tên người dùng: &nbsp;</b> <label>{currentLogin.user?.name}</label></Col>
                <Col span={13}><CalendarOutlined style={{ zoom: 1.5 }} /><b> &nbsp;Lần đăng nhập gần nhất: &nbsp;</b> <label>{moment(editUser?.lastLoginTime).format('DD/MM/YYYY')}</label></Col>
              </Row>
            </div>
          )}
        </Col>
      </Card>
      <Card>
        <Row>
          <Col span={22}>
            <h3 style={{ color: '#237804', fontSize: 18 }}><b>{L('Thông tin người dùng')}</b></h3>
          </Col>
        </Row>
        <Row>
          <Col span={8} style={{ textAlign: 'center', boxShadow: 'rgba(0, 0, 0, 0.2) 0px 3px 8px' }}>
            <Row justify='center' title='Ảnh đại diện'>
              <div style={{ width: 130, margin: '10px 0' }}>
                {editUser?.us_avatar && (
                  <FileAttachmentsTest 
                    onSubmitUpdate={(fi_id) => setUsAvatar(fi_id.id)}
                    file={file}
                    lengthUpload={1}
                    isMultiple={false}
                    checkSize={setCheckSize}
                  />
                )}
              </div>
            </Row>
            <Row style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
              {editUser ? (
                <Button style={{ border: '1px solid #1DA57A' }} onClick={() => onUpdateAvataUser(editUser)}>Lưu</Button>
              ) : (
                <Button style={{ border: '1px solid #1DA57A' }} onClick={() => alert('Không có người sở hữu')}><PlusOutlined /></Button>
              )}
            </Row>
            <Row justify='center'>
              <Card style={{ width: '70%', background: '#b8b1b142', fontFamily: 'sans-serif', border: '1px solid rgb(183 141 141 / 56%)', borderRadius: '10px' }}>
                <h4>Thêm ảnh mới</h4>
                <h4>Dung lượng tối đa của ảnh là 10mb</h4>
              </Card>
            </Row>
          </Col>
          <Col span={16} style={{ padding: '20px 20px 0px 40px', fontSize: '15px' }}>
            {editUser && (
              <div style={{ width: '100%' }}>
                <Row style={{ display: 'flex', justifyContent: 'end', marginBottom: 20 }}>
                  <Button type='primary' onClick={() => setVisibleModalUpdateMember(true)}>Chỉnh sửa thông tin</Button>
                </Row>
                <Row gutter={[16, 24]}>
                  <Col span={12}><UserOutlined style={{ zoom: 1.5 }} /><b> &nbsp;Tên người dùng:</b>&nbsp; {editUser.name}<i></i>&nbsp;</Col>
                  <Col span={12}><UserOutlined style={{ zoom: 1.5 }} /><b> &nbsp;Họ:</b> &nbsp;{editUser.surname}<i></i>&nbsp;</Col>
                  <Col span={12}><CalendarOutlined style={{ zoom: 1.5 }} /><b> &nbsp;Ngày sinh:</b>&nbsp; {editUser.us_dob ? moment(editUser.us_dob).format('DD/MM/YYYY') : ''} &nbsp;</Col>
                  <Col span={12}><HomeOutlined style={{ zoom: 1.5 }} /><b>&nbsp;Địa chỉ:</b> &nbsp;{editUser.us_address} &nbsp;</Col>
                  <Col span={12}><WomanOutlined style={{ zoom: 1.5 }} /><b> &nbsp;Giới tính:</b>&nbsp;{valueOfeGENDER(editUser.us_gender)} &nbsp;</Col>
                  <Col span={12}><FileDoneOutlined style={{ zoom: 1.5 }} /><b> &nbsp;Vai trò:</b>&nbsp; {editUser.roleNames?.join(', ')} &nbsp;</Col>
                </Row>
                <Row style={{ display: 'flex', justifyContent: 'center', marginTop: '70px', fontSize: '20px', fontFamily: 'inherit', background: '#8888' }}>
                  <p style={{ margin: 0, padding: 10 }}>Chào mừng bạn <b>{editUser.name}</b> quay trở lại!  </p>
                </Row>
              </div>
            )}
          </Col>
        </Row>
      </Card>
      <Modal
        width={'50%'}
        title="Chỉnh sửa thông tin người dùng"
        visible={visibleModalUpdateMember}
        onCancel={() => setVisibleModalUpdateMember(false)}
        footer={null}
      >
        <FormEditInforMember
          onCancel={() => setVisibleModalUpdateMember(false)}
          updateSuccess={updateSuccess}
          userInfo={editUser}
        />
      </Modal>
    </div>
  );
}));

export default UserInformation;

// export default class UserInformation extends AppComponentBase {

// 	state = {
// 		currentId: -1,
// 		isLoadDone: true,
// 		visibleModalUpdateMember: false,
// 		usAvatar: -1,
// 		checkSize: true,
// 	}
// 	file: any;
// 	async componentDidMount() {
// 		await this.setState({ isLoadDone: false });
// 		this.setState({ currentId: currentLogin.user!.id });
// 		await this.getAll();
// 		await this.setState({ isLoadDone: true });
// 	}
	
// 	async getAll() {
// 		if (this.state.currentId >= 0) {
// 			await stores.userStore.getUserById(this.state.currentId);
// 			await this.getUsAvatar();
// 		}
// 	}

// 	async getUsAvatar() {
// 		const { editUser } = stores.userStore;
// 		await this.setState({ usAvatar: editUser.us_avatar });
// 		this.file = {
// 			uid: this.state.usAvatar,
// 			name: 'image.png',
// 			status: 'done',
// 			url: this.getFile(this.state.usAvatar),
// 		};
// 	}

// 	updateSuccess = async () => {
// 		await this.setState({ isLoadDone: false })
// 		await this.getAll();
// 		await stores.sessionStore.getCurrentLoginInformations();
// 		await this.setState({ isLoadDone: true, visibleModalUpdateMember: false })
// 	}

// 	onUpdateAvataUser = async (data: UserDto) => {
// 		this.setState({ isLoadDone: false });
// 		if (this.state.checkSize) {
// 			let result = new UpdateAvataInput();
// 			result.id = data.id;
// 			result.us_avatar = this.state.usAvatar;
// 			await stores.userStore.updateAvataUser(result);
// 			window.location.reload();
// 		}
// 		else {
// 			message.warning("Hình ảnh không hợp lệ ")
// 		}

// 	}
// 	render() {
// 		const { editUser } = stores.userStore;
// 		const { currentLogin } = stores.sessionStore;
// 		return (

// 			<div>
// 				<Card>
// 					<h3 style={{ color: '#237804', fontSize: 18 }}><b>Thông tin đăng nhập</b></h3>
// 					<Col span={16} style={{ padding: '20px 20px 20px 40px', fontSize: '15px' }}>
// 						{editUser &&
// 							<div style={{ width: "100%" }}>
// 								<Row style={{ paddingBottom: '10px', fontSize: '15px' }} gutter={16}>
// 									<Col span={11}><UserOutlined style={{ zoom: 1.5 }} /><b> &nbsp;Tên đăng nhập: &nbsp;</b> <label>{currentLogin.user.userName}</label></Col>
// 									<Col span={13}><MailOutlined style={{ zoom: 1.5 }} /><b>&nbsp;Hòm thư điện tử: &nbsp;</b> <label>{currentLogin.user.emailAddress}</label></Col>

// 								</Row>
// 								<Row gutter={16} style={{ marginTop: '20px', paddingBottom: '10px' }}>
// 									<Col span={11}><SolutionOutlined style={{ zoom: 1.5 }} /><b>&nbsp;Tên người dùng: &nbsp;</b> <label>{currentLogin.user.name}</label></Col>
// 									<Col span={13}><CalendarOutlined style={{ zoom: 1.5 }} /><b> &nbsp;Lần đăng nhập gần nhất: &nbsp;</b> <label>{moment(editUser.lastLoginTime!).format('DD/MM/YYYY')}</label></Col>
// 								</Row>

// 							</div>
// 						}
// 					</Col>
// 				</Card>
// 				<Card>
// 					<Row>
// 						<Col span={22}>
// 							<h3 style={{ color: '#237804', fontSize: 18 }}><b>{L('Thông tin người dùng')}</b></h3>
// 						</Col>
// 					</Row>
// 					<Row>
// 						<Col span={8} style={{ textAlign: 'center', boxShadow: 'rgba(0, 0, 0, 0.2) 0px 3px 8px' }}>
// 							<Row justify='center' title='Ảnh đại diện'>
// 								<div style={{ width: 130, margin: '10px 0' }}>
// 									{(editUser != undefined && editUser.us_avatar != undefined && editUser.us_avatar != null) ? (
// 										<FileAttachmentsTest onSubmitUpdate={(fi_id: AttachmentItem) => this.setState({ usAvatar: fi_id.id })} file={this.file} lengthUpload={1} isMultiple={false} checkSize={(input) => this.setState({ checkSize: input })} />
// 									) : null}
// 								</div>
// 							</Row>

// 							<Row style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
// 								{
// 									(editUser != undefined) ?
// 										<Col >
// 											<Button style={{ border: "1px solid #1DA57A" }} onClick={() => this.onUpdateAvataUser(editUser)}>Lưu</Button>
// 										</Col>
// 										:
// 										<Col >
// 											<Button style={{ border: "1px solid #1DA57A" }} onClick={() => alert("Không có người sở hữu")}><PlusOutlined /></Button>
// 										</Col>
// 								}
// 							</Row>
// 							<Row justify='center'>
// 								<Card style={{ width: '70%', background: "#b8b1b142", fontFamily: 'sans-serif', border: '1px solid rgb(183 141 141 / 56%)', borderRadius: '10px' }}>
// 									<h4>Thêm ảnh mới</h4>
// 									<h4>Dung lượng tối đa của ảnh là 10mb</h4>
// 								</Card>
// 							</Row>
// 						</Col>
// 						<Col span={16} style={{ padding: '20px 20px 0px 40px', fontSize: '15px' }}>
// 							{editUser != undefined &&
// 								<div style={{ width: "100%" }}>
// 									<Row style={{ display: 'flex', justifyContent: 'end', marginBottom: 20 }}>
// 										<Button type='primary' onClick={() => this.setState({ visibleModalUpdateMember: true })}>Chỉnh sửa thông tin</Button>
// 									</Row>
// 									<Row gutter={[16, 24]}>
// 										<Col span={12}><UserOutlined style={{ zoom: 1.5 }} /><b> &nbsp;Tên người dùng:</b>&nbsp; {editUser.name}<i></i>&nbsp;</Col>
// 										<Col span={12}><UserOutlined style={{ zoom: 1.5 }} /><b> &nbsp;Họ:</b> &nbsp;{editUser.surname}<i></i>&nbsp;</Col>
// 										<Col span={12}><CalendarOutlined style={{ zoom: 1.5 }} /><b> &nbsp;Ngày sinh:</b>&nbsp; {editUser.us_dob != null ? moment(editUser.us_dob).format("DD/MM/YYYY") : ""} &nbsp;</Col>
// 										<Col span={12}><HomeOutlined style={{ zoom: 1.5 }} /><b>&nbsp;Địa chỉ:</b> &nbsp;{editUser.us_address} &nbsp;</Col>
// 										<Col span={12}><WomanOutlined style={{ zoom: 1.5 }} /><b> &nbsp;Giới tính:</b>&nbsp;{valueOfeGENDER(editUser.us_gender)} &nbsp;</Col>
// 										<Col span={12}><FileDoneOutlined style={{ zoom: 1.5 }} /><b> &nbsp;Vai trò:</b>&nbsp; {editUser.roleNames != undefined && editUser.roleNames!.length > 0 && editUser.roleNames?.map(item => item)} &nbsp;</Col>
// 									</Row>
// 									<Row style={{ display: 'flex', justifyContent: 'center', marginTop: '70px', fontSize: '20px', fontFamily: 'inherit', background: "#8888" }}>
// 										<p style={{ margin: 0, padding: 10 }}>Chào mừng bạn <b>{editUser.name}</b> quay trở lại!  </p>
// 									</Row>
// 								</div>
// 							}

// 						</Col>
// 					</Row>
// 				</Card>
// 				<Modal
// 					width={'50%'}
// 					title="Chỉnh sửa thông tin người dùng"
// 					visible={this.state.visibleModalUpdateMember}
// 					onCancel={() => this.setState({ visibleModalUpdateMember: false })}
// 					footer={null}
// 				>
// 					<FormEditInforMember
// 						onCancel={() => this.setState({ visibleModalUpdateMember: false })}
// 						updateSuccess={this.updateSuccess}
// 						userInfo={editUser}
// 					/>
// 				</Modal>
// 			</div>
// 		);
// 	}
// }
