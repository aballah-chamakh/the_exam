import React from 'react';
import axios from 'axios';
import { HOST_URL, MAX_FILE_SIZE_IN_MB } from '../../../config';
import jwt_decode from "jwt-decode";
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import $ from 'jquery';
import SyncLoader from "react-spinners/SyncLoader";
import './accountsetting-scss.scss';



class AccountSetting extends React.Component {
    state = {
        adminprofile: null,
        form: {
            username: "",
            oldPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        },
        imageUpload: null,
        errorMSg: "",
    }

    componentDidMount() {
        window.scrollTo(0, 0)
        let token = localStorage.getItem('token')
        let token_data = jwt_decode(token)
        let adminprofile_slug_token = token_data['adminprofile_slug']
        let adminprofile_slug_url = this.props.match.params.adminprofile_slug;
        if (adminprofile_slug_token != adminprofile_slug_url) {
            this.props.history.push('/')
        } else {
            let config = { headers: { Authorization: 'Bearer ' + token } }
            let isTokenExpired = Date.now() >= jwt_decode(token).exp * 1000
            if (isTokenExpired) {
                this.refreshTokenLoadAdminSettings(adminprofile_slug_url)
            } else {
                this.loadAdminSettings(adminprofile_slug_url, config)
            }
        }
    }
    refreshTokenLoadAdminSettings = (adminprofile_slug_url) => {
        let refreshToken = localStorage.getItem("refresh_token")
        let data = { 'refresh': refreshToken }
        axios.post(HOST_URL + "/api/token/refresh/", data).then(res => {
            let token = res.data.access;
            refreshToken = res.data.refresh;
            localStorage.setItem('token', token)
            localStorage.setItem('refresh_token', refreshToken)
            let config = { headers: { Authorization: 'Bearer ' + token } }
            this.loadAdminSettings(adminprofile_slug_url, config)
        })
    }
    refreshTokenSubmitAdminSetting = (adminprofile_slug_url, setFieldValue, setSubmitting) => {
        let refreshToken = localStorage.getItem("refresh_token")
        let data = { 'refresh': refreshToken }
        axios.post(HOST_URL + "/api/token/refresh/", data).then(res => {
            let token = res.data.access;
            refreshToken = res.data.refresh;
            localStorage.setItem('token', token)
            localStorage.setItem('refresh_token', refreshToken)
            let config = { headers: { Authorization: 'Bearer ' + token } }
            this.submitAdminSetting(adminprofile_slug_url, config, setFieldValue, setSubmitting)
        })
    }
    loadAdminSettings = (adminprofile_slug_url, config) => {
        axios.get(HOST_URL + '/api/adminprofile/' + adminprofile_slug_url + '/', config).then(res => {
            let adminprofile = res.data;
            let state = this.state;
            state.form.username = adminprofile.username;
            state.adminprofile = adminprofile;
            this.setState({ adminprofile: adminprofile });
        })
    }
    submitAdminSetting = (formData, newAdminData, adminprofile_slug_url, config, setFieldValue, setSubmitting) => {
        axios.put(HOST_URL + "/api/adminprofile/" + adminprofile_slug_url + "/custom_update/", formData, config).then(res => {
            console.log(res.data)
            console.log(jwt_decode(res.data.access))
            localStorage.setItem('token', res.data.access)
            localStorage.setItem('refrersh_token', res.data.refresh)
            this.props.history.push('/mbk_admin/' + adminprofile_slug_url + '/students/')
        }).catch(err => {
            let error_code = err.response.status
            if (error_code == 400) {
                this.setState({ errorMsg: "no update has been done" })

            } else if (error_code == 401) {
                this.setState({ errorMsg: "Invalid password , enter the right password and submit again " })
            }
            setSubmitting(false)
            console.log(newAdminData)
            $('.adminprofilesetting-error').show(200);
            $('.adminprofilesetting-error').css('display', 'flex')
            setFieldValue('oldPassword', '')
            setFieldValue('newPassword', '')
            setFieldValue('confirmNewPassword', '')
        })
    }
    getImage = (image) => {
        if (image.search("blob") != -1) {
            return image
        }
        return HOST_URL + image;
    }
    validationSchema = Yup.object().shape({
        username: Yup.string().required(),
        oldPassword: Yup.string().min(8).required(),
        newPassword: Yup.string().min(8),
        confirmNewPassword: Yup.string().min(8).oneOf([Yup.ref('newPassword'), null], 'Passwords must match the New Password'),
    })

    handleSubmit = (newAdminData, { setSubmitting, resetForm, setFieldValue, setFieldError }) => {
        if (newAdminData['newPassword'] != "" && newAdminData['confirmNewPassword'] == "") {
            setFieldError("confirmNewPassword", "Confirm New Password must match the New Password")
            setSubmitting(false)
            return
        }
        let adminprofile_slug_url = this.props.match.params.adminprofile_slug;
        var formData = new FormData();
        formData.append('username', newAdminData['username'])
        formData.append('oldPassword', newAdminData['oldPassword']);
        formData.append('newPassword', newAdminData['newPassword']);
        formData.append('confirmNewPassword', newAdminData['confirmNewPassword']);
        if (this.state.imageUpload) {
            formData.append('image', this.state.imageUpload.image_file);
        }
        let token = localStorage.getItem('token')
        let config = { headers: { Authorization: 'Bearer ' + token } }
        let isTokenExpired = Date.now() >= jwt_decode(token).exp * 1000;
        if (isTokenExpired) {
            this.refreshTokenSubmitAdminSetting(adminprofile_slug_url, setFieldValue, setSubmitting)
        } else {
            this.submitAdminSetting(formData, newAdminData, adminprofile_slug_url, config, setFieldValue, setSubmitting)
        }


        //this.setState({form:{...this.state.form, oldPassword:"", newPassword:"",confirmNewPassword : ""}})
    }
    save = () => {
        this.submitBtn.click();
    }
    cancel = () => {
        let adminprofile_slug = this.props.match.params.adminprofile_slug;
        this.props.history.push('/student/' + adminprofile_slug);
    }
    uploadFile = () => {
        this.inpuFile.click();
    }
    handleFile = (e) => {
        let image_file = e.target.files[0];
        let image_file_size = (image_file.size / 1024 / 1024);
        console.log("image size : " + (image_file.size / 1024 / 1024) + "(mib)")
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
            state.adminprofile.image = imageUpload.image_url;
            this.setState({ imageUpload: imageUpload })
        }

    }
    close = () => {
        $('.adminprofilesetting-error').hide(200);
    }
    handleForm = (e, field, setFieldValue) => {
        setFieldValue(field, e.target.value)
        if ($('.adminprofilesetting-error').css('display') != 'none' && field.indexOf('Password') != -1) {
            $('.adminprofilesetting-error').hide(200);
        }
    }
    render() {
        let adminprofile = this.state.adminprofile;
        return (
            <div class="adminprofilesetting-container">
                <div class="alert alert-danger adminprofilesetting-error" role="alert">
                    <p>{this.state.errorMsg}</p>
                    <i class="material-icons" onClick={this.close} >close</i>
                </div>
                <div class="adminprofilesetting-header">
                    <p>admin profile Settings</p>
                    <hr />
                </div>
                {adminprofile ?
                    <div style={{ width: "100%" }}>
                        <div class="adminprofilesetting-content">
                            <div class="adminprofilesetting-image">
                                <img src={this.getImage(adminprofile.image)} />
                                <p class="image-error">max image size allowed is 5 mb</p>
                                <input type="file" ref={(el) => { this.inpuFile = el }} onChange={(e) => { this.handleFile(e) }} style={{ display: 'none' }} accept="image/*" />
                                <button onClick={this.uploadFile} >upload</button>
                            </div>
                            <div class="adminprofilesetting-info">
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
                                                    <input readonly class='form-control' name="email" id="email" placeholder="Email" value={adminprofile.email} />
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
                                                <label htmlFor='password' >Old Password</label>
                                                <div>
                                                    <Field class={errors.oldPassword && touched.oldPassword ? 'form-control  is-invalid' : 'form-control'} name="oldPassword" type="password" id="oldPassword" placeholder="Old Password" value={values.oldPassword} onChange={(e) => { this.handleForm(e, 'oldPassword', setFieldValue) }} />
                                                    <div class="invalid-feedback">
                                                        {errors.oldPassword && touched.oldPassword ? <p>{errors.oldPassword}</p> : null}
                                                    </div>
                                                </div>
                                            </div>
                                            <div class='form-group '>
                                                <label htmlFor='confirmPassword' >New Password</label>
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
                        <div class="adminprofilesetting-action">
                            <button class="adminprofilesetting-save" onClick={this.cancel} >cancel</button>
                            <button class="adminprofilesetting-save" onClick={this.save} >save</button>
                        </div>
                    </div>
                    :
                    <div style={{ height: "100vh", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <SyncLoader color={"#283747"} size={10} loading={true} />
                    </div>}
            </div>
        )
    }
}
export default AccountSetting;