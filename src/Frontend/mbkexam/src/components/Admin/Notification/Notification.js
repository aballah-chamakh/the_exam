import React from 'react';
import axios from "axios";
import { HOST_URL, formatDateTime, NO_NOTIFICATION } from "../../../config";
import { withRouter } from "react-router-dom";
import "./notification-scss.scss";
import jwt_decode from "jwt-decode";
import SyncLoader from "react-spinners/SyncLoader";
//import { makeStyles } from '@material-ui/core/styles';
import Pagination from '@material-ui/lab/Pagination';

class Notification extends React.Component {
    state = {
        notifications: [],
        form: { search: "" },
        loaded: false,
        page: 1,
        count: null,
    }
    componentDidMount = () => {
        window.scrollTo(0, 0)
        let source = this.props.source
        if (source != "dashboard") {
            window.scrollTo(0, 0)
        }
        let token = localStorage.getItem("token")
        let config = { headers: { Authorization: 'Bearer ' + token } }
        let isTokenExpired = Date.now() >= jwt_decode(token).exp * 1000;
        if (isTokenExpired) {
            this.refreshTokenLoadNotifications()
        } else {
            this.loadNotifications(config)
        }
        this.interval = setInterval(() => {
            let token = localStorage.getItem("token")
            let config = { headers: { Authorization: 'Bearer ' + token } }
            let isTokenExpired = Date.now() >= jwt_decode(token).exp * 1000;
            if (isTokenExpired) {
                this.refreshTokenLoadNotifications()
            } else {
                this.loadNotifications(config)
            }
        }, 5000)
    }
    componentWillUnmount = () => {
        clearInterval(this.interval)
    }
    loadNotifications = (config) => {
        let adminprofile_slug = this.props.match.params.adminprofile_slug;
        let url = HOST_URL + "/api/adminprofile/" + adminprofile_slug + "/get_notifications/";
        let search = this.state.form.search
        let page = this.state.page;
        url += "?page=" + page;
        if (search) {
            url += "&search=" + search;
        }
        axios.get(url, config).then(res => {
            this.setState({ notifications: res.data.notifications, count: res.data.count, loaded: true })
        })
    }

    refreshTokenLoadNotifications = () => {
        let refreshToken = localStorage.getItem("refresh_token")
        let data = { 'refresh': refreshToken }
        axios.post(HOST_URL + "/api/token/refresh/", data).then(res => {
            let token = res.data.access;
            refreshToken = res.data.refresh;
            localStorage.setItem('token', token)
            localStorage.setItem('refresh_token', refreshToken)
            let config = { headers: { Authorization: 'Bearer ' + token } }
            this.loadNotifications(config)
        })
    }
    goToNotif = (event_type, event_slug, student_slug) => {
        let adminprofile_slug = this.props.match.params.adminprofile_slug;
        let path = "/mbk_admin/" + adminprofile_slug + "/";
        if (event_type == "new_student_created") {
            path += "student/"
        } else if (event_type == "new_exam_created") {
            path += "student/" + student_slug + "/exam/"
        } else {
            path += "claim/"
        }
        path += event_slug + "/"
        console.log(path)
        this.props.history.push({
            pathname: path,
            state: {
                'admin_notif': true,
            }
        })
    }
    goToStudent = (student_slug) => {
        let adminprofile_slug = this.props.match.params.adminprofile_slug;
        this.props.history.push("/mbk_admin/" + adminprofile_slug + "/student/" + student_slug + "/")
    }
    handleSearchChange = (e) => {
        let value = e.target.value
        let token = localStorage.getItem("token")
        let isTokenExpired = Date.now() >= jwt_decode(token).exp * 1000;
        let config = { headers: { Authorization: 'Bearer ' + token } }
        this.setState({ form: { search: value } })
        if (isTokenExpired) {
            let refreshToken = localStorage.getItem("refresh_token")
            let data = { 'refresh': refreshToken }
            axios.post(HOST_URL + "/api/token/refresh/", data).then(res => {
                let token = res.data.access;
                refreshToken = res.data.refresh;
                localStorage.setItem('token', token)
                localStorage.setItem('refresh_token', refreshToken)
                config = { headers: { Authorization: 'Bearer ' + token } }
                this.loadSearchedNotification(value, config)
            })
        } else {
            this.loadSearchedNotification(value, config)
        }
    }
    loadSearchedNotification = (search, config) => {
        let adminprofile_slug = this.props.match.params.adminprofile_slug;
        let page = this.state.page;
        axios.get(HOST_URL + "/api/adminprofile/" + adminprofile_slug + "/get_notifications/?search=" + search + "&page=" + page, config).then(res => {
            this.setState({ notifications: res.data.notifications, page: res.data.page, count: res.data.count })
        })
    }
    handleChange = (e, value) => {
        this.setState({ page: value })
    }
    render() {
        let source = this.props.source;
        let notifications = this.state.notifications;
        let loaded = this.state.loaded;
        let page = this.state.page;
        let count = this.state.count;
        return (
            <div class="admin-notification-container" >
                <div class="admin-notification-header">
                    {source != "dashboard" ? <p>notifications </p> : null}
                </div>
                {source != "dashboard" ?
                    <div class="admin-notification-content-search">
                        <div class="form-group" >
                            <input class="form-control" id="search" for="search" placeholder="search by username or email" value={this.state.form.search} onChange={(e) => { this.handleSearchChange(e) }} />
                        </div>
                    </div>
                    : null}
                <div class="admin-notification-content">
                    {notifications.length > 0 && loaded == true ?
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }} >
                            {notifications.map((notif, idx) => {
                                return (
                                    <div class="admin-notification-item" style={{ backgroundColor: notif.viewed != true ? "#D7DBDD" : "#F2F3F4" }} >
                                        <div class="admin-notification-item-header">
                                            <div class="admin-notification-item-header-userinfo">
                                                <img src={HOST_URL + notif.student_img} />
                                                <div class="admin-notification-item-header-userinfo-data">
                                                    <p onClick={() => { this.goToStudent(notif.student_slug) }}>{notif.student_username}</p>
                                                    <small onClick={() => { this.goToStudent(notif.student_slug) }}>{notif.student_email}</small>
                                                </div>
                                            </div>
                                            <div class="admin-notification-item-header-actions">
                                            </div>
                                        </div>
                                        <div class="admin-notification-item-content">
                                            <p>{notif.event_msg} <span onClick={() => { this.goToNotif(notif.event_type, notif.event_slug, notif.student_slug) }}>more</span></p>
                                        </div>
                                        <div class="admin-notification-item-bottom">
                                            <p>{formatDateTime(notif.datetime)}</p>
                                        </div>
                                    </div>
                                )
                            })
                            }
                            {source != "dashboard" ? <center><Pagination count={count} page={page} variant="outlined" shape="rounded" onChange={this.handleChange} /></center> : null}
                        </div>
                        : notifications.length == 0 && loaded == false ?
                            < div style={{ height: "100vh", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }} >
                                <SyncLoader color={"#283747"} size={10} loading={true} />
                            </div>
                            :
                            <div class="admin-notification-content-empty">
                                <i class="material-icons">notifications</i>
                                <p>{NO_NOTIFICATION}</p>
                            </div>
                    }
                </div>
            </div >
        )
    }
}
export default withRouter(Notification);