import * as React from 'react';
import { Input, Row, } from 'antd';
import { L } from '@src/lib/abpUtility';
export interface Iprops {
    name: string;
    onChangeName?: (name: string) => void;
}
export default class CreateOrUpdateName extends React.Component<Iprops> {
    state = {
        isLoadDone: false,
        name: "",
    };
    async componentDidMount() {
        await this.setState({ isLoading: true });
        this.initData();
        await this.setState({ isLoading: false });
    }

    initData() {
        const {name} = this.props;
        if (name != undefined) {
            if(name.includes('.')){
                var nameSplited = name.split('.');
                nameSplited.splice(nameSplited.length - 1, 1);
                this.setState({ name: nameSplited });
            }
            else{
                this.setState({ name: name });
            }
        }
    }

    onChangeName = async () => {
        if (this.props.onChangeName != undefined) {
            this.props.onChangeName(this.state.name);
        }
    }
    render() {
        return (
            <Row>
                <Input maxLength={50} value={this.state.name} onChange={async (e) => { await this.setState({ name: e.target.value }); this.onChangeName() }} />
                {!this.state.name && (
                    <span style={{ color: 'red' }}>{L("Trường bắt buộc")}</span>
                )}
            </Row>
        )
    }
}