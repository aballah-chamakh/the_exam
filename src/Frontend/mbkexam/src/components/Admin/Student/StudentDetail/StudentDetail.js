import React from 'react';
import "./studentdetail-scss.scss";
import StudentProfile from "../../../Student/Profile/StudentProfile";
import { withRouter } from "react-router-dom"
class StudentDetail extends React.Component {

    render() {

        return (
            <div class="admin-studentdetail-container">
                <StudentProfile source={this.props.source} />
            </div>
        )
    }
}
export default withRouter(StudentDetail);