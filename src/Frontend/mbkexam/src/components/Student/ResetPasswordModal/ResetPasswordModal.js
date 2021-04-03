import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import "./resetpasswordmodal-scss.scss";
import { HOST_URL } from '../../../config';
import Modal from 'react-bootstrap/Modal'
import $ from 'jquery';
import axios from "axios";
import SyncLoader from "react-spinners/SyncLoader";


class ResetPasswordModal extends React.Component {
    state = {
        form: {
            newPassword: "",
            confirmNewPassword: "",
        },
        loaded: false,
    }
    validationSchema = Yup.object().shape({
        newPassword: Yup.string().min(8).required(),
        confirmNewPassword: Yup.string().min(8).required().oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
    })
    closeAlert = (className) => {
        $("." + className).hide()
    }
    openLoginModal = () => {
        this.props.openLoginModal()
        this.close()
    }
    handleSubmit = (emailData, { setSubmitting, resetForm, setFieldError }) => {
        let urlParams = new URLSearchParams(window.location.search);
        let reset_token = urlParams.get('reset_token');
        emailData['password'] = emailData['newPassword']
        delete emailData['NewPassword'];
        emailData['confirmPassword'] = emailData['confirmNewPassword'];
        delete emailData['confirmNewPassword'];
        emailData['token'] = reset_token;
        axios.put(HOST_URL + "/api/reset_password/", emailData).then(res => {
            let expired = this.state.expired;
            if (expired) {
                this.props.close()
                this.props.triggerResetPasswordTokenExpired()
            } else {
                this.props.close()
                this.openLoginModal()
            }

        }).catch(err => {
            if (err.code == 401) {
                setFieldError("ce e-mail n'existe pas")
                resetForm()
            }
        })
    }
    componentDidMount = () => {

        let urlParams = new URLSearchParams(window.location.search);
        let reset_token = urlParams.get('reset_token');
        let data = { 'token': reset_token }
        if (reset_token) {
            axios.put(HOST_URL + "/api/verify_token/", data).then(res => {
                let expired = res.data.expired
                if (expired) {
                    this.props.triggerResetPasswordTokenExpired()
                    this.props.close()
                } else {
                    this.setState({ expired: expired, loaded: true })
                }
                //
            })
        }
    }

    resetPasswordAgain = () => {
        console.log("aaaaaaaaaaaaaaaaaaaaaaaa")
        this.props.openForgotPasswordModal()
        this.props.close()
    }

    render() {
        let expired = this.state.expired;
        let loaded = this.state.loaded;
        return (
            <Modal show={this.props.resetPasswordModalVisibility} onHide={this.props.close} animation={true} >
                <div class="resetpasswordmodal-container">
                    {loaded == false ?
                        <div class="resetpasswordmodal-loading">
                            <SyncLoader color={"#283747"} size={10} loading={true} />
                        </div>
                        : expired == false ?
                            <div class="resetpasswordmodal-form">
                                <p class="resetpasswordmodal-form-title" >réinitialisez votre mot de passe</p>
                                <Formik
                                    onSubmit={this.handleSubmit}
                                    initialValues={this.state.form}
                                    validationSchema={this.validationSchema}
                                >
                                    {({ errors, isSubmitting, touched }) => (
                                        <Form style={{ width: "100%" }}>
                                            <div class='form-group'>
                                                <label htmlFor='newPassword' >nouveau mot de passe</label>
                                                <div>
                                                    <Field type="password" class={errors.newPassword && touched.newPassword ? 'form-control  is-invalid' : 'form-control'} name="newPassword" id="newPassword" placeholder="New Password" />
                                                    <div class="invalid-feedback">
                                                        {errors.newPassword && touched.newPassword ? <p>{errors.newPassword}</p> : null}
                                                    </div>
                                                </div>
                                            </div>
                                            <div class='form-group'>
                                                <label htmlFor='confirmNewPassword' >confirmer le nouveau mot de passe</label>
                                                <div>
                                                    <Field type="password" class={errors.confirmNewPassword && touched.confirmNewPassword ? 'form-control  is-invalid' : 'form-control'} name="confirmNewPassword" id="confirmNewPassword" placeholder="Confirm New Password" />
                                                    <div class="invalid-feedback">
                                                        {errors.confirmNewPassword && touched.confirmNewPassword ? <p>{errors.confirmNewPassword}</p> : null}
                                                    </div>
                                                </div>
                                            </div>
                                            <center><button type='submit' class="resetpassword-modal-btn" disabled={isSubmitting}   >
                                                réinitialisez
                                            </button></center>
                                        </Form>
                                    )}

                                </Formik>
                            </div>
                            : null}
                </div>
            </Modal>
        )
    }
}
export default ResetPasswordModal;
/*
                            : expired == true ?
                                <div class="resetpasswordmodal-invalidtoken" >
                                    <p>your reset token was expired</p>
                                    <i class="material-icons">warning</i>
                                    <button onClick={this.resetPasswordAgain} >reset password again</button>
                                </div> : null}*/