import React from 'react';
import { HOST_URL, formatDateTime } from '../../../config';
import axios from 'axios';
import { Route, Switch, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import './studentprofile-scss.scss';
import StudentExamList from '../Exam/ExamList/StudentExamList';
import ExamCreateModal from '../Exam/ExamCreateModal/ExamCreateModal';
import ExamDetail from '../Exam/ExamDetail/ExamDetail';
import SyncLoader from "react-spinners/SyncLoader";
import $ from "jquery";
import jwt_decode from "jwt-decode";
import NotFoundStudent from "../../NotFoundStudent/NotFoundStudent";

class StudentProfile extends React.Component {
    state = {
        studentprofile: null,
        newExamVisibiliy: false,
        loaded: false,
        windowWindow: $(window).width()
    }
    nb = 0
    componentDidUpdate(prevProps) {

        let source = this.props.source
        if (this.props.match.params != prevProps.match.params && source != "admin") {
            window.scrollTo(0, 0)
            let token = localStorage.getItem('token')
            let config = { headers: { Authorization: 'Bearer ' + token } }
            let decodedToken = jwt_decode(token)
            let tokenExpirationDate = decodedToken.exp * 1000
            if (Date.now() >= tokenExpirationDate) { // expired !! 
                this.refreshToken()
            } else {
                this.loadStudentProfile(config)
            }

        }



    }
    componentDidMount() {

        window.scrollTo(0, 0)
        window.addEventListener("resize", this.handleResize)
        let studentprofile_slug_url = this.props.match.params.studentprofile_slug;
        let token = localStorage.getItem("token")
        let decodedToken = jwt_decode(token)
        console.log("token baby ===========================================================================")
        console.log(decodedToken)
        let studentprofile_slug_original = decodedToken['studentprofile_slug']
        let source = this.props.source
        if (studentprofile_slug_url != studentprofile_slug_original && source != "admin") {
            this.props.history.push("/student/" + studentprofile_slug_original + "/")
        }
        let admin_notif = this.props.location.state;
        if (admin_notif) {
            admin_notif = this.props.location.state.admin_notif;
        } else {
            admin_notif = false;
        }
        let config = { headers: { Authorization: 'Bearer ' + token } }
        let tokenExpirationDate = decodedToken.exp * 1000
        if (Date.now() >= tokenExpirationDate) { // expired !! 
            this.refreshToken()
        } else {
            this.loadStudentProfile(config)
        }

    }
    refreshToken = () => {
        let refreshToken = localStorage.getItem("refresh_token")
        let data = { 'refresh': refreshToken }
        axios.post(HOST_URL + "/api/token/refresh/", data).then(res => {
            let token = res.data.access;
            refreshToken = res.data.refresh;
            localStorage.setItem('token', token)
            localStorage.setItem('refresh_token', refreshToken)
            let config = { headers: { Authorization: 'Bearer ' + token } }
            this.loadStudentProfile(config)
        })
    }
    loadStudentProfile = (config) => {
        let studentprofile_slug_url = this.props.match.params.studentprofile_slug;
        axios.get(HOST_URL + '/api/studentprofile/' + studentprofile_slug_url + "/", config).then(res => {
            this.setState({ studentprofile: res.data, loaded: true })
            this.calcAlertWidth()
        }).catch((err) => {
            this.setState({ loaded: false })
        })
    }
    handleResize = () => {
        this.setState({ windowWidth: $(window).width() })
    }
    componentWillUnmount = () => {
        window.removeEventListener("resize", this.handleResize)
        this.setState({ loaded: false })
    }
    calcAlertWidth = () => {
        let is_sidebar = $('.sidebar-container').css('display')
        let margin_left = 0
        if (is_sidebar != 'none') {
            margin_left = $('.sidebar-container').width()
        } else {
            margin_left = $('.hidden-sidebar-container').width()
        }
        let container_width = $(window).width() - margin_left - 82;
        $(".examdetail-result-error").width(container_width)
    }
    close = () => {
        this.setState({ newExamVisibiliy: false })
    }
    open = () => {
        this.setState({ newExamVisibiliy: true })
    }
    openAlert = () => {
        $(".examdetail-result-error").show(200)
    }
    closeAlert = () => {
        $(".examdetail-result-error").hide(200)
    }

    render() {
        let studentprofile = this.state.studentprofile
        let source = this.props.source
        let loaded = this.state.loaded;
        this.nb += 1;
        let windowWidth = this.state.windowWidth || $(window).width();
        return (
            <div style={{ position: 'relative' }}>
                {this.state.newExamVisibiliy ?
                    <ExamCreateModal visible={this.state.newExamVisibiliy} close={this.close} exam_days={studentprofile.exam_days} />
                    : null}

                {studentprofile ?
                    <div class="studentprofile-container" style={{ maxWidth: source == "admin" ? "100%" : "1080px" }} >
                        <div class="alert alert-danger examdetail-result-error" role="alert">
                            <p>you forgot to upload the certificate</p>
                            <i class="material-icons" onClick={this.closeAlert} >close</i>
                        </div>
                        <div class="student-profile-header" style={{ marginTop: windowWidth < 600 && source != "admin" ? "150px" : source != "admin" ? "100px" : "0px" }}>
                            <img src={HOST_URL + studentprofile.image} />
                            <p>{studentprofile.username}</p>
                        </div>
                        <hr />
                        <div class="student-profile-content">

                            {source == "admin" ?
                                <Switch>
                                    <Route path="/mbk_admin/:adminprofile_slug/student/:studentprofile_slug/" exact render={() => <StudentExamList open={this.open} exams={studentprofile.exams} source={source} new_exam_allowed={studentprofile.new_exam_allowed} loaded={loaded} />} />
                                    <Route path="/mbk_admin/:adminprofile_slug/student/:studentprofile_slug/exam/:exam_slug/" exact render={() => <ExamDetail source={source} openAlert={this.openAlert} closeAlert={this.closeAlert} />} />
                                    <Route component={NotFoundStudent} />
                                </Switch>
                                : <Switch>
                                    <Route path="/student/:studentprofile_slug/" exact render={() => <StudentExamList open={this.open} exams={studentprofile.exams} new_exam_allowed={studentprofile.new_exam_allowed} loaded={loaded} />} />
                                    <Route path="/student/:studentprofile_slug/exam/:exam_slug/" exact component={ExamDetail} />
                                    <Route component={NotFoundStudent} />
                                </Switch>}
                        </div>
                    </div> :
                    !loaded ?
                        <div style={{ height: "100vh", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <SyncLoader color={"#283747"} size={10} loading={true} />
                        </div> : null}
            </div>

        )

    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        student_logout: () => dispatch({ type: 'student_logout' })
    }
}
export default withRouter(connect(null, mapDispatchToProps)(StudentProfile));