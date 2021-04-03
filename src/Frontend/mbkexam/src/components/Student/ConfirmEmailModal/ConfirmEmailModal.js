import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import "./confirmemailmodal-scss.scss";
import { HOST_URL, CONFIRM_EMAIL_SENT, INVALID_EMAIL_VERIFICATION_CODE, INVALID_EMAIL } from '../../../config';
import Modal from 'react-bootstrap/Modal'
import $ from 'jquery';
import axios from "axios";




class ConfirmEmailModal extends React.Component {
    state = {
        codeForm: {
            code: ""
        },
        emailForm: {
            email: "",
        },
        emailView: false,

    }
    emailValidationSchema = Yup.object().shape({
        email: Yup.string().email().required(),
    })
    codeValidationSchema = Yup.object().shape({
        code: Yup.string().required(),
    })
    componentDidMount = () => {
        $(".confirmemail-success-alert").show(200).css('display', 'flex').delay(5000).hide()
    }
    closeAlert = (className) => {
        $("." + className).hide()
    }
    handleCodeSubmit = (codeData, { setSubmitting, resetForm, setFieldValue, setFieldError }) => {
        axios.put(HOST_URL + "/api/verify_email_activation_code/", codeData).then(res => {
            let expired = res.data.expired;
            if (!expired) {
                this.props.openLoginModal()
                this.props.close()
            } else {
                $(".confirmemail-invalid-code-error-alert").show(200).css('display', 'flex').delay(5000).hide(200)
            }
            setSubmitting(false)
            resetForm()
        })
    }
    handleEmailSubmit = (emailData, { setSubmitting, resetForm, setFieldValue, setFieldError }) => {

        axios.put(HOST_URL + "/api/resend_email_activation_code/", emailData).then(res => {
            setSubmitting(false)
            resetForm()
            this.sendEmailVerificationCode()
        }).catch(err => {
            $('.confirmemail-invalid-email-error-alert').show(200).css('display', 'flex').delay(10000).hide(200)
            setSubmitting(false)
            resetForm()
        })
    }
    sendEmailVerificationCodeAgain = () => {
        this.setState({ emailView: true })
    }
    sendEmailVerificationCode = () => {
        this.setState({ emailView: false })
    }
    render() {
        let emailView = this.state.emailView;
        return (
            <Modal show={this.props.confirmEmailModalVisibility} onHide={this.props.close} animation={true} >
                <div class="confirmemail-container">
                    {emailView ?
                        <div class="confirmemail-again-form-container">
                            <p class="confirmemail-again-form-container-title">resend email verification code</p>
                            <Formik
                                onSubmit={this.handleEmailSubmit}
                                initialValues={this.state.emailForm}
                                validationSchema={this.emailValidationSchema}
                            >
                                {({ errors, isSubmitting, touched }) => (
                                    <Form style={{ width: "100%" }}>
                                        <div class='form-group'>
                                            <label htmlFor='email' >email</label>
                                            <div>
                                                <Field class={errors.email && touched.email ? 'form-control  is-invalid' : 'form-control'} name="email" id="email" placeholder="Email" />
                                                <div class="invalid-feedback">
                                                    {errors.email && touched.email ? <p>{errors.email}</p> : null}
                                                </div>
                                            </div>
                                        </div>
                                        <center>
                                            <button type='submit' class="confirmemail-modal-btn" disabled={isSubmitting}   >
                                                resend again
                                        </button>
                                        </center>
                                    </Form>
                                )}

                            </Formik>
                        </div>
                        : <div class="confirmemail-code-form-container">
                            <p class="confirmemail-code-form-container-title">enter your email verification code</p>
                            <Formik
                                onSubmit={this.handleCodeSubmit}
                                initialValues={this.state.codeForm}
                                validationSchema={this.codeValidationSchema}
                            >
                                {({ errors, isSubmitting, touched }) => (
                                    <Form style={{ width: "100%" }}>
                                        <div class='form-group'>
                                            <label htmlFor='code' >code</label>
                                            <div>
                                                <Field class={errors.code && touched.code ? 'form-control  is-invalid' : 'form-control'} name="code" id="code" placeholder="Code" />
                                                <div class="invalid-feedback">
                                                    {errors.code && touched.code ? <p>{errors.code}</p> : null}
                                                </div>
                                            </div>
                                        </div>
                                        <p class="confirmemail-code-form-container-tryagain" onClick={this.sendEmailVerificationCodeAgain}>if you didn't receive your verfication code click here to send again</p>
                                        <center>
                                            <button type='submit' class="confirmemail-modal-btn" disabled={isSubmitting}   >
                                                confirm email
                                            </button>
                                        </center>
                                    </Form>
                                )}

                            </Formik>
                        </div>}
                    <div class="alert alert-success confirmemail-code-success-alert" role="alert">
                        <p>{CONFIRM_EMAIL_SENT}</p>
                        <i class="material-icons" onClick={() => this.closeAlert("forgotpassword-success-alert")} >close</i>
                    </div>
                    <div class="alert alert-danger confirmemail-invalid-email-error-alert" role="alert">
                        <p>{INVALID_EMAIL}</p>
                        <i class="material-icons" onClick={() => this.closeAlert("forgotpassword-success-alert")} >close</i>
                    </div>
                    <div class="alert alert-danger confirmemail-invalid-code-error-alert" role="alert">
                        <p>{INVALID_EMAIL_VERIFICATION_CODE}</p>
                        <i class="material-icons" onClick={() => this.closeAlert("forgotpassword-success-alert")} >close</i>
                    </div>
                </div>
            </Modal>
        )
    }
}
export default ConfirmEmailModal;