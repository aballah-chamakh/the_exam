import React from "react";
import { Chart } from 'chart.js';



class ChartJS extends React.Component {
    componentDidUpdate() {
        if (this.chartn) {
            this.chartn.update()
        }
    }
    componentDidMount() {
        var ctx = this.el;
        this.chartn = new Chart(ctx, {
            type: this.props.type,
            data: this.props.data,
            options: this.props.options,
        })
    }
    render() {
        return (
            <div style={{ width: "100%", position: "relative" }}>
                <canvas ref={(el) => this.el = el} height={this.props.height} width={this.props.width} >

                </canvas>
            </div>
        )
    }
}

export default ChartJS
