import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { connect } from 'react-redux';
import { withRouter } from "react-router-dom";
import './loginmodal-scss.scss';
import { HOST_URL, STUDENT_LOGIN_ERROR } from '../../../../config';
import Modal from 'react-bootstrap/Modal'
import jwt_decode from "jwt-decode";
import $ from "jquery"

class LoginModal extends React.Component {
  state = {
    form: { email: '', password: '' },
  }
  handleSubmit = (credentials, { setSubmitting, resetForm }) => {
    console.log("Host url => " + HOST_URL)
    axios.post(HOST_URL + '/api/token/', credentials).then(res => {
      let token = res.data.access;
      let refreshToken = res.data.refresh;
      let decoded_token = jwt_decode(token)
      let is_admin = decoded_token['is_admin']
      if (is_admin) {
        $(".studentlogin-error").show(200)
        $(".studentlogin-error").css("display", "flex")
        resetForm()
        setSubmitting(false)
        return
      }
      localStorage.setItem('token', token)
      localStorage.setItem('refresh_token', refreshToken)
      this.props.student_login()
      console.log(decoded_token)
      let studentprofile_slug = decoded_token.studentprofile_slug
      this.props.history.push('/student/' + studentprofile_slug + '/')
    }).catch(err => {
      let err_code = err.response.status;
      if (err_code == 403) {
        this.props.openConfirmEmailModal();
        this.props.close();
      } else {
        $(".studentlogin-error").show(200).css('display', 'flex').delay(5000).hide(200)
      }
      // $(".studentlogin-error").css("display", "flex")
      resetForm()
      setSubmitting(false)

    })


  }

  validationSchema = Yup.object().shape({
    email: Yup.string().email().required(),
    password: Yup.string().min(8).required(),
  })
  close = () => {
    $(".studentlogin-error").hide(200)
  }
  forgotPassword = () => {
    this.props.openForgotPasswordModal()
    this.props.close()
    console.log("done done !!!!!!!!!!!!!!")
  }
  render() {
    return (
      <Modal show={this.props.loginModalVisibility} onHide={this.props.close} animation={true}  >
        <div class='studentlogin-container'>
          <div class="alert alert-danger studentlogin-error" role="alert">
            <p>{STUDENT_LOGIN_ERROR}</p>
            <i class="material-icons" onClick={this.close} >close</i>
          </div>
          <div class='studentlogin-form'>
            <p class="studentlogin-form-title">Connectez-vous à votre compte</p>
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
                  <div class='form-group '>
                    <label htmlFor='password' >mot de passe</label>
                    <div>
                      <Field class={errors.password && touched.password ? 'form-control  is-invalid' : 'form-control'} name="password" type="password" id="password" placeholder="mot de passe" />
                      <div class="invalid-feedback">
                        {errors.password && touched.password ? <p>{errors.password}</p> : null}
                      </div>
                    </div>
                  </div>
                  <center>
                    <button type='submit' class="login-modal-btn" disabled={isSubmitting}>s'identifier</button>
                    <button class="forgotpassword-login-modal" type="button" onClick={this.forgotPassword}>mot de passe oublié</button>
                  </center>
                </Form>


              )}

            </Formik>

          </div>
        </div>
      </Modal>
    )
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    student_login: () => dispatch({ type: 'student_login' }),
  }
}

export default withRouter(connect(null, mapDispatchToProps)(LoginModal));
