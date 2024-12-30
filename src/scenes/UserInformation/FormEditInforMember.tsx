import SelectEnum from "@src/components/Manager/SelectEnum";
import { L } from "@src/lib/abpUtility";
import AppConsts from "@src/lib/appconst";
import { eGENDER } from "@src/lib/enumconst";
import { AttachmentItem, UpdateUserInput, UserDto } from "@src/services/services_autogen";
import { stores } from "@src/stores/storeInitializer";
import { Button, Card, Col, DatePicker, Form, Input, Row, message } from "antd";
import moment, { Moment } from "moment";
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import rules from "../Validation";
export interface IProps {
	onCancel: () => void;
	userInfo?: UserDto;
	updateSuccess?: () => void;
}

const FormEditInforUser = (props:IProps) => {
    const [isLoadDone, setIsLoadDone] = useState(true);
    const [idMenber, setIdMenber] = useState(-1);
    const [birthday, setBirthday] = useState<Moment | null>(moment());
    const [me_sex, setMe_sex] = useState<number | undefined>(undefined);
    
    const formRef = useRef<any>(null);
    const fileAttachmentItem = new AttachmentItem();
    useEffect(() => {
        initData(props.userInfo);
    },[props.userInfo])
	
	const updateSuccess = () => {
		if (!!props.updateSuccess) {
			props.updateSuccess();
		}
	}

	const onCancel = () => {
		if (props.onCancel) {
			props.onCancel();
		}
	}

	const initData = async (input: UserDto | undefined) => {
        setIsLoadDone(false);
        setBirthday(null);
		if (input !== undefined) {
			if (input.us_dob !== undefined) {
				setBirthday(moment(input.us_dob, "DD/MM/YYYY"));
			}
			await formRef.current!.setFieldsValue({ ...input });
		} else {
			formRef.current.resetFields();
		}
        setIsLoadDone(true);
	}

	const onUpdate = async () => {
		const form = formRef.current;
		const { userInfo } = props;
		form!.validateFields().then(async (values: any) => {
			if (userInfo !== undefined && userInfo.id !== undefined) {
				let unitData = new UpdateUserInput({ id: userInfo.id, ...values });
				unitData.userName = userInfo.userName;
				await stores.userStore.updateUser(unitData);
				await updateSuccess();
				message.success(L("SuccessfullyEdited"));
			}
		})
	}
  return (
    <Card>
        <h2 style={{ textAlign: 'center' }}>Chỉnh sửa thông tin người dùng</h2>

        <Form ref={formRef}>
            <Form.Item label={L('Tên đăng nhập')} {...AppConsts.formItemLayout} hasFeedback>
                <span>{props.userInfo?.userName}</span>
            </Form.Item>
            <Form.Item label={L('Tên người dùng')} rules={[rules.required, rules.noAllSpaces]}  {...AppConsts.formItemLayout} name={'name'} hasFeedback>
                <Input maxLength={64} />
            </Form.Item>
            <Form.Item label={L('Họ')} rules={[rules.required, rules.noAllSpaces]} {...AppConsts.formItemLayout} name={'surname'} hasFeedback>
                <Input maxLength={64} />
            </Form.Item>
            <Form.Item label={L('Email')} rules={[rules.required, rules.noAllSpaces]} {...AppConsts.formItemLayout} name={'emailAddress'} hasFeedback>
                <Input maxLength={256} type="email" />
            </Form.Item>
            <Form.Item label={L('Ngày sinh')} {...AppConsts.formItemLayout} name={'us_dob'} hasFeedback valuePropName='us_dob'>
                <DatePicker
                    onChange={(date: Moment | null, dateString: string) => { setBirthday(date); formRef.current.setFieldsValue({ me_birthday: dateString }); }}
                    format={"DD/MM/YYYY"}
                    value={birthday}
                />
            </Form.Item>
            <Form.Item label={L('Địa chỉ')} {...AppConsts.formItemLayout} name={'us_address'} hasFeedback>
                <Input />
            </Form.Item>
            <Form.Item label={L('Giới tính')} {...AppConsts.formItemLayout} name={'us_gender'} hasFeedback>
                <SelectEnum eNum={eGENDER} enum_value={props.userInfo?.us_gender} onChangeEnum={async (value: number) => { await setMe_sex(value); await formRef.current.setFieldsValue({ us_gender: value }); }} />
            </Form.Item>
            <Form.Item label={L('Vai trò')} {...AppConsts.formItemLayout} hasFeedback>
                <span>{props.userInfo?.roleNames}</span>
            </Form.Item>
            <Col style={{ display: "none" }}>
                <Form.Item label={L('Kích hoạt')} {...AppConsts.formItemLayout} name={'isActive'} hasFeedback>
                </Form.Item>
            </Col>

        </Form>
        <Row style={{ justifyContent: 'end' }}><Button type="primary" onClick={() => onUpdate()}>Cập nhật</Button></Row>

    </Card>
  )
}

export default FormEditInforUser