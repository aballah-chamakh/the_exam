import React from 'react';
import axios from 'axios';
import { HOST_URL } from '../../../config';
import jwt_decode from "jwt-decode";
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import $ from 'jquery';
import SyncLoader from "react-spinners/SyncLoader";
import "./examsetting-scss.scss";

class ExamSetting extends React.Component {
    state = {
        form: {
            numberofdays: "",
            marketcode: "",
        },
        loaded: false,

    }
    componentDidMount() {
        window.scrollTo(0, 0)
        let token = localStorage.getItem('token')
        let config = { headers: { Authorization: 'Bearer ' + token } }
        let isTokenExpired = Date.now() >= jwt_decode(token).exp
        if (isTokenExpired) {
            this.refreshTokenLoadExamSetting()
        } else {
            this.loadExamSetting(config)
        }
    }
    refreshTokenLoadExamSetting = () => {
        let refreshToken = localStorage.getItem("refresh_token")
        let data = { 'refresh': refreshToken }
        axios.post(HOST_URL + "/api/token/refresh/", data).then(res => {
            let token = res.data.access;
            refreshToken = res.data.refresh;
            localStorage.setItem('token', token)
            localStorage.setItem('refresh_token', refreshToken)
            let config = { headers: { Authorization: 'Bearer ' + token } }
            this.loadExamSetting(config)
        })
    }
    loadExamSetting = (config) => {
        axios.get(HOST_URL + "/api/examsetting/", config).then(res => {
            this.setState({ form: res.data, loaded: true })
        })

    }
    handleForm = (e, field, setFieldValue) => {
        setFieldValue(field, e.target.value)
        if ($('.examsetting-error').css('display') != 'none') {
            $('.examsetting-error').hide(200);
        }
    }
    handleSubmit = (examSettingData, { setSubmitting, resetForm, setFieldValue, setFieldError }) => {
        if (examSettingData.numberofdays == 0) {
            setFieldError("numberofdays", "Number of days can't be 0 ")
            return;
        }
        let examSettingId = examSettingData.id
        delete examSettingData.id
        let token = localStorage.getItem('token')
        let config = { headers: { Authorization: 'Bearer ' + token } }
        let isTokenExpired = Date.now() >= jwt_decode(token).exp
        if (isTokenExpired) {
            this.refreshTokenSubmitExamSettings(examSettingId, examSettingData)
        } else {
            this.submitExamSettings(examSettingId, examSettingData, config)
        }

    }
    refreshTokenSubmitExamSettings = (examSettingId, examSettingData) => {
        let refreshToken = localStorage.getItem("refresh_token")
        let data = { 'refresh': refreshToken }
        axios.post(HOST_URL + "/api/token/refresh/", data).then(res => {
            let token = res.data.access;
            refreshToken = res.data.refresh;
            localStorage.setItem('token', token)
            localStorage.setItem('refresh_token', refreshToken)
            let config = { headers: { Authorization: 'Bearer ' + token } }
            this.submitExamSettings(examSettingId, examSettingData, config)
        })
    }
    submitExamSettings = (examSettingId, examSettingData, config) => {
        axios.put(HOST_URL + "/api/examsetting/" + examSettingId + "/", examSettingData, config).then(res => {
            let adminprofile_slug = this.props.match.params.adminprofile_slug;
            this.props.history.push("/mbk_admin/" + adminprofile_slug + "/students/")
        })
    }
    save = () => {
        this.submitBtn.click()
    }
    cancel = () => {
        let adminprofile_slug = this.props.match.params.adminprofile_slug;
        this.props.history.push('/mbk_admin/' + adminprofile_slug + '/students/')
    }
    validationSchema = Yup.object().shape({
        numberofdays: Yup.number().required(),
        marketcode: Yup.string().required(),
    })
    render() {
        let loaded = this.state.loaded
        return (
            <div class="examsetting-container">
                <div class="examsetting-header">
                    <p>exam setting</p>
                    <hr />
                </div>

                {loaded ?
                    <div style={{ width: "100%" }}>
                        <div class="examsetting-content">
                            <Formik
                                enableReinitialize
                                onSubmit={this.handleSubmit}
                                initialValues={this.state.form}
                                validationSchema={this.validationSchema}
                            >
                                {({ setFieldValue, values, errors, isSubmitting, touched }) => (
                                    <Form style={{ width: '100%' }}>
                                        <div class='form-group'>
                                            <label htmlFor='numberofdays' >Number Of Days</label>
                                            <div>
                                                <Field class={errors.numberofdays && touched.numberofdays ? 'form-control  is-invalid' : 'form-control'} name="numberofdays" id="numberofdays" placeholder="numberofdays" value={values.numberofdays} type="number" onChange={(e) => { this.handleForm(e, 'numberofdays', setFieldValue) }} />
                                                <div class="invalid-feedback">
                                                    {errors.numberofdays && touched.numberofdays ? <p>{errors.numberofdays}</p> : null}
                                                </div>
                                            </div>
                                        </div>
                                        <div class='form-group'>
                                            <label htmlFor='marketcode' >Market Code</label>
                                            <div>
                                                <Field class={errors.marketcode && touched.marketcode ? 'form-control  is-invalid' : 'form-control'} name="marketcode" id="marketcode" placeholder="marketcode" value={values.marketcode} onChange={(e) => { this.handleForm(e, 'marketcode', setFieldValue) }} />
                                                <div class="invalid-feedback">
                                                    {errors.marketcode && touched.marketcode ? <p>{errors.marketcode}</p> : null}
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
                        <div class="examsetting-action">
                            <button class="examsetting-save" onClick={this.cancel} >cancel</button>
                            <button class="examsetting-save" onClick={this.save} >save</button>
                        </div>
                    </div> :
                    <div style={{ height: "100vh", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <SyncLoader color={"#283747"} size={10} loading={true} />
                    </div>}

            </div>
        )
    }
}
export default ExamSetting;