import React from 'react';
import AnyNavbarStudent from '../Student/Navbar/AnyNavbar/AnyNavbarStudent';
import { Switch, Route, withRouter } from 'react-router-dom';
import StudentProfile from "../Student/Profile/StudentProfile";
import AuthNavbarStudent from '../Student/Navbar/AuthNavbar/AuthNavbarStudent';
import StudentProfileSetting from "../Student/ProfileSetting/StudentProfileSetting";
import StudentSupport from "../Student/Support/StudentSupport";
import LoginAdmin from "../Admin/Authentication/Login/LoginAdmin";
import AnyAdminNavbar from '../Admin/Navbar/AnyAdminNavbar';
import AdminContainer from '../Admin/Container/AdminContainer';
import ExamDetail from "../Student/Exam/ExamDetail/ExamDetail";
import LandingPage from "../LandingPage/LandingPage";
import jwt_decode from "jwt-decode";
import { connect } from "react-redux";
import NotFoundStudent from "../NotFoundStudent/NotFoundStudent";

class Routing extends React.Component {
    state = {
        reload: false,
        loaded: false,
    }
    componentDidMount() {
        /*window.addEventListener('storage', this.handleStorageChange)
        let token = localStorage.getItem('token')

        if (token) {
            let decoded_token = jwt_decode(token)
            if (decoded_token.is_student) {
                this.props.student_login()
            } else if (decoded_token.is_admin) {
                this.props.admin_login()
            }
        }*/
        this.setState({ loaded: true })


    }
    /*
    handleStorageChange = () => {
        this.props.user_logout()
        this.props.history.push("/")
    }
    componentWillUnmount = () => {
        window.removeEventListener('storage', this.handleStorageChange)
    }*/
    render() {

        let token = localStorage.getItem('token')
        let is_student = false;
        let is_admin = false;
        if (token) {
            let decoded_token = jwt_decode(token)
            is_student = decoded_token['is_student']
            is_admin = decoded_token['is_admin']
            let pathname = window.location.pathname
            if (is_admin) {
                let adminprofile_slug = decoded_token['adminprofile_slug']
                if (!(pathname.startsWith("/mbk_admin/" + adminprofile_slug + "/") || pathname.startsWith("/mbk_admin/" + adminprofile_slug))) {
                    this.props.history.push("/mbk_admin/" + adminprofile_slug + "/")
                }
            } else if (is_student) {
                let studentprofile_slug = decoded_token['studentprofile_slug']
                if (!(pathname.startsWith("/student/") || pathname.startsWith("/student"))) {
                    this.props.history.push("/student/" + studentprofile_slug + "/")
                }
            }
        }
        let student_authenticated = this.props.student_authenticated;
        let admin_authenticated = this.props.admin_authenticated;
        if (is_student && student_authenticated == false) {
            this.props.student_login()
        } else if (is_admin && admin_authenticated == false) {
            this.props.admin_login()
        }
        let pathname = window.location.pathname
        let loaded = this.state.loaded;
        console.log("admin_authenticated : " + admin_authenticated + " / token : " + token + " / is_admin : " + is_admin)
        return (

            <div class="routing-container">
                {loaded ?
                    <div>
                        {token && is_student && student_authenticated ?
                            <AuthNavbarStudent /> :
                            token && is_admin && admin_authenticated ?
                                null :
                                pathname == "/mbk_admin" || pathname == "/mbk_admin/" ?
                                    <AnyAdminNavbar /> :
                                    null
                        }
                        {token && is_student && student_authenticated ?
                            <Switch>
                                <Route path="/student/:studentprofile_slug/setting/" exact component={StudentProfileSetting} />
                                <Route path="/student/:studentprofile_slug/support/" exact component={StudentSupport} />
                                <Route path="/student/:studentprofile_slug/" render={() => <StudentProfile source="student" />} />
                                <Route render={() => <NotFoundStudent source="student" />} />
                            </Switch>
                            : token && is_admin && admin_authenticated ?
                                <>
                                    <Route path="/mbk_admin/:adminprofile_slug/" component={AdminContainer} />
                                </>
                                :
                                <Switch>
                                    <Route path="/" exact component={LandingPage} />
                                    <Route path="/mbk_admin/" exact component={LoginAdmin} />
                                    <Route render={() => <NotFoundStudent source="admin" />} />
                                </Switch>
                        }
                    </div>
                    : null}
            </div>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        student_authenticated: state.student_authenticated,
        admin_authenticated: state.admin_authenticated
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        'student_login': () => dispatch({ type: 'student_login' }),
        'admin_login': () => dispatch({ type: 'admin_login' }),
        'user_logout': () => dispatch({ type: 'user_logout' }),

    }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Routing));