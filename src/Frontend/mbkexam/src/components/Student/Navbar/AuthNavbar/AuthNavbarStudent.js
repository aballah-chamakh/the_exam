import React from 'react';
import jwt_decode from "jwt-decode";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import axios from 'axios';
import { HOST_URL, formatDateTime } from "../../../../config";
import './authnavbarstudent-scss.scss';
import $ from 'jquery';
import SyncLoader from "react-spinners/SyncLoader";



class AuthNavbarStudent extends React.Component {
    state = {
        student_notifications: [],
        loaded: false,
    }

    goToExam = (exam_slug) => {
        let token = localStorage.getItem('token')
        let studentprofile_slug = jwt_decode(token)['studentprofile_slug']
        console.log("/api/student/" + studentprofile_slug + "/exam/" + exam_slug + "/")
        $($('.notif-box')[0]).hide()
        let pathname = "/student/" + studentprofile_slug + "/exam/" + exam_slug + "/"
        this.props.history.push(
            {
                pathname: pathname,
                state: {
                    'student_notif': true,
                }
            })
    }
    handleResize = () => {
        if ($(window).width() < 600) {
            $($(".notif-box")[0]).hide()
            $($(".account-box")[0]).hide()
        } else {
            $($(".notif-box")[0]).hide()
            $($(".account-box")[0]).hide()
        }
        this.setNotifAccountArrow()
    }
    componentDidMount() {
        document.addEventListener('click', this.handleTheClick, true);
        window.addEventListener('resize', this.handleResize)
        let token = localStorage.getItem('token')
        let config = { headers: { Authorization: 'Bearer ' + token } }
        let studentprofile_slug = jwt_decode(token)['studentprofile_slug']
        let decodedToken = jwt_decode(token)
        let isTokenExpired = Date.now() >= decodedToken.exp * 1000;
        if (isTokenExpired) {
            this.refreshToken(studentprofile_slug, config)
        } else {
            this.getNotifications(studentprofile_slug)
        }
        this.setNotifAccountArrow()
        this.interval = setInterval(() => {
            token = localStorage.getItem('token')
            config = { headers: { Authorization: 'Bearer ' + token } }
            decodedToken = jwt_decode(token)
            let isTokenExpired = Date.now() >= decodedToken.exp * 1000
            if (isTokenExpired) {
                this.refreshToken(studentprofile_slug)
            } else {
                this.getNotifications(studentprofile_slug, config)
            }
        }, 5000)

    }
    getNotifications = (studentprofile_slug, config) => {
        axios.get(HOST_URL + "/api/studentprofile/" + studentprofile_slug + "/get_notifications/", config).then(res => {
            this.setState({ student_notifications: res.data, loaded: true })
        })
    }
    refreshToken = (studentprofile_slug) => {
        let refreshToken = localStorage.getItem("refresh_token")
        let data = { 'refresh': refreshToken }
        axios.post(HOST_URL + "/api/token/refresh/", data).then(res => {
            let token = res.data.access;
            refreshToken = res.data.refresh;
            localStorage.setItem('token', token)
            localStorage.setItem('refresh_token', refreshToken)
            let config = { headers: { Authorization: 'Bearer ' + token } }
            this.getNotifications(studentprofile_slug, config)
        })
    }
    componentWillUnmount() {
        document.removeEventListener('click', this.handleTheClick, true)
        window.removeEventListener('resize', this.handleResize)
        clearInterval(this.interval)
    }

    handleTheClick = (e) => {
        let target = $(e.target)[0];
        let token = localStorage.getItem('token')
        let studentprofile_username = jwt_decode(token)['studentprofile_username']
        let navTypeClass = ".authnavbar-container ";
        if (!$.contains($(navTypeClass)[0], target)) {
            navTypeClass = ".mobile-authnavbar-container "
        }
        if ($(navTypeClass + '.account-box-icon')[0] == target && $(navTypeClass + '.account-box').css('display') == 'none') {
            if ($(navTypeClass + '.notif-box').css('display') != 'none') {
                $(navTypeClass + '.notif-box').hide()
            }
            $(navTypeClass + '.account-box').show()
        } else if ($(navTypeClass + '.account-box-icon')[0] == target && $(navTypeClass + '.account-box').css('display') != 'none') {
            $(navTypeClass + '.account-box').hide()
        } else if ($(navTypeClass + '.notif-box-icon')[0] == target && $(navTypeClass + '.notif-box').css('display') == 'none') {

            if ($(navTypeClass + '.account-box').css('display') != 'none') {
                $(navTypeClass + '.account-box').hide()
            }
            $(navTypeClass + '.notif-box').show()
        } else if ($(navTypeClass + '.notif-box-icon')[0] == target && $(navTypeClass + '.notif-box').css('display') != 'none') {

            $(navTypeClass + '.notif-box').hide()
        } else if (($('.account-box-icon')[0] != target && $('.notif-box-icon')[0] != target && !$.contains($('.notif-box')[0], target) && !$.contains($('.account-box')[0], target)) && ($($('.account-box')[0]).css('display') != 'none' || $($('.notif-box')[0]).css('display') != 'none')) {
            console.log("hide both notif-box and account-box")
            $($('.notif-box')).hide()
            $($('.account-box')).hide()
        } else if (($('.account-box-icon')[1] != target && $('.notif-box-icon')[1] != target && !$.contains($('.notif-box')[1], target) && !$.contains($('.account-box')[1], target)) && ($($('.account-box')[1]).css('display') != 'none' || $($('.notif-box')[1]).css('display') != 'none')) {
            console.log("hide both notif-box and account-box")
            $($('.notif-box')[1]).hide()
            $($('.account-box')[1]).hide()
        }
    }
    goTo = (path) => {
        this.props.history.push(path)
    }
    handleAccount = (item) => {
        $('.account-box').hide()
        let studentprofile_slug = jwt_decode(localStorage.getItem('token'))['studentprofile_slug']
        switch (item) {
            case 'profile':
                this.props.history.push('/student/' + studentprofile_slug + '/')
                break;
            case 'setting':
                this.props.history.push('/student/' + studentprofile_slug + '/setting/')
                break;
            case 'support':
                this.props.history.push('/student/' + studentprofile_slug + '/support/')
                break;
            case 'logout':
                this.props.student_logout();
                this.props.history.push('/');
                break;
            default:

        }
    }
    setNotifAccountArrow = () => {

        let notifLeft = $(window).width() - $(".mobile-authnavbar-container .notif-box-icon").offset().left
        let accountLeft = $(window).width() - $(".mobile-authnavbar-container .account-box-icon").offset().left
        $(".mobile-authnavbar-container .notif-arrow").css('right', notifLeft - 28)
        $(".mobile-authnavbar-container .account-arrow").css('right', accountLeft - 28)

    }
    getStudentNotifications = () => {
        let studentNotifications = this.state.student_notifications.filter((student_notif) => {
            return student_notif.viewed == false;
        })
        return studentNotifications.length;
    }
    render() {
        let decoded_token = jwt_decode(localStorage.getItem('token'))
        let studentprofile_slug = decoded_token['studentprofile_slug']
        let studentprofile_username = decoded_token['studentprofile_username']
        let studentNotificationCount = this.getStudentNotifications()
        let loaded = this.state.loaded;
        return (
            <div class="student-authnavbar">
                <nav class="authnavbar-container">
                    <div class="authnavbar-logo" >
                        <span>mbk exam</span>
                    </div>
                    <ul class="authnavbar-items">
                        <li class="authnavbar-item" onClick={() => { this.goTo('/student/' + studentprofile_slug + '/') }} >
                            <p>{studentprofile_username}</p>
                        </li>
                        <li class="authnavbar-item" >
                            <i class="material-icons">help_outline</i>

                        </li>
                        <li class="authnavbar-item" >
                            <i class="material-icons notif-box-icon" >notifications_none</i>
                            {studentNotificationCount > 0 ?
                                <span class="notif-count">{studentNotificationCount}</span> : null}
                            <div class="notif-box">
                                <div class="notif-arrow" >

                                </div>
                                <div class="notif-header">
                                    <p>notification ({studentNotificationCount})</p>
                                </div>
                                {studentNotificationCount > 0 ?
                                    <ul class="notif-list">
                                        {this.state.student_notifications.map(student_notif => {
                                            return (
                                                <li class="notif-item" onClick={() => { this.goToExam(student_notif.event_slug) }}>
                                                    {!student_notif.viewed ? <i class="material-icons">notifications_active</i> : <i class="material-icons">notifications</i>}
                                                    <div class="notif-item-content">
                                                        <div style={{ width: "100%", display: 'flex', justifyContent: "space-between" }}>
                                                            <p class="notif-content-title">{student_notif.event_type}</p>
                                                            <span style={{ fontSize: "12px" }} >{formatDateTime(student_notif.datetime)}</span>
                                                        </div>
                                                        <p class="notif-content-text" >{student_notif.event_msg}</p>
                                                    </div>
                                                </li>
                                            )
                                        })

                                        }

                                    </ul>
                                    : studentNotificationCount == 0 && loaded == false ?
                                        <div class="empty-notif" style={{ height: "180px", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                            <SyncLoader color={"#283747"} size={10} loading={true} />
                                        </div>
                                        : <div class="empty-notif">
                                            <p>no notifications</p>
                                        </div>}
                            </div>
                        </li>
                        <li class="authnavbar-item" >
                            <i class="material-icons account-box-icon" >account_circle</i>
                            <div class="account-box">
                                <div class="account-arrow" >

                                </div>
                                <div class="account-header">
                                    <p>account</p>
                                </div>
                                <ul class="account-list">
                                    <li class="account-item" onClick={() => { this.handleAccount('setting') }}>
                                        <i class="material-icons">settings</i>
                                        <p>profile settings</p>
                                    </li>
                                    <li class="account-item" onClick={() => { this.handleAccount('support') }}>
                                        <i class='fas fa-assistive-listening-systems'></i>
                                        <p>support</p>
                                    </li>
                                    <li class="account-item" onClick={() => { this.handleAccount('logout') }}>
                                        <i class='fas fa-unlock-alt'></i>
                                        <p>logout</p>
                                    </li>
                                </ul>
                            </div>
                        </li>

                    </ul>
                </nav>
                <nav class="mobile-authnavbar-container">
                    <ul class="authnavbar-items">
                        <li class="authnavbar-item" >
                            <i class="material-icons">help_outline</i>
                        </li>
                        <li class="authnavbar-item" >
                            {studentNotificationCount > 0 ?
                                <span class="notif-count">{studentNotificationCount}</span> : null}
                            <i class="material-icons notif-box-icon" >notifications_none</i>
                            <div class="notif-box" >
                                <div class="notif-arrow" >

                                </div>
                                <div class="notif-header">
                                    <p>notification ({studentNotificationCount})</p>
                                </div>
                                {this.state.student_notifications.length > 0 ?
                                    <ul class="notif-list">
                                        {this.state.student_notifications.map(student_notif => {
                                            return (
                                                <li class="notif-item" onClick={() => { this.goToExam(student_notif.event_slug) }}>
                                                    {!student_notif.viewed ? <i class="material-icons">notifications_active</i> : <i class="material-icons">notifications</i>}
                                                    <div class="notif-item-content">
                                                        <div style={{ width: "100%", display: 'flex', justifyContent: "space-between" }}>
                                                            <p class="notif-content-title">{student_notif.event_type}</p>
                                                            <span style={{ fontSize: "12px" }} >{formatDateTime(student_notif.datetime)}</span>
                                                        </div>
                                                        <p class="notif-content-text" >{student_notif.event_msg}</p>
                                                    </div>
                                                </li>
                                            )
                                        })

                                        }
                                    </ul> :
                                    <div class="empty-notif">
                                        <p>no notifications</p>
                                    </div>
                                }
                            </div>
                        </li>
                        <li class="authnavbar-item" >
                            <i class="material-icons account-box-icon" >account_circle</i>
                            <div class="account-box" >
                                <div class="account-arrow" >

                                </div>
                                <div class="account-header">
                                    <p>account</p>
                                </div>
                                <ul class="account-list">
                                    <li class="account-item" onClick={() => { this.handleAccount('profile') }}>
                                        <i class='fas fa-user-alt'></i>
                                        <p>{studentprofile_username}</p>
                                    </li>
                                    <li class="account-item" onClick={() => { this.handleAccount('setting') }}>
                                        <i class="material-icons">settings</i>
                                        <p>profile settings</p>
                                    </li>
                                    <li class="account-item" onClick={() => { this.handleAccount('support') }}>
                                        <i class='fas fa-assistive-listening-systems'></i>
                                        <p>support</p>
                                    </li>
                                    <li class="account-item" onClick={() => { this.handleAccount('logout') }}>
                                        <i class='fas fa-unlock-alt'></i>
                                        <p>logout</p>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </ul>
                </nav>
            </div>

        )
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        student_logout: () => dispatch({ 'type': 'student_logout' })
    }
}
export default withRouter(connect(null, mapDispatchToProps)(AuthNavbarStudent));