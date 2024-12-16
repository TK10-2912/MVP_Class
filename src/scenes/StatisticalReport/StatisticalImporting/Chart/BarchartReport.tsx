import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, Line, ReferenceLine, Brush } from 'recharts';
import * as React from 'react';

export interface IProps {
    data?: DataBarchart[];
    label1?: string;
    label2?: string;
    nameColumg1_1?: string;
    nameColumg1_2?: string;
    nameColumg1_3?: string;
    nameColumg2_1?: string;
    nameColumg2_2?: string;
    nameColumg2_3?: string;
}
export class DataBarchart {
    public name = '';
    public column1_1 = 0;
    public column1_2 = 0;
    public column1_3 = 0;
    public column2_1 = 0;
    public column2_2 = 0;
    public column2_3 = 0;

    constructor(name, column1_1, column1_2, column1_3, column2_1, column2_2, column2_3) {
        this.name = name;
        this.column1_1 = column1_1;
        this.column1_2 = column1_2;
        this.column1_3 = column1_3;
        this.column2_1 = column2_1;
        this.column2_2 = column2_2;
        this.column2_3 = column2_3;
    }
}
// class CustomLegend extends React.Component<IProps>{
//     render() {
//         return (
//             <Row justify='center' >
//                 <div style={{ height: '10px', width: '20px', backgroundColor: '#8884d8', marginTop: '6px', marginRight: "5px" }}></div>
//                 <div style={{ marginRight: "5px" }}>{this.props.nameColumg1_1}</div>
//                 <div style={{ height: '10px', width: '20px', backgroundColor: '#8884d8', marginTop: '6px', marginRight: "5px" }}></div>
//                 <div style={{ marginRight: "5px" }}>{this.props.nameColumg1_2}</div>
//                 <div style={{ height: '10px', width: '20px', backgroundColor: '#8884d8', marginTop: '6px', marginRight: "5px" }}></div>
//                 <div style={{ marginRight: "5px" }}>{this.props.nameColumg1_3}</div>
//                 <div style={{ height: '10px', width: '20px', backgroundColor: '#8884d8', marginTop: '6px', marginRight: "5px" }}></div>
//                 <div style={{ marginRight: "5px" }}>{this.props.nameColumg2_1}</div>
//                 <div style={{ height: '10px', width: '20px', backgroundColor: '#8884d8', marginTop: '6px', marginRight: "5px" }}></div>
//                 <div style={{ marginRight: "5px" }}>{this.props.nameColumg2_2}</div>
//                 <div style={{ height: '10px', width: '20px', backgroundColor: '#8884d8', marginTop: '6px', marginRight: "5px" }}></div>
//                 <div style={{ marginRight: "5px" }}>{this.props.nameColumg2_3}</div>
//             </Row>
//         )
//     }
// }
class BarchartReport extends React.Component<IProps> {
    render() {
        return (
            <div style={{ marginBottom: 20 }}>
                <ResponsiveContainer width={window.innerWidth * 3 / 4} height={window.innerHeight * 2 / 3}>
                    <BarChart data={this.props.data} margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#808080">
                            <Label
                                value={this.props.label1}
                                angle={-90}
                                position="insideLeft"
                                style={{ textAnchor: 'middle', fill: '#808080' }}
                                dx={-20}
                            />
                        </YAxis>
                        <YAxis yAxisId="right" orientation="right" stroke="#808080">
                            <Label
                                value={this.props.label2}
                                angle={90}
                                position="insideRight"
                                style={{ textAnchor: 'middle', fill: '#808080' }}
                            />
                        </YAxis>
                        <Tooltip />
                        <Legend />
                        <Legend />
                        <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} />
                        <Brush dataKey="name" height={30} stroke="#8884d8" />
                        <Bar yAxisId="left" dataKey="column1_1" name={this.props.nameColumg1_1} stackId="left" fill="#ff9c6e" barSize={50} />
                        <Bar yAxisId="left" dataKey="column1_2" name={this.props.nameColumg1_2} stackId="left" fill="#1677ff" barSize={50} />
                        <Bar yAxisId="left" dataKey="column1_3" name={this.props.nameColumg1_3} stackId="left" fill="#95de64" barSize={50} />
                        <Bar yAxisId="right" dataKey="column2_1" name={this.props.nameColumg2_1} stackId="right" fill="#5cdbd3" barSize={50} />
                        <Bar yAxisId="right" dataKey="column2_2" name={this.props.nameColumg2_2} stackId="right" fill="#b37feb" barSize={50} />
                        <Bar yAxisId="right" dataKey="column2_3" name={this.props.nameColumg2_3} stackId="right" fill="#69b1ff" barSize={50} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    }
};

export default BarchartReport;
