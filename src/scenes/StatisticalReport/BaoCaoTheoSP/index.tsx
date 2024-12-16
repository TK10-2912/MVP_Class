import React, { Component } from 'react';
import { isGranted, L } from '@src/lib/abpUtility';
import { Tabs } from 'antd';
import BaoCaoTheoSanPhamCoBaoBi from './BaoCaoTheoSPCBB';
import BaoCaoTheoSanPhamKhongCoBaoBi from './BaoCaoTheoSPkCBB';
import AppConsts from '@src/lib/appconst';
import BaoCaoTheoLoaiSanPhamAdmin from '../StatisticalImporting/reports/BaoCaoTheoLoaiSanPham/BaoCaoTheoLoaiSanPhamAdmin';
import BaoCaoTheoLoaiSanPhamUser from '../StatisticalImporting/reports/BaoCaoTheoLoaiSanPham/BaoCaoTheoLoaiSanPhamUser';

export const tabManager = {
    tab_1: L("Tổng quan"),
    tab_2: L("Báo cáo theo sản phẩm có bao bì"),
    tab_3: L("Báo cáo theo sản phẩm không bao bì"),
}
export default class StatisticalReport extends Component {
    render() {
        return (
            <Tabs
                defaultActiveKey={tabManager.tab_1}>
                <Tabs.TabPane tab={tabManager.tab_1} key={tabManager.tab_1} >
                    {isGranted(AppConsts.Permission.Pages_Statistic_Admin_DrinkType) ? <BaoCaoTheoLoaiSanPhamAdmin /> : <BaoCaoTheoLoaiSanPhamUser />}
                </Tabs.TabPane>
                <Tabs.TabPane tab={tabManager.tab_2} key={tabManager.tab_2}>
                    <BaoCaoTheoSanPhamCoBaoBi />
                </Tabs.TabPane>
                <Tabs.TabPane tab={tabManager.tab_3} key={tabManager.tab_3} >
                    <BaoCaoTheoSanPhamKhongCoBaoBi />
                </Tabs.TabPane>
            </Tabs>
        )
    }
}
