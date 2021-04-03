import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import "./forgotpasswordmodal-scss.scss";
import { HOST_URL, EMAIL_DOESNT_EXIST, RESET_EMAIL_PASSWORD_SENT } from '../../../config';
import Modal from 'react-bootstrap/Modal'
import $ from 'jquery';
import axios from "axios";

class ForgotPasswordModal extends React.Component {
    state = {
        form: {
            email: ""
        },
        emailSent: false,
    }
    validationSchema = Yup.object().shape({
        email: Yup.string().email().required(),

    })
    closeAlert = (className) => {
        $("." + className).hide()
    }
    handleSubmit = (emailData, { setSubmitting, resetForm, setFieldValue, setFieldError }) => {

        axios.put(HOST_URL + "/api/reset_email_password/", emailData).then(res => {
            $(".forgotpassword-success-alert").show(200).css("display", "flex").delay(10000).hide(200)
            $(".forgotpassword-form-container-tryagain").show(200).delay(20000).hide(200)
            setSubmitting(false)
            resetForm()
        }).catch(err => {

            if (err.response.status == 401) {
                console.log("stooooooooooooooooooooooooooooop !! mmmmmmmmmmmmm")
                setFieldError("email", "ce e-mail n'existe pas");
                setSubmitting(false)

            }
        })
    }

    render() {
        return (
            <Modal show={this.props.forgotPasswordModalVisibility} onHide={this.props.close} animation={true} >
                <div class="forgotpassword-container">
                    <div class="forgotpassword-form-container">
                        <p class="forgotpassword-form-container-title">Entrez votre e-mail pour réinitialiser votre mot de passe</p>
                        <Formik
                            onSubmit={this.handleSubmit}
                            initialValues={this.state.form}
                            validationSchema={this.validationSchema}
                        >
                            {({ errors, isSubmitting, touched }) => (
                                <Form style={{ width: "100%" }}>
                                    <div class='form-group'>
                                        <label htmlFor='email' >Email</label>
                                        <div>
                                            <Field class={errors.email && touched.email ? 'form-control  is-invalid' : 'form-control'} name="email" id="email" placeholder="Email" />
                                            <div class="invalid-feedback">
                                                {errors.email && touched.email ? <p>{errors.email}</p> : null}
                                            </div>
                                        </div>
                                    </div>
                                    <p class="forgotpassword-form-container-tryagain">if you didn't receive your email you can try again</p>
                                    <center>
                                        <button type='submit' class="forgotpasswordemail-modal-btn" disabled={isSubmitting}   >
                                            envoyer
                                        </button>
                                    </center>
                                </Form>
                            )}

                        </Formik>
                    </div>
                    <div class="alert alert-success forgotpassword-success-alert" role="alert">
                        <p>{RESET_EMAIL_PASSWORD_SENT}</p>
                        <i class="material-icons" onClick={() => this.closeAlert("forgotpassword-success-alert")} >close</i>
                    </div>
                </div>
            </Modal>
        )
    }
}
export default ForgotPasswordModal;