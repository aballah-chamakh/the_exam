import React from 'react';
import { withRouter } from 'react-router-dom';
import jwt_decode from "jwt-decode";
import { HOST_URL } from "../../../config";
import { connect } from "react-redux";
import './sidebar-scss.scss';

class Sidebar extends React.Component {
    state = {
        adminprofile: null,
    }
    componentDidMount() {
        let token = localStorage.getItem("token")
        let decoded_token = jwt_decode(token)
        let adminprofile = { username: decoded_token['adminprofile_username'], image: decoded_token['adminprofile_image'] }
        this.setState({ adminprofile: adminprofile })
    }
    goTo = (path) => {
        this.props.history.push(path);
    }
    logout = () => {
        this.props.admin_logout()
        this.props.history.push("/mbk_admin/")
    }

    render() {
        let adminprofile_slug = this.props.match.params.adminprofile_slug;
        let token = localStorage.getItem("token")
        let decoded_token = jwt_decode(token)
        let adminprofile = { username: decoded_token['adminprofile_username'], image: decoded_token['adminprofile_image'] }
        let notif_count = this.props.notification_count

        //<i class='fas fa-clipboard-list'></i>
        return (
            <div class="sidebar-container">
                <div class="sidebar-icon">
                    <p>mbk exam</p>
                    <i class='fas fa-arrow-left' onClick={() => { this.props.closeSidebar(false) }}></i>
                </div>
                {adminprofile ?
                    <div class="sidebar-img-username">
                        <img src={HOST_URL + adminprofile.image} />
                        <p>mr. {adminprofile.username}</p>
                    </div> : null}
                <ul>
                    <li onClick={() => this.goTo("/mbk_admin/" + adminprofile_slug + "/dashboard/")}>
                        <i class="material-icons">dashboard</i>
                        <p>dashboard</p>
                    </li>
                    <li onClick={() => this.goTo("/mbk_admin/" + adminprofile_slug + "/students/")}>
                        <i style={{ fontSize: '18px', paddingLeft: '13px', paddingRight: '15px' }} class='fas fa-users'></i>
                        <p>students</p>
                    </li>
                    <li onClick={() => this.goTo("/mbk_admin/" + adminprofile_slug + "/exams/")}>
                        <i style={{ fontSize: '20px', paddingLeft: '13px', paddingRight: '15px' }} class='fas fa-clipboard-list'></i>
                        <p>exams</p>
                    </li>
                    <li onClick={() => this.goTo("/mbk_admin/" + adminprofile_slug + "/notifications/")}>
                        <i class="material-icons">notifications</i>
                        <p>notification {notif_count != null ? <>({notif_count})</> : null}</p>
                    </li>
                    <li onClick={() => this.goTo("/mbk_admin/" + adminprofile_slug + "/exam_setting/")}>
                        <i class="material-icons">settings</i>
                        <p>exam setting</p>
                    </li>
                    <li onClick={() => this.goTo("/mbk_admin/" + adminprofile_slug + "/claims/")}>
                        <i class='fas fa-assistive-listening-systems'></i>
                        <p>claims</p>
                    </li>
                    <li onClick={() => this.goTo("/mbk_admin/" + adminprofile_slug + "/account_setting/")}>
                        <i class="material-icons">account_circle</i>
                        <p>account</p>
                    </li>
                    <li onClick={() => this.logout()}>
                        <i class='fas fa-unlock-alt'></i>
                        <p>logout</p>
                    </li>
                </ul>
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        'admin_logout': () => dispatch({ type: "admin_logout" })
    }
}
export default withRouter(connect(null, mapDispatchToProps)(Sidebar));