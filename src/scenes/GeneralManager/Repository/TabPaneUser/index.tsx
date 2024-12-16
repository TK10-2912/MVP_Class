import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { Tabs } from 'antd';
import * as React from 'react';
import RepositoryUser from '../RepositoryUser';
import ExportRepository from '../../ExportRepository';
import ImportRepositoryAdmin from '../../ImportRepositoryAdmin';
import TransferRepositoryDetailUser from '../TransferRepositoryDetailUser';
import ImportRepositoryUser from '../../ImportRepositoryUser';


const tabManager = {
    tab_1: "Kho lưu trữ",
    tab_2: "Nhập kho lưu trữ",
    tab_3: "Xuất kho lưu trữ",
    tab_4: "Cấp phát kho",
}
export default class TabPaneUser extends AppComponentBase {
    private repositoryUser = React.createRef<RepositoryUser>();
    private importRepository = React.createRef<ImportRepositoryAdmin>();
    private exportRepository = React.createRef<ExportRepository>();
    private transferRepositoryDetail = React.createRef<TransferRepositoryDetailUser>();
    state = {
        isLoadDone: false,
        tab: tabManager.tab_1,
        visible: undefined,
        im_re_id: undefined,
    }
    onChangeTab = async (e: string) => {

        this.setState({ isLoadDone: false });

        if (e == tabManager.tab_1) {
            this.setState({ tab: tabManager.tab_1 })
            this.repositoryUser.current?.getAll();
        }
        if (e == tabManager.tab_2) {
            this.setState({ tab: tabManager.tab_2 });
            this.importRepository.current?.getAll();
        }
        if (e == tabManager.tab_3) {
            this.setState({ tab: tabManager.tab_3 });
            this.exportRepository.current?.getAll();
        }
        if (e == tabManager.tab_4) {
            this.setState({ tab: tabManager.tab_4 });
            this.transferRepositoryDetail.current?.getAll();
        }
        this.setState({ isLoadDone: true });

    }
    async componentDidMount() {
        await this.getInit();
    }

    getInit = async () => {
        await this.setState({ isLoadDone: false });
        const urlParams = new URLSearchParams(window.location.search);
        let im_re_id = urlParams.get('im_re_id') == null || urlParams.get('im_re_id') == "undefined" ? undefined : urlParams.get('im_re_id');
        let tab_change = urlParams.get('tab') == null || urlParams.get('tab') == "undefined" ? tabManager.tab_1 : tabManager.tab_2;
        let modalImport = urlParams.get('modalImport') == null || urlParams.get('modalImport') == "undefined" ? undefined : urlParams.get('modalImport');
        if (modalImport == 'true') {
            await this.setState({ visible: true })
            await this.setState({ tab: tab_change, im_re_id: im_re_id });
        }
        await this.setState({ isLoadDone: true });
    }
    render() {
        return (
            <Tabs activeKey={this.state.tab} onChange={async (e) => await this.onChangeTab(e)}>
                <Tabs.TabPane tab={tabManager.tab_1} key={tabManager.tab_1}>
                    <RepositoryUser ref={this.repositoryUser} />
                </Tabs.TabPane>
                {/* <Tabs.TabPane tab={tabManager.tab_2} key={tabManager.tab_2}>
                    <ImportRepositoryUser ref={this.importRepository} im_re_id={this.state.im_re_id!} modalImport={this.state.visible!} />
                </Tabs.TabPane> */}
                <Tabs.TabPane tab={tabManager.tab_3} key={tabManager.tab_3}>
                    <ExportRepository ref={this.exportRepository} />
                </Tabs.TabPane>
                <Tabs.TabPane tab={tabManager.tab_4} key={tabManager.tab_4}>
                    <TransferRepositoryDetailUser ref={this.transferRepositoryDetail} />
                </Tabs.TabPane>
            </Tabs>
        )
    }
}