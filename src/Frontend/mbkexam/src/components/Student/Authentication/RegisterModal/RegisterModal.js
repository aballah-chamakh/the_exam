import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { connect } from 'react-redux';
import './registermodal-scss.scss';
import { HOST_URL, EMAIL_ALREADY_EXIST_ERROR } from '../../../../config';
import Modal from 'react-bootstrap/Modal';
import { withRouter } from "react-router-dom";
import jwt_decode from "jwt-decode";
import $ from 'jquery';

class RegisterModal extends React.Component {
  state = {
    form: { email: '', username: '', password: '', confirmPassword: '' },
  }

  handleSubmit = (newStudentData, { setSubmitting, resetForm, setFieldValue, setFieldError }) => {
    let data = newStudentData
    data['is_student'] = true;
    data['admin'] = false;
    axios.post(HOST_URL + '/api/user/', data).then(res => {
      setSubmitting(false)
      this.props.openConfirmEmailModal();
      this.props.close()
      /*
      let token = res.data.access
      let refreshToken = res.data.refresh
      let decodedToken = jwt_decode(token)
      let studentprofile_slug = decodedToken['studentprofile_slug'];
      localStorage.setItem('token', token)
      localStorage.setItem('refresh_token', refreshToken)
      this.props.student_login()
      this.props.history.push('/student/' + studentprofile_slug + '/')
      */
    }).catch(err => {
      console.log(err)
      //resetForm()
      let res_code = err.response.status
      if (res_code == 409) {
        console.log("handle email doest exist")
        console.log($('.studentregister-error-alert'))
        $('.studentregister-error-alert').show().css('display', 'flex').delay(5000).hide(200)

        resetForm()
        /*
        setFieldValue('password', '')
        setFieldValue('confirmPassword', '')
        */
      }
    })


  }

  validationSchema = Yup.object().shape({
    email: Yup.string().email().required(),
    username: Yup.string().required(),
    password: Yup.string().min(8).required(),
    confirmPassword: Yup.string().min(8).required().oneOf([Yup.ref('password'), null], 'Passwords must match'),
  })

  render() {
    return (
      <Modal show={this.props.registerModalVisibility} onHide={this.props.close} animation={true}  >
        <div class='studentregister-container'>
          <div class='studentregister-form'>
            <p class="studentregister-form-title">CRÉER UN COMPTE</p>
            <Formik
              onSubmit={this.handleSubmit}
              initialValues={this.state.form}
              validationSchema={this.validationSchema}
            >
              {({ errors, isSubmitting, touched }) => (
                <Form style={{ width: '100%' }}>

                  <div class='form-group'>
                    <label htmlFor='email' >Email</label>
                    <div>
                      <Field class={errors.email && touched.email ? 'form-control  is-invalid' : 'form-control'} name="email" id="email" placeholder="Email" />
                      <div class="invalid-feedback">
                        {errors.email && touched.email ? <p>{errors.email}</p> : null}
                      </div>
                    </div>
                  </div>
                  <div class='form-group'>
                    <label htmlFor='username' >Username</label>
                    <div>
                      <Field class={errors.username && touched.username ? 'form-control  is-invalid' : 'form-control'} name="username" id="username" placeholder="username" />
                      <div class="invalid-feedback">
                        {errors.username && touched.username ? <p>{errors.username}</p> : null}
                      </div>
                    </div>
                  </div>
                  <div class='form-group '>
                    <label htmlFor='password' >Password</label>
                    <div>
                      <Field class={errors.password && touched.password ? 'form-control  is-invalid' : 'form-control'} name="password" type="password" id="password" placeholder="Password" />
                      <div class="invalid-feedback">
                        {errors.password && touched.password ? <p>{errors.password}</p> : null}
                      </div>
                    </div>
                  </div>
                  <div class='form-group '>
                    <label htmlFor='confirmPassword' >Confirm Password</label>
                    <div>
                      <Field class={errors.confirmPassword && touched.confirmPassword ? 'form-control  is-invalid' : 'form-control'} name="confirmPassword" type="password" id="confirmPassword" placeholder="confirmPassword" />
                      <div class="invalid-feedback">
                        {errors.confirmPassword && touched.confirmPassword ? <p>{errors.confirmPassword}</p> : null}
                      </div>
                    </div>
                  </div>
                  <center><button type='submit' disabled={isSubmitting}   >
                    créer
                  </button></center>
                </Form>


              )}
            </Formik>

          </div>
          <div class="alert alert-danger studentregister-error-alert" role="alert">
            <p>{EMAIL_ALREADY_EXIST_ERROR}</p>
            <i class="material-icons" onClick={() => this.closeAlert("register-error-alert")} >close</i>
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

export default withRouter(connect(null, mapDispatchToProps)(RegisterModal));
