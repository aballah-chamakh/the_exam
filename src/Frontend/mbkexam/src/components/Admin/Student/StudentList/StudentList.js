import React from 'react';
import { HOST_URL, formatDateTime, NO_STUDENT } from '../../../../config';
import axios from "axios";
import { withRouter } from "react-router-dom";
import "./studentlist-scss.scss";
import jwt_decode from "jwt-decode";
import SyncLoader from "react-spinners/SyncLoader";
import Pagination from '@material-ui/lab/Pagination';


class StudentList extends React.Component {
    state = {
        students: [],
        loaded: false,
        count: null,
        page: 1,
        form: {
            search: "",
        }
    }
    componentDidMount() {
        window.scrollTo(0, 0)
        let token = localStorage.getItem('token')
        let config = { headers: { Authorization: 'Bearer ' + token } }
        let isTokenExpired = Date.now() >= jwt_decode(token).exp * 1000;
        if (isTokenExpired) {
            this.refreshTokenLoadStudent()
        } else {
            this.loadStudents(config)
        }
    }
    loadStudents = (config) => {
        let url = HOST_URL + "/api/studentprofile/"
        let search = this.state.form.search;
        let page = this.state.page;
        if (search && page) {
            url += "?search=" + search + "page=" + page
        }
        axios.get(url, config).then(res => {
            this.setState({ students: res.data.students, count: res.data.count, loaded: true })
        })
    }
    refreshTokenLoadStudent = () => {
        let refreshToken = localStorage.getItem("refresh_token")
        let data = { 'refresh': refreshToken }
        axios.post(HOST_URL + "/api/token/refresh/", data).then(res => {
            let token = res.data.access;
            refreshToken = res.data.refresh;
            localStorage.setItem('token', token)
            localStorage.setItem('refresh_token', refreshToken)
            let config = { headers: { Authorization: 'Bearer ' + token } }
            this.loadStudents(config)
        })
    }
    goTo = (path) => {
        this.props.history.push(path)
    }
    handleSearchChange = (e, page) => {
        let value = this.state.form.search;
        if (e) {
            value = e.target.value;
        }
        let token = localStorage.getItem("token")
        let isTokenExpired = Date.now() >= jwt_decode(token).exp * 1000;
        let config = { headers: { Authorization: 'Bearer ' + token } }
        page = page || this.state.page;
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
                this.loadSearchedStudentProfile(value, config, page)
            })
        } else {
            this.loadSearchedStudentProfile(value, config, page)
        }

    }
    handleChange = (e, page) => {
        this.setState({ page: page })
        this.handleSearchChange(null, page)
    }
    loadSearchedStudentProfile = (search, config, page) => {
        let url = HOST_URL + "/api/studentprofile/custom_search"
        url += "?search=" + search + "&page=" + page
        axios.get(url, config).then(res => {
            this.setState({ students: res.data.students, count: res.data.count })
        })
    }
    render() {
        let students = this.state.students;
        let token = localStorage.getItem('token')
        let decoded_token = jwt_decode(token)
        let adminprofile_slug = decoded_token['adminprofile_slug']
        let loaded = this.state.loaded;
        let page = this.state.page;
        let count = this.state.count;
        return (
            <>
                <div class="admin-studentlist-container">
                    <div class="admin-studentlist-header">
                        <p>mbk students</p>
                    </div>
                    <div class="admin-studentlist-content-search">
                        <div class="form-group" >
                            <input class="form-control" id="search" for="search" placeholder="search by username or email" value={this.state.form.search} onChange={(e) => { this.handleSearchChange(e) }} />
                        </div>
                    </div>
                    <div class="admin-studentlist-content">
                        {students.length > 0 ?
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <table class="table table-striped">
                                    <thead style={{ backgroundColor: '#283747', color: 'white' }}>
                                        <tr>
                                            <th scope="col">image</th>
                                            <th scope="col">email</th>
                                            <th scope="col">username</th>
                                            <th scope="col">joined at</th>
                                            <th scope="col">exams taken</th>
                                            <th scope="col">detail</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map(student => {
                                            return (
                                                <tr key={student.id}>
                                                    <td><img src={HOST_URL + student.image} /></td>
                                                    <td>{student.email}</td>
                                                    <td>{student.username}</td>
                                                    <td>{formatDateTime(student.joined_at)}</td>
                                                    <td>{student.exams_taken}</td>
                                                    <td><button onClick={() => { this.goTo("/mbk_admin/" + adminprofile_slug + "/student/" + student.slug + "/") }} ><i class="material-icons">remove_red_eye</i></button></td>
                                                </tr>
                                            )
                                        })
                                        }
                                    </tbody>
                                </table>
                                <center><Pagination count={count} page={page} variant="outlined" shape="rounded" onChange={this.handleChange} /></center>
                            </div>
                            : students.length == 0 && loaded == false ?
                                <div style={{ height: "100vh", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <SyncLoader color={"#283747"} size={10} loading={true} />
                                </div>
                                : <div class="admin-studentlist-content-empty" >
                                    <i class='fas fa-user-friends'></i>
                                    <p>no student was created yet</p>
                                </div>
                        }
                    </div>

                </div>
            </>
        )
    }
}
export default withRouter(StudentList);