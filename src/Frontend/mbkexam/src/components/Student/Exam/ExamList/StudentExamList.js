import React from 'react';
import { withRouter } from 'react-router-dom';
import { formatDateTime, NO_EXAM } from '../../../../config';
import SyncLoader from "react-spinners/SyncLoader";
import './studentexamlist-scss.scss'


class StudentExamList extends React.Component {
    state = {
        exams: [

        ]
    }
    goTo = (exam_slug) => {
        let source = this.props.source;
        let studentprofile_slug = this.props.match.params.studentprofile_slug;
        let adminprofile_slug = this.props.match.params.adminprofile_slug;
        let path = "/student/" + studentprofile_slug + "/exam/" + exam_slug + "/";
        if (source == "admin") {
            path = "/mbk_admin/" + adminprofile_slug + "/student/" + studentprofile_slug + "/exam/" + exam_slug + "/"
        }
        this.props.history.push(path)
    }
    render() {
        let exams = this.props.exams;
        let loaded = this.props.loaded || true;
        loaded = true
        console.log("student exam list => " + loaded)
        let studentprofile_slug = this.props.match.params.studentprofile_slug;
        let source = this.props.source;
        let new_exam_allowed = this.props.new_exam_allowed;
        return (

            <div class='studentexamlist-container'>

                <div class="studentexamlist-header" style={{ justifyContent: exams.length > 0 ? "space-between" : "center" }} >
                    {exams.length > 0 ? <p>My Exams</p> : null}
                    {source != "admin" && new_exam_allowed ? <button onClick={this.props.open} >new exam</button> : null}
                </div>
                <div class="studentexamlist-content">
                    {exams.length > 0 ?
                        <table class="table table-striped">
                            <thead style={{ backgroundColor: '#2E4053', color: 'white' }}>
                                <tr>
                                    <th scope="col">name</th>
                                    <th scope="col">started at</th>
                                    <th scope="col">ends at</th>
                                    <th scope="col">status</th>
                                    <th scope="col">detail</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.props.exams.map(exam => {
                                    return (
                                        <tr key={exam.id}>
                                            <td>{exam.name}</td>
                                            <td>{formatDateTime(exam.start_at)}</td>
                                            <td>{formatDateTime(exam.end_at)}</td>
                                            <td>{exam.status}</td>
                                            <td><button onClick={() => { this.goTo(exam.slug) }} ><i class="material-icons">remove_red_eye</i></button></td>
                                        </tr>
                                    )
                                })
                                }
                            </tbody>
                        </table>
                        : exams.length == 0 && loaded == false ?
                            <div style={{ height: "100vh", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                <SyncLoader color={"#283747"} size={10} loading={true} />
                            </div>
                            : <div class="studentexamlist-content-empty" >
                                <i class='fas fa-clipboard-list'></i>
                                <p>{NO_EXAM}</p>
                            </div>
                    }
                </div>
            </div >

        )
    }
}
export default withRouter(StudentExamList);