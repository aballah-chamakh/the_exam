import React from 'react';
import { withRouter } from 'react-router-dom';
import "./hiddensidebar-scss.scss";
import { connect } from "react-redux";
import $ from 'jquery';

class HiddenSidebar extends React.Component {
    goTo = (path) => {
        this.props.history.push(path);
    }
    logout = () => {
        this.props.admin_logout()
        this.props.history.push("/mbk_admin/")
    }
    render() {
        let adminprofile_slug = this.props.match.params.adminprofile_slug;
        return (
            <div class="hidden-sidebar-container">
                <ul class="hidden-sidebar-items">
                    <li class="hidden-sidebar-item" onClick={() => { this.props.openSideBar(false) }}>
                        <i class="material-icons">arrow_forward</i>
                    </li>
                    <li class="hidden-sidebar-item" onClick={() => this.goTo("/mbk_admin/" + adminprofile_slug + "/dashboard/")}>
                        <i class="material-icons">dashboard</i>
                    </li>
                    <li class="hidden-sidebar-item" onClick={() => this.goTo("/mbk_admin/" + adminprofile_slug + "/students/")}>
                        <i class='fas fa-users'></i>
                    </li>
                    <li class="hidden-sidebar-item" onClick={() => this.goTo("/mbk_admin/" + adminprofile_slug + "/exams/")}>
                        <i style={{ fontSize: '20px', paddingLeft: '13px', paddingRight: '15px' }} class='fas fa-clipboard-list'></i>
                    </li>
                    <li class="hidden-sidebar-item" onClick={() => this.goTo("/mbk_admin/" + adminprofile_slug + "/notifications/")}>
                        <i class="material-icons">notifications</i>
                    </li>
                    <li class="hidden-sidebar-item" onClick={() => this.goTo("/mbk_admin/" + adminprofile_slug + "/exam_setting/")}>
                        <i class="material-icons">settings</i>
                    </li>
                    <li class="hidden-sidebar-item" onClick={() => this.goTo("/mbk_admin/" + adminprofile_slug + "/claims/")}>
                        <i class='fas fa-assistive-listening-systems'></i>
                    </li>
                    <li class="hidden-sidebar-item" onClick={() => this.goTo("/mbk_admin/" + adminprofile_slug + "/account_setting/")}>
                        <i class="material-icons">account_circle</i>
                    </li>
                    <li onClick={() => this.logout()}>
                        <i class='fas fa-unlock-alt'></i>
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
export default withRouter(connect(null, mapDispatchToProps)(HiddenSidebar));