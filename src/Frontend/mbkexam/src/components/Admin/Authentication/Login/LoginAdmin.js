import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { connect } from 'react-redux';
import './loginadmin-scss.scss';
import { HOST_URL } from '../../../../config';
import $ from "jquery";
import jwt_decode from "jwt-decode";

class LoginAdmin extends React.Component {
  state = {
    form: { email: '', password: '' },

  }
  handleSubmit = (credentials, { setSubmitting, resetForm }) => {
    axios.post(HOST_URL + '/api/token/', credentials).then(res => {
      let token = res.data.access;
      let decodedToken = jwt_decode(token)
      let is_student = decodedToken['is_student']
      if (is_student) {
        setSubmitting(false)
        resetForm()
        $(".adminlogin-error").show(200)
        $(".adminlogin-error").css('display', 'flex')
        return;
      }
      let refreshToken = res.data.refresh;
      localStorage.setItem('token', token)
      localStorage.setItem('refresh_token', refreshToken)
      this.props.admin_login()
      let decoded_token = jwt_decode(token)
      console.log(decoded_token)
      let adminprofile_slug = decoded_token.adminprofile_slug
      this.props.history.push('/mbk_admin/' + adminprofile_slug + '/students/')
    }).catch(err => {
      setSubmitting(false)
      resetForm()
      $(".adminlogin-error").show(200)
      $(".adminlogin-error").css('display', 'flex')
    })


  }

  validationSchema = Yup.object().shape({
    email: Yup.string().email().required(),
    password: Yup.string().min(8).required(),
  })
  close = () => {
    $(".adminlogin-error").hide(200)
  }
  render() {
    console.log(this.state.form);
    return (
      <div class='adminlogin-container'>
        <div class="alert alert-danger adminlogin-error" role="alert">
          <p>Invalid credentials , try again</p>
          <i class="material-icons" onClick={this.close} >close</i>
        </div>
        <img src={HOST_URL + "/media/mb_img1.jpg"} />
        <div class='adminlogin-form'>
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
                <div class='form-group '>
                  <label htmlFor='password' >Password</label>
                  <div>
                    <Field class={errors.password && touched.password ? 'form-control  is-invalid' : 'form-control'} name="password" type="password" id="password" placeholder="Password" />
                    <div class="invalid-feedback">
                      {errors.password && touched.password ? <p>{errors.password}</p> : null}
                    </div>
                  </div>
                </div>
                <center><button type='submit' disabled={isSubmitting}   >
                  login
      </button></center>
              </Form>


            )}
          </Formik>

        </div>
      </div>
    )
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    admin_login: () => dispatch({ type: 'admin_login' }),
  }
}

export default connect(null, mapDispatchToProps)(LoginAdmin);
