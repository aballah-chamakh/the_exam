import React from 'react';
import Modal from 'react-bootstrap/Modal'
import { Formik, Form, Field } from 'formik';
import jwt_decode from "jwt-decode";
import * as Yup from 'yup';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import './examcreatemodal-scss.scss';
import { HOST_URL } from '../../../../config';

class ExamCreateModal extends React.Component {
    state = {
        form: { name: '' },
        exam_time: {
            start_at: null,
            end_at: null,
        },
        exam_time_utc: {
            start_at: null,
            end_at: null
        },
        loaded: false
    }
    validationSchema = Yup.object().shape({
        name: Yup.string().required(),
    })
    handleSubmit = (newExamData, { setSubmitting, resetForm, setFieldValue }) => {
        newExamData['exam_time_utc'] = this.state.exam_time_utc;
        let token = localStorage.getItem('token')
        let config = { headers: { Authorization: 'Bearer ' + token } }
        let decodedToken = jwt_decode(token)
        if (Date.now() >= decodedToken.exp * 1000) {
            this.refreshToken(newExamData)
        } else {
            this.createNewExam(newExamData, config)
        }
    }
    createNewExam = (newExamData, config) => {
        axios.post(HOST_URL + '/api/exam/', newExamData, config).then(res => {
            let created_exam = res.data
            let token = localStorage.getItem('token')
            let studentprofile_slug = jwt_decode(token)['studentprofile_slug']
            this.props.close()
            this.props.history.push("/student/" + studentprofile_slug + '/exam/' + created_exam.slug + '/')
        })
    }
    refreshToken = (newExamData) => {
        let refreshToken = localStorage.getItem("refresh_token")
        let data = { 'refresh': refreshToken }
        axios.post(HOST_URL + "/api/token/refresh/", data).then(res => {
            let token = res.data.access;
            refreshToken = res.data.refresh;
            localStorage.setItem('token', token)
            localStorage.setItem('refresh_token', refreshToken)
            let config = { headers: { Authorization: 'Bearer ' + token } }
            this.loadStudentProfile(newExamData, config)
        })
    }
    start = () => {
        this.submitBtn.click()
    }
    generateDateStr = (date) => {
        let dateStr = date.getHours() + ":"
        dateStr += date.getMinutes() + ":"
        dateStr += date.getSeconds() + " "
        dateStr += date.getDate() + "/"
        dateStr += date.getMonth() + 1 + "/"
        dateStr += date.getFullYear()
        return dateStr;
    }
    componentDidMount() {
        let startDate = new Date();
        let endDate = new Date();
        let days = this.props.exam_days;
        while (days > 0) {
            endDate.setDate(endDate.getDate() + 1)
            let dayIndex = endDate.getDay()
            let weekEndIndex = [0, 1]
            if (weekEndIndex.includes(dayIndex)) {
                continue;
            }
            days -= 1
        }
        let exam_time = {
            start_at: this.generateDateStr(startDate),
            end_at: this.generateDateStr(endDate)
        }
        let exam_time_utc = {
            start_at: {
                hours: startDate.getUTCHours(),
                minutes: startDate.getUTCMinutes(),
                seconds: startDate.getUTCSeconds(),
                day: startDate.getUTCDate(),
                month: startDate.getUTCMonth() + 1,
                year: startDate.getUTCFullYear()
            },
            end_at: {
                hours: endDate.getUTCHours(),
                minutes: endDate.getUTCMinutes(),
                seconds: endDate.getUTCSeconds(),
                day: endDate.getUTCDate(),
                month: endDate.getUTCMonth() + 1,
                year: endDate.getUTCFullYear()
            }
        }
        this.setState({ exam_time: exam_time, exam_time_utc: exam_time_utc, loaded: true })
    }
    render() {
        let loaded = this.state.loaded;
        let exam_time = this.state.exam_time;
        return (
            <Modal show={this.props.visible} onHide={this.props.close}>
                {loaded ?
                    <div class="examcreatemodal-container">
                        <div class="examcreatemodal-header"  >
                            <p>New Exam</p>
                            <i class="material-icons" onClick={this.props.close} >close</i>
                        </div>
                        {this.state.loaded ?
                            <div class="examcreatemodal-content"  >
                                <img src='https://kajabi-storefronts-production.global.ssl.fastly.net/kajabi-storefronts-production/themes/2818401/settings_images/KTBwp5sQtiRgugKKLSuw_9ezxrwhxny2s9st2b5edvog053ul.png' />
                                <h3>votre examen va commencé le <span style={{ color: "#283747" }}>{exam_time.start_at}</span> et va terminé le <span style={{ color: "#283747" }}>{exam_time.end_at}</span></h3>
                                <Formik
                                    enableReinitialize
                                    onSubmit={this.handleSubmit}
                                    initialValues={this.state.form}
                                    validationSchema={this.validationSchema}
                                >
                                    {({ errors, isSubmitting, touched }) => (
                                        <Form style={{ width: '100%' }}>
                                            <div class='form-group'>
                                                <label htmlFor='username' >Exam Name</label>
                                                <div>
                                                    <Field class={errors.name && touched.name ? 'form-control  is-invalid' : 'form-control'} name="name" id="name" placeholder="Exam Name" />
                                                    <div class="invalid-feedback">
                                                        {errors.name && touched.name ? <p>{errors.name}</p> : null}
                                                    </div>
                                                </div>
                                            </div>
                                            <center><button ref={(el) => this.submitBtn = el} type='submit' disabled={isSubmitting} style={{ display: 'none' }} >
                                                Submit
                        </button></center>
                                        </Form>
                                    )}
                                </Formik>


                            </div> : null}
                        <div class="examcreatemodal-footer"  >
                            <button class="examcreatemodal-cancel" onClick={this.props.close} >cancel</button>
                            <button class="examcreatemodal-start" onClick={this.start}>start</button>

                        </div>
                    </div> : null}
            </Modal>
        )
    }
}
export default withRouter(ExamCreateModal);