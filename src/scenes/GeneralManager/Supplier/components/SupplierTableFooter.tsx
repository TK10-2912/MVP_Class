import React from 'react';
import { Row, Col } from 'antd';
import AppConsts from '@src/lib/appconst';
import { SupplierDto } from '@src/services/services_autogen';

interface IProps {
  supplierListResult: SupplierDto[],
}
class SupplierTableFooter extends React.Component<IProps> {
  calculatePageData(data) {
    return data;
  }

  calculateTotals(suppliers) {
    return this.calculatePageData(suppliers).reduce((acc, supplier) => ({
      totalImport: acc.totalImport + (supplier.su_total_money_import || 0),
      totalDebt: acc.totalDebt + (supplier.su_debt || 0),
      totalPaid: acc.totalPaid + ((supplier.su_total_money_import - supplier.su_debt) || 0)
    }), { totalImport: 0, totalDebt: 0, totalPaid: 0 });
  }

  renderStatsColumn(title, count, totals, countColor) {
    return (
      <Col span={8} style={{ border: '1px solid #e4e1e1', padding: 15, alignContent: "center" }}>
        <span>
          {title}{' '}
          <strong style={{ color: countColor }}>
            {count}
          </strong>
        </span>
        <br />
        <span>
          Tổng số tiền nhập hàng:{' '}
          <strong style={{ color: '#1DA57A' }}>
            {AppConsts.formatNumber(totals.totalImport)} đ
          </strong>
        </span>
        <br />
        <span>
          Tổng số tiền còn nợ:{' '}
          <strong style={{ color: 'orange' }}>
            {AppConsts.formatNumber(totals.totalDebt)} đ
          </strong>
        </span>
        <br />
        <span>
          Tổng số tiền đã trả:{' '}
          <strong>
            {AppConsts.formatNumber(totals.totalPaid)} đ
          </strong>
        </span>
      </Col>
    );
  }

  render() {
    const { supplierListResult } = this.props;
    const activeSuppliers = supplierListResult.filter(item => item.su_is_active === true);
    const inactiveSuppliers = supplierListResult.filter(item => item.su_is_active === false);
    const allTotals = this.calculateTotals(supplierListResult);
    const activeTotals = this.calculateTotals(activeSuppliers);
    const inactiveTotals = this.calculateTotals(inactiveSuppliers);

    return (
      <Row style={{ marginTop: '8px', fontSize: 14 }} id='supplierTableFooter'>
        {this.renderStatsColumn(
          'Tổng số nhà cung cấp:',
          supplierListResult.length,
          allTotals,
          '#1DA57A'
        )}
        {this.renderStatsColumn(
          'Số nhà cung cấp đang hoạt động:',
          activeSuppliers.length,
          activeTotals,
          'green'
        )}
        {this.renderStatsColumn(
          'Số nhà cung cấp ngừng hoạt động:',
          inactiveSuppliers.length,
          inactiveTotals,
          'red'
        )}
      </Row>
    );
  }
}

export default SupplierTableFooter;