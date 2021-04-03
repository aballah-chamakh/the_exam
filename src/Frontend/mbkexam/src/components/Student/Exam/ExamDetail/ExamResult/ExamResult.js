import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { EXAM_RESULT_ALREADY_CHECKED, EXAM_RESULT_CERTIFIED, EXAM_RESULT_NOT_CERTIFIED, HOST_URL } from "../../../../../config";

class ExamResult extends React.Component {
    render() {
        let exam = this.props.exam;
        let fileCertificate = this.props.fileCertificate
        return (
            <>
                {
                    exam.status != "on going" && (this.props.source == "admin" || (exam.status != "in review" && this.props.source != "admin")) ?
                        <div class="exam-detail-result">
                            <div class="exam-detail-result-header" style={{ display: "flex", justifyContent: "space-between", paddingRight: "10px", alignItems: "center" }}>
                                <p>result</p>

                            </div>
                            <div class="exam-detail-result-content">
                                <div class="exam-detail-result-content-msg">
                                    {(exam.status == "succeeded" || exam.status == "failed") && this.props.source == "admin" ?
                                        <div class="exam-detail-result-content-msg-filled">
                                            <i class="material-icons"  >info</i>
                                            <p>{EXAM_RESULT_ALREADY_CHECKED}</p>
                                        </div>
                                        : exam.status == "succeeded" ?
                                            <div class="exam-detail-result-content-msg-congratulation">
                                                <i class="material-icons" style={{ color: "green" }}>verified_user</i>
                                                <p>{EXAM_RESULT_CERTIFIED}</p>
                                            </div>
                                            : exam.status == "failed" ?
                                                <div class="exam-detail-result-content-msg-goodluck">
                                                    <i class='fas fa-sad-tear'></i>
                                                    <p>{EXAM_RESULT_NOT_CERTIFIED}</p>
                                                </div> : null}
                                </div>

                                {exam.status == "in review" ?
                                    <FormControlLabel
                                        disabled={(exam.status == "succeeded" || exam.status == "failed") && this.props.source == "admin" ? true : false}
                                        control={
                                            <Switch
                                                checked={exam.certified}
                                                onChange={(e) => { this.props.updateCertified(e.target.checked) }}
                                                name="checkedB"
                                                color="primary"
                                            />
                                        }
                                        label={exam.certified ? "Certified" : "UnCertified"}
                                    /> : null}
                                {exam.status == "succeeded" || exam.status == "failed" ?
                                    <div class="exam-detail-result-content-readonlyform" >
                                        <div class="form-group">
                                            <label>Certificate</label>
                                            <div class="exam-detail-result-content-readonlyform-file">
                                                <a target="_blank" href={HOST_URL + fileCertificate.fileurl}>{fileCertificate.filename}</a>
                                            </div>
                                        </div>
                                        <div>
                                            <label>Score</label>
                                            <div class="exam-detail-result-content-readonlyform-score">
                                                <p>{exam.score}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label>Note</label>
                                            <div class="exam-detail-result-content-readonlyform-note">
                                                <p>{exam.note}</p>
                                            </div>
                                        </div>
                                    </div>
                                    : <div class="exam-detail-result-content-form" >
                                        <div class='form-group'>
                                            <label htmlFor='certificate' >Certificate</label>
                                            <div>
                                                <div class="file-certificate-input">
                                                    <input type="file" ref={el => this.inpFile = el} style={{ display: 'none' }} onChange={(e) => { this.props.handleCertificateUpload(e) }} />
                                                    <p>{fileCertificate.file || fileCertificate.filename ? fileCertificate.filename : "file name here"}</p>
                                                    <button onClick={() => { this.props.triggerCertificateUpload(this.inpFile) }}>upload</button>
                                                </div>
                                            </div>
                                        </div>
                                        <Formik
                                            onSubmit={this.props.handleSubmit}
                                            initialValues={this.props.form}
                                            validationSchema={this.props.validationSchema}
                                        >
                                            {({ errors, isSubmitting, touched }) => (
                                                <Form style={{ width: '100%' }}>
                                                    <div class='form-group'>
                                                        <label htmlFor='score' >Score</label>
                                                        <div>
                                                            <Field class="result-score-input" type="number" class={errors.score && touched.score ? 'form-control  is-invalid' : 'form-control'} name="score" id="score" placeholder="Score" />
                                                            <div class="invalid-feedback">
                                                                {errors.score && touched.score ? <p>{errors.score}</p> : null}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class='form-group'>
                                                        <label htmlFor='note' >Note</label>
                                                        <div>
                                                            <Field as={'textarea'} rows="5" class={errors.note && touched.note ? 'form-control  is-invalid' : 'form-control'} name="note" type="text" id="note" placeholder="Note" />
                                                            <div class="invalid-feedback">
                                                                {errors.note && touched.note ? <p>{errors.note}</p> : null}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button style={{ display: 'none' }} type='submit' disabled={isSubmitting} ref={(el) => this.submitBtn = el}   >
                                                        login
                        </button>

                                                </Form>
                                            )}
                                        </Formik>
                                    </div>}
                                {exam.status != "succeeded" && exam.status != "failed" ?

                                    <button class="submit-exam-result" onClick={() => { this.props.openResultModal(this.submitBtn) }}>Submit</button>
                                    : null}
                            </div>
                        </div> : null
                }</>
        )
    }
}
export default ExamResult;