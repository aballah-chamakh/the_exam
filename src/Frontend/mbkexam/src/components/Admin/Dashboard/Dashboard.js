import React from 'react';
import axios from "axios";
import Notication from "../Notification/Notification";
import { HOST_URL } from "../../../config";
import SyncLoader from "react-spinners/SyncLoader";
import { withRouter } from "react-router-dom";
import "./dashboard-scss.scss";
import jwt_decode from "jwt-decode";

class Dashboard extends React.Component {
    state = {
        kpis: null,
    }

    componentDidMount = () => {
        window.scrollTo(0, 0)
        this.interval = setInterval(() => {
            let token = localStorage.getItem("token")
            let data = { 'token': token }
            let isTokenExpired = Date.now() >= jwt_decode(token).exp * 1000
            if (isTokenExpired) {
                this.refreshTokenLoadDashboard()
            } else {
                this.loadDashboard(data)
            }
        }, 5000)
    }
    loadDashboard = (data) => {
        axios.post(HOST_URL + "/api/get_dashboard/", data).then(res => {
            let kpis = res.data;
            let success_rate = kpis[1].nb == 0 ? 1 : (kpis[2].nb / kpis[1].nb).toFixed(2);
            let certified_uncertified_ratio = kpis[3].nb == 0 ? 1 : kpis[2].nb / kpis[3].nb;
            kpis.push({ description: "succes rate", nb: success_rate })
            kpis.push({ description: "certified/uncertified ratio", nb: certified_uncertified_ratio.toFixed(2) })
            this.setState({ kpis: kpis })
        })
    }
    refreshTokenLoadDashboard = () => {
        let refreshToken = localStorage.getItem("refresh_token")
        let data = { 'refresh': refreshToken }
        axios.post(HOST_URL + "/api/token/refresh/", data).then(res => {
            let token = res.data.access;
            refreshToken = res.data.refresh;
            localStorage.setItem('token', token)
            localStorage.setItem('refresh_token', refreshToken)
            let tokenData = { 'token': token }
            this.loadDashboard(tokenData)
        })
    }
    componentWillUnmount = () => {
        clearInterval(this.interval)
    }
    goToNotif = () => {
        let adminprofile_slug = this.props.match.params.adminprofile_slug;
        let path = "/mbk_admin/" + adminprofile_slug + "/notifications/"
        this.props.history.push(path)
    }

    render() {
        let kpis = this.state.kpis
        return (
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <p>dashboard</p>
                </div>
                <div class="dashboard-content">
                    {kpis ?
                        <>
                            <div class="dashboard-content-kpis">
                                {this.state.kpis.map(kpi => {
                                    return (
                                        <div class="dashboard-content-kpis-kpi">
                                            <span>{kpi.nb}</span>
                                            <p>{kpi.description}</p>
                                        </div>
                                    )
                                })
                                }
                            </div>
                            <div class="last-notification-container">
                                <Notication source="dashboard" />
                                {this.props.notification_count > 0 ? <p class="last-notification-viewmore" onClick={this.goToNotif}>view more</p> : null}
                            </div>
                        </>
                        :
                        <div style={{ height: "100vh", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <SyncLoader color={"#283747"} size={10} loading={true} />
                        </div>
                    }

                </div>
            </div>

        )
    }
}
export default withRouter(Dashboard);