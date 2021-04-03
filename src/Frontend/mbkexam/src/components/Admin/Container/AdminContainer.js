import React from "react";
import { Route, Switch } from "react-router-dom";
import StudentList from "../Student/StudentList/StudentList";
import StudentDetail from "../Student/StudentDetail/StudentDetail";
import Sidebar from "../Sidebar/Sidebar";
import HiddenSidebar from "../HiddenSidebar/HiddenSidebar";
import AccountSetting from "../AccountSetting/AccountSetting";
import ExamSetting from "../ExamSetting/ExamSetting";
import Notification from "../Notification/Notification";
import Exams from "../Exams/Exams";
import Claims from "../Claim/Claims";
import $ from 'jquery';
import Dashboard from "../Dashboard/Dashboard";
import "./admincontainer-scss.scss";
import axios from 'axios';
import { HOST_URL } from '../../../config';
import jwt_decode from "jwt-decode";
import NotFoundAdmin from "../NotFoundAdmin/NotFoundAdmin"
import NotFoundStudent from "../../NotFoundStudent/NotFoundStudent";

class AdminContainer extends React.Component {
    state = {
        loaded: false,
        notification_count: null,
    }

    componentDidMount = () => {
        console.log("admin container  =====================================================")
        this.calcContentWidth()
        window.addEventListener('resize', this.calcContentWidth)
        let token = localStorage.getItem("token")
        let config = { headers: { Authorization: 'Bearer ' + token } }
        let adminprofile_slug = this.props.match.params.adminprofile_slug;
        let isTokenExpired = Date.now() >= jwt_decode(token).exp * 1000
        if (isTokenExpired) {
            this.loadNotifications(adminprofile_slug, config)
        } else {
            this.refreshLoadNotifications(adminprofile_slug)
        }
        this.interval = setInterval(() => {
            token = localStorage.getItem("token")
            isTokenExpired = Date.now() >= jwt_decode(token).exp * 1000
            config = { headers: { Authorization: 'Bearer ' + token } }
            if (!isTokenExpired) {
                console.log("load notification ========== ===============")
                this.loadNotifications(adminprofile_slug, config)
            } else {
                console.log("load refresh notification ========== ===============")
                this.refreshLoadNotifications(adminprofile_slug)
            }
        }, 5000)

        //this.setState({loaded:true})

    }
    loadNotifications = (adminprofile_slug, config) => {
        axios.get(HOST_URL + "/api/adminprofile/" + adminprofile_slug + "/get_notification_count/", config).then(res => {
            this.setState({ notification_count: res.data.notification_count })
        })
    }
    refreshLoadNotifications = (adminprofile_slug) => {
        let refreshToken = localStorage.getItem("refresh_token")
        let data = { 'refresh': refreshToken }
        axios.post(HOST_URL + "/api/token/refresh/", data).then(res => {
            let token = res.data.access;
            refreshToken = res.data.refresh;
            localStorage.setItem('token', token)
            localStorage.setItem('refresh_token', refreshToken)
            let config = { headers: { Authorization: 'Bearer ' + token } }
            this.loadNotifications(adminprofile_slug, config)
        })
    }
    componentWillUnmount = () => {
        window.removeEventListener('resize', this.calcContentWidth)
        clearInterval(this.interval)
    }
    openSideBar = (inner) => {
        $('.hidden-sidebar-container').hide();
        $('.sidebar-container').show();
        $('.admin-container-content').css('margin-left', '250px')
        if (!inner) {
            this.calcContentWidth()
        }
    }
    closeSidebar = (inner) => {
        $('.sidebar-container').hide();
        $('.hidden-sidebar-container').show()
        $('.admin-container-content').css('margin-left', '50px')
        if (!inner) {
            this.calcContentWidth()
        }

    }
    calcContentWidth = () => {
        if ($(window).width() < 600 && $('.sidebar-container').css('display') != 'none') {
            this.closeSidebar(true)
        }
        let is_sidebar = $('.sidebar-container').css('display')
        let margin_left = 0
        if (is_sidebar != 'none') {
            margin_left = $('.sidebar-container').width()
        } else {
            margin_left = $('.hidden-sidebar-container').width()
        }
        let container_width = $(window).width() - margin_left;
        $(".admin-container-content").css("max-width", container_width)
        $(".admin-container-content").width(container_width)
        $(".examdetail-result-error").width(container_width - 82)
    }

    render() {
        /*let is_sidebar = $('.sidebar-container').css('display')
        let margin_left = 0 
        if(is_sidebar != 'none'){
            margin_left =  $('.sidebar-container').width() 
        }else{
            margin_left = $('.hidden-sidebar-container').width()      
        }
        $(".admin-container-content").width(($(window).width()-margin_left).toString()+"px")
        console.log("start here !! ")
        console.log($(".admin-container-content").width())
        console.log(margin_left)
        console.log($(window).width()-margin_left)
        console.log("en here !!: ")*/
        let adminprofile_slug = this.props.match.params.adminprofile_slug;
        let pathname = window.location.pathname
        let notification_count = this.state.notification_count
        if (pathname == "/mbk_admin/" + adminprofile_slug + "/" || pathname == "/mbk_admin/" + adminprofile_slug) {
            this.props.history.push("/mbk_admin/" + adminprofile_slug + "/students/")
        }
        return (
            <div class="admincontainer-container" >
                <div class="admin-container-sidebar">
                    <HiddenSidebar openSideBar={this.openSideBar} />
                    <Sidebar closeSidebar={this.closeSidebar} notification_count={notification_count} />
                </div>
                <div class="admin-container-content">
                    <Switch>
                        <Route path="/mbk_admin/:adminprofile_slug/students/" exact component={StudentList} />
                        <Route path="/mbk_admin/:adminprofile_slug/student/:studentprofile_slug/" render={() => <StudentDetail source="admin" />} />
                        <Route path="/mbk_admin/:adminprofile_slug/account_setting/" exact component={AccountSetting} />
                        <Route path="/mbk_admin/:adminprofile_slug/exam_setting/" exact component={ExamSetting} />
                        <Route path="/mbk_admin/:adminprofile_slug/notifications/" exact render={() => <Notification />} />
                        <Route path="/mbk_admin/:adminprofile_slug/dashboard/" exact render={() => <Dashboard notification_count={notification_count} />} />
                        <Route path="/mbk_admin/:adminprofile_slug/claims/" exact component={Claims} />
                        <Route path="/mbk_admin/:adminprofile_slug/claim/:claim_slug/" exact render={() => <div><Claims /></div>} />
                        <Route path="/mbk_admin/:adminprofile_slug/exams/" component={Exams} />
                        <Route component={NotFoundStudent} />
                    </Switch>
                </div>
            </div>
        )
    }
}
export default AdminContainer;