import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { HOST_URL, STUDENT_SUPPORT_CLAIM_SUCCESSFULLY_SUBMITTED } from '../../../config';
import jwt_decode from "jwt-decode";
import $ from 'jquery';
import './studentsupport-scss.scss';

class StudentSuppport extends React.Component {
    state = {
        form: {
            subject: "",
            content: ""
        }
    }
    validationSchema = Yup.object().shape({
        subject: Yup.string().required(),
        content: Yup.string().required()
    })
    send = () => {
        this.submitBtn.click()
    }

    handleSubmit = (newStudentData, { setSubmitting, resetForm }) => {
        let token = localStorage.getItem('token')
        let config = { headers: { Authorization: 'Bearer ' + token } }
        let isTokenExpired = Date.now() >= jwt_decode(token).exp * 1000;
        if (isTokenExpired) {
            this.refreshToken(newStudentData, resetForm)
        } else {
            this.submitClaim(newStudentData, config, resetForm)
        }
    }
    submitClaim = (newStudentData, config, resetForm) => {
        axios.post(HOST_URL + '/api/studentclaim/', newStudentData, config).then(res => {
            window.scrollTo(0, 0)
            $(".studentsupport-success-alert").show(200)
            $(".studentsupport-success-alert").css('display', 'flex')
            resetForm()
        })
    }
    refreshToken = (newStudentData, resetForm) => {
        let refreshToken = localStorage.getItem("refresh_token")
        let data = { 'refresh': refreshToken }
        axios.post(HOST_URL + "/api/token/refresh/", data).then(res => {
            let token = res.data.access;
            refreshToken = res.data.refresh;
            localStorage.setItem('token', token)
            localStorage.setItem('refresh_token', refreshToken)
            let config = { headers: { Authorization: 'Bearer ' + token } }
            this.submitClaim(newStudentData, config, resetForm)
        })
    }
    handleForm = (e, field, setFieldValue) => {
        setFieldValue(field, e.target.value)
        if ($(".studentsupport-success-alert").css('display') != 'none') {
            $(".studentsupport-success-alert").hide(200)
        }
    }
    close = () => {
        $(".studentsupport-success-alert").hide(200)
    }
    componentDidMount = () => {
        window.scrollTo(0, 0)
        let studentprofile_slug_url = this.props.match.params.studentprofile_slug;
        let token = localStorage.getItem("token")
        let decodedToken = jwt_decode(token)
        let studentprofile_slug_original = decodedToken['studentprofile_slug']
        if (studentprofile_slug_url != studentprofile_slug_original) {
            this.props.history.push("/student/" + studentprofile_slug_original + "/support/")
        }
    }
    render() {
        return (
            <div class="studentsupport-container">
                <div class="alert alert-success studentsupport-success-alert" role="alert">
                    <p>{STUDENT_SUPPORT_CLAIM_SUCCESSFULLY_SUBMITTED}</p>
                    <i class="material-icons" onClick={this.close} >close</i>
                </div>
                <div class="studentsupport-header">
                    <p>mbk support</p>
                    <hr />
                </div>
                <div class="studentsupport-image">
                    <img src={HOST_URL + '/media/support.jpg'} />
                </div>
                <div class="studentsupport-form">
                    <Formik
                        enableReinitialize
                        onSubmit={this.handleSubmit}
                        initialValues={this.state.form}
                        validationSchema={this.validationSchema}
                    >
                        {({ values, setFieldValue, errors, isSubmitting, touched }) => (
                            <Form style={{ width: '100%' }}>
                                <div class='form-group'>
                                    <label htmlFor='username' >Subject</label>
                                    <div>
                                        <Field class={errors.subject && touched.subject ? 'form-control  is-invalid' : 'form-control'} name="subject" id="subject" placeholder="Subject" value={values.subject} onChange={(e) => { this.handleForm(e, 'subject', setFieldValue) }} />
                                        <div class="invalid-feedback">
                                            {errors.subject && touched.subject ? <p>{errors.subject}</p> : null}
                                        </div>
                                    </div>
                                </div>
                                <div class='form-group'>
                                    <label htmlFor='username' >Content</label>
                                    <div>
                                        <Field as='textarea' rows='10' class={errors.content && touched.content ? 'form-control  is-invalid' : 'form-control'} name="content" id="content" placeholder="content" value={values.content} onChange={(e) => { this.handleForm(e, 'content', setFieldValue) }} />
                                        <div class="invalid-feedback">
                                            {errors.content && touched.content ? <p>{errors.content}</p> : null}
                                        </div>
                                    </div>
                                </div>
                                <center><button ref={(el) => this.submitBtn = el} type='submit' disabled={isSubmitting} style={{ display: 'none' }} >
                                    Submit
                        </button></center>
                            </Form>
                        )}
                    </Formik>
                </div>
                <div class="studentsupport-action">
                    <button class="send-btn" onClick={this.send} >Send</button>
                </div>
            </div>
        )
    }
}
export default StudentSuppport;