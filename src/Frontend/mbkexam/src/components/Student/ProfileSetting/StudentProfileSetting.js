import React from 'react';
import axios from 'axios';
import { MAX_FILE_SIZE_IN_MB, HOST_URL, STUDENT_PROFILE_SETTING_NO_UPDATE_RECOGNIZED, STUDENT_PROFILE_SETTING_INVALID_PASSWORD } from '../../../config';
import jwt_decode from "jwt-decode";
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import $ from 'jquery';
import './studentprofilesetting-scss.scss';
import SyncLoader from "react-spinners/SyncLoader";

class StudentProfileSetting extends React.Component {
    state = {
        studentprofile: null,
        form: {
            username: "",
            oldPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        },
        imageUpload: null,
        errorMsg: "",
        loaded: false,

    }

    componentDidMount() {

        window.scrollTo(0, 0)
        let token = localStorage.getItem('token')
        let token_data = jwt_decode(token)
        let studentprofile_slug_token = token_data['studentprofile_slug']
        let studentprofile_slug_url = this.props.match.params.studentprofile_slug;
        if (studentprofile_slug_token != studentprofile_slug_url) {
            this.props.history.push('/')
        } else {
            let config = { headers: { Authorization: 'Bearer ' + token } }
            let isTokenExpired = Date.now()
            if (isTokenExpired) {
                this.refreshTokenForGettingStudentProfile(studentprofile_slug_url)
            } else {
                this.getStudentProfile(config, studentprofile_slug_url)
            }
        }
    }
    getStudentProfile = (config, studentprofile_slug_url) => {
        axios.get(HOST_URL + '/api/studentprofile/' + studentprofile_slug_url + '/', config).then(res => {
            let studentprofile = res.data;
            let state = this.state;
            state.form.username = studentprofile.username;
            state.studentprofile = studentprofile;
            this.setState({ studentprofile: studentprofile, loaded: true });
        }).catch(err => {
            this.setState({ loaded: false })
        })
    }
    refreshTokenForGettingStudentProfile = (studentprofile_slug_url) => {
        let refreshToken = localStorage.getItem("refresh_token")
        let data = { 'refresh': refreshToken }
        axios.post(HOST_URL + "/api/token/refresh/", data).then(res => {
            let token = res.data.access;
            refreshToken = res.data.refresh;
            localStorage.setItem('token', token)
            localStorage.setItem('refresh_token', refreshToken)
            let config = { headers: { Authorization: 'Bearer ' + token } }
            this.getStudentProfile(config, studentprofile_slug_url)
        })
    }
    validationSchema = Yup.object().shape({
        username: Yup.string().required(),
        oldPassword: Yup.string().min(8).required(),
        newPassword: Yup.string().min(8),
        confirmNewPassword: Yup.string().oneOf([Yup.ref('newPassword'), null], 'Confirm New Password must match the New Password'),
    })

    handleSubmit = (newStudentData, { setSubmitting, resetForm, setFieldValue, setFieldError }) => {
        console.log(newStudentData)
        if (newStudentData['newPassword'] != "" && newStudentData['confirmNewPassword'] == "") {
            setFieldError("confirmNewPassword", "Confirm New Password must match the New Password")
            setSubmitting(false)
            return
        }

        let studentprofile_slug_url = this.props.match.params.studentprofile_slug;
        var formData = new FormData();
        formData.append('username', newStudentData['username'])
        formData.append('oldPassword', newStudentData['oldPassword']);
        formData.append('newPassword', newStudentData['newPassword']);
        formData.append('confirmNewPassword', newStudentData['confirmNewPassword']);
        if (this.state.imageUpload) {
            formData.append('image', this.state.imageUpload.image_file);
        }
        let token = localStorage.getItem('token')
        let config = { headers: { Authorization: 'Bearer ' + token } }
        let isTokenExpired = Date.now() > jwt_decode(token).exp * 1000;
        if (isTokenExpired) {
            this.refreshTokenForUpdatingStudentProfileSetting(formData, studentprofile_slug_url, setFieldValue, setSubmitting, newStudentData)
        } else {
            this.updateStudentProfileSetting(formData, studentprofile_slug_url, config, setFieldValue, setSubmitting, newStudentData)
        }

        //this.setState({form:{...this.state.form, oldPassword:"", newPassword:"",confirmNewPassword : ""}})
    }
    updateStudentProfileSetting = (formData, studentprofile_slug_url, config, setFieldValue, setSubmitting, newStudentData) => {
        axios.put(HOST_URL + "/api/studentprofile/" + studentprofile_slug_url + "/custom_update/", formData, config).then(res => {
            console.log(res.data)
            console.log(jwt_decode(res.data.access))
            localStorage.setItem('token', res.data.access)
            localStorage.setItem('refrersh_token', res.data.refresh)
            this.props.history.push('/student/' + studentprofile_slug_url + '/')
        }).catch(err => {
            let error_code = err.response.status
            if (error_code == 400) {
                this.setState({ errorMsg: STUDENT_PROFILE_SETTING_NO_UPDATE_RECOGNIZED })

            } else if (error_code == 401) {
                this.setState({ errorMsg: STUDENT_PROFILE_SETTING_INVALID_PASSWORD })
            }
            console.log(err.response.status)
            setSubmitting(false)
            console.log(newStudentData)
            $('.studentprofilesetting-error').show(200);
            $('.studentprofilesetting-error').css('display', 'flex')
            setFieldValue('oldPassword', '')
            setFieldValue('newPassword', '')
            setFieldValue('confirmNewPassword', '')
        })
    }
    refreshTokenForUpdatingStudentProfileSetting = (formData, studentprofile_slug_url, setFieldValue, setSubmitting, newStudentData) => {
        let refreshToken = localStorage.getItem("refresh_token")
        let data = { 'refresh': refreshToken }
        axios.post(HOST_URL + "/api/token/refresh/", data).then(res => {
            let token = res.data.access;
            refreshToken = res.data.refresh;
            localStorage.setItem('token', token)
            localStorage.setItem('refresh_token', refreshToken)
            let config = { headers: { Authorization: 'Bearer ' + token } }
            this.updateStudentProfileSetting(formData, studentprofile_slug_url, config, setFieldValue, setSubmitting, newStudentData)
        })
    }
    getImage = (image) => {
        if (image.search("blob") != -1) {
            return image
        }
        return HOST_URL + image;
    }
    save = () => {
        this.submitBtn.click();
        console.log("clicked !!");
    }
    cancel = () => {
        let studentprofile_slug = this.props.match.params.studentprofile_slug;
        this.props.history.push('/student/' + studentprofile_slug);
    }
    uploadFile = () => {
        this.inpuFile.click();
    }
    handleFile = (e) => {
        let image_file = e.target.files[0]
        let image_file_size = (image_file.size / 1024 / 1024);
        if (image_file_size >= MAX_FILE_SIZE_IN_MB) {
            $(".image-error").show(200).delay(10000).hide(200)
            return
        }
        if (image_file) {
            let state = this.state;
            let image_url = URL.createObjectURL(image_file)
            let imageUpload = {
                image_file: image_file,
                image_url: image_url
            }
            state.studentprofile.image = imageUpload.image_url;
            this.setState({ imageUpload: imageUpload })
        }

    }
    close = () => {
        $('.studentprofilesetting-error').hide(200);
        this.setState({ errorMsg: "" })
    }
    handleForm = (e, field, setFieldValue) => {
        setFieldValue(field, e.target.value)
        if ($('.studentprofilesetting-error').css('display') != 'none' && field.indexOf('Password') != -1) {
            $('.studentprofilesetting-error').hide(200);
        }
    }
    render() {
        let studentprofile = this.state.studentprofile;
        let loaded = this.state.loaded;
        return (
            <div class="studentprofilesetting-container" >
                <div class="alert alert-danger studentprofilesetting-error" role="alert">
                    <p>{this.state.errorMsg}</p>
                    <i class="material-icons" onClick={this.close} >close</i>
                </div>
                <div class="studentprofilesetting-header" >
                    <p>profile Settings</p>
                    <hr />
                </div>
                {studentprofile ?
                    <>
                        <div class="studentprofilesetting-content">
                            <div class="studentprofilesetting-image">
                                <img src={this.getImage(studentprofile.image)} />
                                <p class="image-error">max image size allowed is 5 mb</p>
                                <input type="file" ref={(el) => { this.inpuFile = el }} onChange={(e) => { this.handleFile(e) }} style={{ display: 'none' }} accept="image/*" />
                                <button onClick={this.uploadFile} >upload</button>
                            </div>
                            <div class="studentprofilesetting-info">
                                <Formik
                                    enableReinitialize
                                    onSubmit={this.handleSubmit}
                                    initialValues={this.state.form}
                                    validationSchema={this.validationSchema}
                                >
                                    {({ setFieldValue, values, errors, isSubmitting, touched }) => (
                                        <Form style={{ width: '100%' }}>
                                            <div class='form-group'>
                                                <label htmlFor='email' >Email</label>
                                                <div>
                                                    <input readonly class='form-control' name="email" id="email" placeholder="Email" value={this.state.studentprofile.email} />
                                                </div>
                                            </div>
                                            <div class='form-group'>
                                                <label htmlFor='username' >Username</label>
                                                <div>
                                                    <Field class={errors.username && touched.username ? 'form-control  is-invalid' : 'form-control'} name="username" id="username" placeholder="username" value={values.username} onChange={(e) => { this.handleForm(e, 'username', setFieldValue) }} />
                                                    <div class="invalid-feedback">
                                                        {errors.username && touched.username ? <p>{errors.username}</p> : null}
                                                    </div>
                                                </div>
                                            </div>
                                            <div class='form-group '>
                                                <label htmlFor='oldPassword' >Old Password</label>
                                                <div>
                                                    <Field class={errors.oldPassword && touched.oldPassword ? 'form-control  is-invalid' : 'form-control'} name="oldPassword" type="password" id="oldPassword" placeholder="Old Password" value={values.oldPassword} onChange={(e) => { this.handleForm(e, 'oldPassword', setFieldValue) }} />
                                                    <div class="invalid-feedback">
                                                        {errors.oldPassword && touched.oldPassword ? <p>{errors.oldPassword}</p> : null}
                                                    </div>
                                                </div>
                                            </div>
                                            <div class='form-group '>
                                                <label htmlFor='newPassword' >New Password</label>
                                                <div>
                                                    <Field class={errors.newPassword && touched.newPassword ? 'form-control  is-invalid' : 'form-control'} name="newPassword" type="password" id="newPassword" placeholder="New Password" value={values.newPassword} onChange={(e) => { this.handleForm(e, 'newPassword', setFieldValue) }} />
                                                    <div class="invalid-feedback">
                                                        {errors.newPassword && touched.newPassword ? <p>{errors.newPassword}</p> : null}
                                                    </div>
                                                </div>
                                            </div>
                                            <div class='form-group '>
                                                <label htmlFor='confirmNewPassword' >Confirm New Password</label>
                                                <div>
                                                    <Field class={errors.confirmNewPassword && touched.confirmNewPassword ? 'form-control  is-invalid' : 'form-control'} name="confirmNewPassword" type="password" id="confirmNewPassword" placeholder="Confirm New Password" value={values.confirmNewPassword} onChange={(e) => { this.handleForm(e, 'confirmNewPassword', setFieldValue) }} />
                                                    <div class="invalid-feedback">
                                                        {errors.confirmNewPassword && touched.confirmNewPassword ? <p>{errors.confirmNewPassword}</p> : null}
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
                        </div>
                        <div class="studentprofilesetting-action">
                            <button class="studentprofilesetting-save" onClick={this.cancel} >cancel</button>
                            <button class="studentprofilesetting-save" onClick={this.save} >save</button>
                        </div>
                    </>
                    :
                    !loaded ?
                        <div style={{ height: "100vh", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <SyncLoader color={"#283747"} size={10} loading={true} />
                        </div> : null
                }
            </div>
        )
    }
}
export default StudentProfileSetting