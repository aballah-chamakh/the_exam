export const HOST_URL = "http://127.0.0.1:8000";
export const STUDENT_LOGIN_ERROR = "invalid credentials , try again";
export const EMAIL_ALREADY_EXIST_ERROR = "l'email existe déjà";
export const ACCOUNT_SETTING_INVALID_PASSWORD = "Invalid password , enter the right password and submit again";
export const ACCOUNT_SETTING_NO_UPDATE_RECOGNIZED = "no update was recognized";
export const EXAM_RESULT_ALREADY_CHECKED = "this exam is already checked this is why you can't edit it";
export const EXAM_RESULT_CERTIFIED = "Félicitations, vous avez réussi l'examen";
export const EXAM_RESULT_NOT_CERTIFIED = "bonne chance pour la prochaine fois";
export const STUDENT_PROFILE_SETTING_NO_UPDATE_RECOGNIZED = "no update was recognized";
export const STUDENT_PROFILE_SETTING_INVALID_PASSWORD = "l'email existe déjà";
export const STUDENT_SUPPORT_CLAIM_SUCCESSFULLY_SUBMITTED = "you claim was successfully submited to the adminstration"
export const NO_STUDENT = "no student exist"
export const NO_CLAIM = "no claim exist"
export const NO_NOTIFICATION = "no notification exist"
export const NO_EXAM = "no exam created yet"
export const EMAIL_DOESNT_EXIST = "ce email n'exist pas"
export const RESET_EMAIL_PASSWORD_SENT = "ton mot de passe il etait envoyé par email"
export const CONFIRM_EMAIL_SENT = "un code pour verifier votre email a été envoyer à votre email"
export const INVALID_EMAIL_VERIFICATION_CODE = "code du verification d'email est invalide";
export const INVALID_EMAIL = "ce email est invalide";
export const MAX_FILE_SIZE_IN_MB = 3;
export const formatDateTime = (datetime_inp) => {
    let datetime = new Date(datetime_inp)
    let hours = datetime.getHours()
    if (hours < 10) {
        hours = "0" + hours
    }
    let minutes = datetime.getMinutes()
    if (minutes < 10) {
        minutes = "0" + minutes
    }
    let seconds = datetime.getSeconds()
    if (seconds < 10) {
        seconds = "0" + seconds
    }
    let day = datetime.getDate()
    if (day < 10) {
        day = "0" + day
    }
    let month = datetime.getMonth() + 1
    if (month < 10) {
        month = "0" + month
    }
    let year = datetime.getUTCFullYear()
    return hours + ":" + minutes + ":" + seconds + " " + day + "/" + month + "/" + year
}
export default {
    HOST_URL,
    formatDateTime,
    STUDENT_SUPPORT_CLAIM_SUCCESSFULLY_SUBMITTED,
    STUDENT_PROFILE_SETTING_INVALID_PASSWORD,
    STUDENT_PROFILE_SETTING_NO_UPDATE_RECOGNIZED,
    EXAM_RESULT_NOT_CERTIFIED,
    EXAM_RESULT_ALREADY_CHECKED,
    ACCOUNT_SETTING_NO_UPDATE_RECOGNIZED,
    ACCOUNT_SETTING_INVALID_PASSWORD,
    EMAIL_ALREADY_EXIST_ERROR,
    STUDENT_LOGIN_ERROR,
    NO_STUDENT,
    NO_NOTIFICATION,
    NO_CLAIM,
    NO_EXAM
}




