import React from "react";
import axios from "axios";
import { HOST_URL, formatDateTime, NO_CLAIM } from "../../../config";
import { withRouter } from "react-router-dom"
import SyncLoader from "react-spinners/SyncLoader";
import "./claims-scss.scss";
import jwt_decode from "jwt-decode";
import Pagination from '@material-ui/lab/Pagination';

class Claims extends React.Component {
    state = {
        claims: [

        ],
        claim_detail: null,
        loaded: false,
        form: {
            search: "",
        },
        page: 1,
        count: null,
    }
    componentDidMount() {
        window.scrollTo(0, 0)
        let claim_slug = this.props.match.params.claim_slug
        let token = localStorage.getItem('token')
        let config = { headers: { Authorization: 'Bearer ' + token } }
        let isTokenExpired = Date.now() >= jwt_decode(token).exp * 1000;
        if (isTokenExpired) {
            this.refeshTokenLoadClaims(claim_slug)
        } else {
            this.loadClaims(claim_slug, config)
        }
    }

    refeshTokenLoadClaims = (claim_slug) => {
        let refreshToken = localStorage.getItem("refresh_token")
        let data = { 'refresh': refreshToken }
        axios.post(HOST_URL + "/api/token/refresh/", data).then(res => {
            let token = res.data.access;
            refreshToken = res.data.refresh;
            localStorage.setItem('token', token)
            localStorage.setItem('refresh_token', refreshToken)
            let config = { headers: { Authorization: 'Bearer ' + token } }
            this.loadClaims(claim_slug, config)
        })
    }
    loadClaims = (claim_slug, config) => {
        if (claim_slug) {
            axios.get(HOST_URL + "/api/studentclaim/" + claim_slug + "/", config).then(res => {
                this.setState({ claim_detail: res.data, loaded: true })
            })
        } else {
            let url = HOST_URL + "/api/studentclaim/"
            let page = this.state.page;
            let search = this.state.search;
            if (page && search) {
                url += "?page=" + page + "&search=" + search;
            }
            axios.get(url, config).then(res => {
                this.setState({ claims: res.data.claims, count: res.data.count, loaded: true })
            })
        }
    }
    goToStudent = (student_slug) => {
        let adminprofile_slug = this.props.match.params.adminprofile_slug;
        this.props.history.push("/mbk_admin/" + adminprofile_slug + "/student/" + student_slug + "/")
    }
    goToClaim = (claim_slug) => {
        let adminprofile_slug = this.props.match.params.adminprofile_slug;
        this.props.history.push("/mbk_admin/" + adminprofile_slug + "/claim/" + claim_slug + "/")
    }
    handleSearchChange = (e, page) => {
        let value = this.state.form.search;
        if (e) {
            value = e.target.value;
        }
        let token = localStorage.getItem("token")
        let config = { headers: { Authorization: 'Bearer ' + token } }
        let isTokenExpired = Date.now() >= jwt_decode(token).exp * 1000;
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
                this.loadStudentClaimSearch(value, config, page)
            })
        } else {
            this.loadStudentClaimSearch(value, config, page)
        }
    }
    handleChange = (e, value) => {
        this.setState({ page: value })
        this.handleSearchChange(null, value)
    }
    loadStudentClaimSearch = (search, config, page) => {
        axios.get(HOST_URL + "/api/studentclaim/?search=" + search + "&page=" + page, config).then(res => {
            this.setState({ claims: res.data.claims, count: res.data.count })
        })
    }

    render() {
        let claim_slug = this.props.match.params.claim_slug;
        let claim_detail = this.state.claim_detail;
        let loaded = this.state.loaded;
        let claims = this.state.claims;
        let count = this.state.count;
        let page = this.state.page;
        return (
            <div class="claims-student-container">
                <div class="claims-student-header">
                    {claim_slug ? <p>Claim Detail</p> : <p>Claims</p>}
                    <hr />
                </div>
                <div class="admin-claim-content-search">
                    <div class="form-group" >
                        <input class="form-control" id="search" for="search" placeholder="search by username or email" value={this.state.form.search} onChange={(e) => { this.handleSearchChange(e) }} />
                    </div>
                </div>
                <div class="claims-student-content">
                    {claim_slug && claim_detail ?
                        <div class="student-claim-item">
                            <div class="student-claim-item-header">
                                <img src={HOST_URL + claim_detail.student_img} />
                                <div class="student-claim">
                                    <p onClick={() => { this.goToStudent(claim_detail.student_slug) }} >{claim_detail.student_username}</p>
                                    <small onClick={() => { this.goToStudent(claim_detail.student_slug) }} >{claim_detail.student_email}</small>
                                </div>
                            </div>
                            <div class="student-claim-item-content">
                                <p>Subject : {claim_detail.subject}</p>
                                <p>{claim_detail.content}</p>
                            </div>
                            <div class="student-claim-item-footer">
                                <p>{claim_detail.datetime}</p>
                            </div>
                        </div>
                        : claims.length > 0 && loaded == true ?
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>

                                {claims.map(claim => {
                                    return (
                                        <div key={claim.id} class="student-claim-item" style={{ backgroundColor: claim.viewed != true ? "#D7DBDD" : "#F2F3F4" }}>
                                            <div class="student-claim-item-header">
                                                <img src={HOST_URL + claim.student_img} />
                                                <div class="student-claim">
                                                    <p onClick={() => { this.goToStudent(claim.student_slug) }}>{claim.student_username}</p>
                                                    <small onClick={() => { this.goToStudent(claim.student_slug) }} >{claim.student_email}</small>
                                                </div>
                                            </div>
                                            <div class="student-claim-item-content">
                                                <p>Subject : {claim.subject}</p>
                                                <p>Content : {claim.content.substr(0, 100)} <span onClick={() => { this.goToClaim(claim.slug) }}>{claim.content > 100 ? "more" : null}</span></p>
                                            </div>
                                            <div class="student-claim-item-footer">
                                                <p>{formatDateTime(claim.datetime)}</p>
                                            </div>
                                        </div>
                                    )
                                })
                                }
                                <Pagination count={count} page={page} variant="outlined" shape="rounded" onChange={this.handleChange} />
                            </div>
                            : loaded == true ?
                                <div class="claims-student-content-empty">
                                    <i class="fas fa-assistive-listening-systems"></i>
                                    <p>{NO_CLAIM}</p>
                                </div>

                                : null}
                </div>
                {!loaded ?
                    < div style={{ height: "100vh", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <SyncLoader color={"#283747"} size={10} loading={true} />
                    </div>
                    : null
                }


            </div>
        )
    }
}

export default withRouter(Claims);