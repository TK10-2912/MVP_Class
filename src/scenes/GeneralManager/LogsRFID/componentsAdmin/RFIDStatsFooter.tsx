import React, { Component } from 'react';
import { Row, Col } from 'antd';
import AppConsts, { cssColResponsiveSpan } from '@src/lib/appconst';
import { RfidLogDto } from '@src/services/services_autogen';

interface IProps{
	logsRFIDListResult: RfidLogDto[],

}
class RFIDStatsFooter extends Component<IProps> {
  calculateStats() {
    const { logsRFIDListResult } = this.props;
    
    return {
      newCards: logsRFIDListResult.filter(item => item.rf_lo_action === 3).length,
      cardRecharges: logsRFIDListResult.filter(item => item.rf_lo_action === 0).length,
      deleted: logsRFIDListResult.filter(item => item.rf_lo_action === 7).length,
      totalRechargeAmount: logsRFIDListResult
        .filter(item => item.rf_lo_action === 0)
        .reduce((sum, item) => sum + (item.rf_lo_money || 0), 0),
      transactions: logsRFIDListResult.filter(item => item.rf_lo_action === 2).length,
      totalTransactionAmount: logsRFIDListResult
        .filter(item => item.rf_lo_action === 2)
        .reduce((sum, item) => sum + (item.rf_lo_money || 0), 0),
      promotionalExchanges: logsRFIDListResult.filter(item => item.rf_lo_action === 5).length,
      totalPromotionalAmount: logsRFIDListResult
        .filter(item => item.rf_lo_action === 5)
        .reduce((sum, item) => sum + (item.rf_lo_money || 0), 0),
      moneyExchanges: logsRFIDListResult.filter(item => item.rf_lo_action === 4).length,
      pointAdditions: logsRFIDListResult.filter(item => item.rf_lo_action === 6).length,
      totalPoints: logsRFIDListResult
        .filter(item => item.rf_lo_action === 6)
        .reduce((sum, item) => sum + (item.rf_lo_money || 0), 0),
      statusChanges: logsRFIDListResult.filter(item => item.rf_lo_action === 1).length,
    };
  }

  renderStatItem(label, value, formatAsMoney = false) {
    const displayValue = formatAsMoney 
      ? `${AppConsts.formatNumber(value)} đ`
      : AppConsts.formatNumber(value);

    return (
      <>
        <span>
          {label}{' '}
          <strong style={{ color: '#1DA57A' }}>
            {displayValue}
          </strong>
        </span>
        <br />
      </>
    );
  }

  render() {
    const stats = this.calculateStats();
    const colProps = cssColResponsiveSpan(24, 24, 8, 8, 8, 8);
    const colStyle = { border: '1px solid #e4e1e1', padding: 15 };

    return (
      <Row id='RFIDStatsFooter'>
        <Col {...colProps} style={colStyle}>
          {this.renderStatItem('Số lần tạo mới:', stats.newCards)}
          {this.renderStatItem('Số lần nạp thẻ:', stats.cardRecharges)}
          {this.renderStatItem('Tổng số tiền nạp thẻ:', stats.totalRechargeAmount, true)}
          {this.renderStatItem('Tổng số thẻ bị xóa:', stats.deleted)}
        </Col>

        <Col {...colProps} style={colStyle}>
          {this.renderStatItem('Số lần giao dịch:', stats.transactions)}
          {this.renderStatItem('Tổng số tiền giao dịch:', stats.totalTransactionAmount, true)}
          {this.renderStatItem('Số lần đổi tiền khuyến mãi:', stats.promotionalExchanges)}
          {this.renderStatItem('Tổng số tiền đổi khuyến mãi:', stats.totalPromotionalAmount, true)}
        </Col>

        <Col {...colProps} style={colStyle}>
          {this.renderStatItem('Số lần đổi tiền:', stats.moneyExchanges)}
          {this.renderStatItem('Số lần cộng điểm quy đổi:', stats.pointAdditions)}
          {this.renderStatItem('Tổng số điểm quy đổi:', stats.totalPoints)}
          {this.renderStatItem('Số lần thay đổi trạng thái:', stats.statusChanges)}
        </Col>
      </Row>
    );
  }
}

export default RFIDStatsFooter;
