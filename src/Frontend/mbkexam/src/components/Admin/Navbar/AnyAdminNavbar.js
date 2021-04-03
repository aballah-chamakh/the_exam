import React from 'react';
import { withRouter } from "react-router-dom";
import './anyadminnavbar-scss.scss';

class AnyAdminNavbar extends React.Component {

    goTo = (path) => {
        this.props.history.push(path)
    }
    render() {
        return (
            <div class="adminnavbar">

                <div class="adminnavbar-logo" onClick={() => { this.goTo("/") }}>
                    <h3>MBK Exam</h3>
                </div>

            </div>
        )
    }
}
export default withRouter(AnyAdminNavbar);