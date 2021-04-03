import React from 'react';
import jwt_decode from "jwt-decode";
import { withRouter } from "react-router-dom";

class NotFound extends React.Component {

    render() {
        let token = localStorage.getItem("token")
        if (token) {
            let decodedToken = jwt_decode(token)
            let is_student = decodedToken['is_student']
            let is_admin = decodedToken['is_admin']
            let pathname = window.location.pathname
            let studentprofile_slug = decodedToken['studentprofile_slug']
            let adminprofile_slug = decodedToken['adminprofile_slug']
            if (is_student && pathname != "/student/" + studentprofile_slug + "/") {
                this.props.history.push("/student/" + studentprofile_slug + "/")
            } else if (is_admin && pathname != "/mbk_admin/" + adminprofile_slug + "/students/") {
                this.props.history.push("/mbk_admin/" + adminprofile_slug + "/students/")
            }
        } else {
            this.props.history.push("/")
        }
        return (
            <div></div>
        )
    }
}
export default withRouter(NotFound);