import React from 'react';
import { HOST_URL, formatDateTime } from '../../../config';
import axios from "axios";
import { withRouter } from "react-router-dom";
import "./exams-scss.scss";
import jwt_decode from "jwt-decode";
import SyncLoader from "react-spinners/SyncLoader";
import Pagination from '@material-ui/lab/Pagination';


class Exams extends React.Component {
    state = {
        exams: [],
        loaded: false,
        count: null,
        page: 1,
        form: {
            search: "",
            status: ""
        }
    }
    componentDidMount() {
        window.scrollTo(0, 0)
        let token = localStorage.getItem('token')
        let config = { headers: { Authorization: 'Bearer ' + token } }
        let isTokenExpired = Date.now() >= jwt_decode(token).exp * 1000;
        if (isTokenExpired) {
            this.refreshTokenLoadExams()
        } else {
            this.loadExams(config)
        }
    }
    loadExams = (config) => {
        let url = HOST_URL + "/api/exam/"
        let search = this.state.form.search;
        let page = this.state.page;
        if (search && page) {
            url += "?search=" + search + "page=" + page
        }
        axios.get(url, config).then(res => {
            this.setState({ exams: res.data.exams, count: res.data.count, loaded: true })
        })
    }
    refreshTokenLoadExams = () => {
        let refreshToken = localStorage.getItem("refresh_token")
        let data = { 'refresh': refreshToken }
        axios.post(HOST_URL + "/api/token/refresh/", data).then(res => {
            let token = res.data.access;
            refreshToken = res.data.refresh;
            localStorage.setItem('token', token)
            localStorage.setItem('refresh_token', refreshToken)
            let config = { headers: { Authorization: 'Bearer ' + token } }
            this.loadExams(config)
        })
    }
    goTo = (path) => {
        this.props.history.push(path)
    }
    handleSearchChange = (e, field, page) => {
        let search = this.state.form.search;
        let status = this.state.form.status;
        if (e) {
            if (field == 'status') {
                status = e.target.value;
                this.setState({ form: { ...this.state.form, status: status } })
            } else if (field == 'search') {
                search = e.target.value;
                this.setState({ form: { ...this.state.form, search: search } })
            }
        }
        let token = localStorage.getItem("token")
        let isTokenExpired = Date.now() >= jwt_decode(token).exp * 1000;
        let config = { headers: { Authorization: 'Bearer ' + token } }
        page = page || this.state.page;

        if (isTokenExpired) {
            let refreshToken = localStorage.getItem("refresh_token")
            let data = { 'refresh': refreshToken }
            axios.post(HOST_URL + "/api/token/refresh/", data).then(res => {
                let token = res.data.access;
                refreshToken = res.data.refresh;
                localStorage.setItem('token', token)
                localStorage.setItem('refresh_token', refreshToken)
                config = { headers: { Authorization: 'Bearer ' + token } }
                this.loadSearchedExams(search, status, config, page)
            })
        } else {
            this.loadSearchedExams(search, status, config, page)
        }

    }
    handleChange = (e, page) => {
        this.setState({ page: page })
        this.handleSearchChange(null, null, page)
    }
    loadSearchedExams = (search, status, config, page) => {
        let url = HOST_URL + "/api/exam/custom_search/"
        url += "?search=" + search + "&status=" + status + "&page=" + page
        axios.get(url, config).then(res => {
            this.setState({ exams: res.data.exams, count: res.data.count })
        })
    }
    render() {
        let exams = this.state.exams;
        let token = localStorage.getItem('token')
        let decoded_token = jwt_decode(token)
        let adminprofile_slug = decoded_token['adminprofile_slug']
        let loaded = this.state.loaded;
        let page = this.state.page;
        let count = this.state.count;
        return (
            <>
                <div class="admin-examlist-container">
                    <div class="admin-examlist-header">
                        <p>mbk Exams</p>
                    </div>
                    <div class="admin-examlist-content-search">
                        <div class="form-group" >
                            <input class="form-control" id="search" for="search" placeholder="search by username or email" value={this.state.form.search} onChange={(e) => { this.handleSearchChange(e, 'search') }} />
                        </div>
                        <div class="form-group">
                            <select class="form-control" onChange={(e) => this.handleSearchChange(e, 'status')} value={this.state.form.status} >
                                <option value={"exam_status"} selected>exam status</option>
                                <option value="in_review">In Review</option>
                                <option value="on_going">On going</option>
                                <option value="failed">Failed</option>
                                <option value="succeeded">Succeeded</option>
                            </select>
                        </div>
                    </div>
                    <div class="admin-examlist-content">
                        {exams.length > 0 ?
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <table class="table table-striped">
                                    <thead style={{ backgroundColor: '#283747', color: 'white' }}>
                                        <tr>
                                            <th scope="col">student image</th>
                                            <th scope="col">student email</th>
                                            <th scope="col">student username</th>
                                            <th scope="col">exam name</th>
                                            <th scope="col">exam status</th>
                                            <th scope="col">started at</th>
                                            <th scope="col">end at</th>
                                            <th scope="col">detail</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {exams.map(exam => {
                                            return (
                                                <tr key={exam.id}>
                                                    <td><img src={HOST_URL + exam.student_image} /></td>
                                                    <td>{exam.student_email}</td>
                                                    <td>{exam.student_username}</td>
                                                    <td>{exam.name}</td>
                                                    <td>{exam.status}</td>
                                                    <td>{formatDateTime(exam.start_at)}</td>
                                                    <td>{formatDateTime(exam.end_at)}</td>
                                                    <td><button onClick={() => { this.goTo("/mbk_admin/" + adminprofile_slug + "/student/" + exam.student_slug + "/exam/" + exam.slug + "/") }} ><i class="material-icons">remove_red_eye</i></button></td>
                                                </tr>
                                            )
                                        })
                                        }
                                    </tbody>
                                </table>
                                <center><Pagination count={count} page={page} variant="outlined" shape="rounded" onChange={this.handleChange} /></center>
                            </div>
                            : exams.length == 0 && loaded == false ?
                                <div style={{ height: "100vh", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                    <SyncLoader color={"#283747"} size={10} loading={true} />
                                </div>
                                : <div class="admin-examlist-content-empty" >
                                    <i class='fas fa-clipboard-list'></i>
                                    <p>no exam was created yet</p>
                                </div>
                        }
                    </div>

                </div>
            </>
        )
    }
}
export default withRouter(Exams);