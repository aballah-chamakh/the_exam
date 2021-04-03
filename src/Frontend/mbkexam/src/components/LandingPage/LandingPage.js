import React from 'react';
import AnyNavbarStudent from "../Student/Navbar/AnyNavbar/AnyNavbarStudent";
import { HOST_URL } from '../../config';
import "./landingpage-scss.scss";
import LoginModal from "../Student/Authentication/LoginModal/LoginModal";
import RegisterModal from "../Student/Authentication/RegisterModal/RegisterModal";
import ForgotPasswordModal from "../Student/ForgotPasswordModal/ForgotPasswordModal";
import ResetPasswordModal from "../Student/ResetPasswordModal/ResetPasswordModal";
import ConfirmEmailModal from "../Student/ConfirmEmailModal/ConfirmEmailModal";
import HowItWork from "./HowItWork/HowItWork";
import BelkhayateJourney from "./BelkhayateJourney/BelkhayateJourney";
import Footer from "./Footer/Footer";
import $ from "jquery";


class LandingPage extends React.Component {
    state = {
        loginModalVisibility: false,
        registerModalVisibility: false,
        ForgotPasswordModalVisibility: false,
        resetPasswordModalVisibility: false,
        confirmEmailModalVisibility: false,
    }
    closeLoginModal = () => {
        this.setState({ loginModalVisibility: false })
    }
    openLoginModal = () => {
        this.setState({ loginModalVisibility: true })
    }
    openRegisterModal = () => {
        this.setState({ registerModalVisibility: true })
    }
    closeRegisterModal = () => {
        this.setState({ registerModalVisibility: false })
    }
    openResetPasswordModal = () => {
        this.setState({ resetPasswordModalVisibility: true })
    }
    closeResetPasswordModal = () => {
        this.setState({ resetPasswordModalVisibility: false })
    }
    openForgotPasswordModal = () => {
        this.setState({ forgotPasswordModalVisibility: true })
    }
    closeForgotPasswordModal = () => {
        this.setState({ forgotPasswordModalVisibility: false })
    }
    openConfirmEmailModal = () => {
        this.setState({ confirmEmailModalVisibility: true })
    }
    closeConfirmEmailModal = () => {
        this.setState({ confirmEmailModalVisibility: false })
    }

    triggerResetPasswordTokenExpired = () => {
        $('.resetpasswordtokenexpired-error-alert').show(200).css('display', 'flex').delay(5000).hide(200)
    }
    closeAlert = () => {
        $('.resetpasswordtokenexpired-error-alert').hide(200)
    }


    componentDidMount = () => {
        window.scrollTo(0, 0)
        //this.openConfirmEmailModal()
        let urlParams = new URLSearchParams(window.location.search);
        let reset_token = urlParams.get('reset_token');
        if (reset_token) {
            this.openResetPasswordModal()
        }
        console.log("reset token ========================================== ")
        console.log(reset_token)
    }
    render() {

        console.log("reset token ========================================== ")
        let backImg = HOST_URL + "/media/mbk-landingpage.jpg"

        return (
            <div class="landingpage-container">
                <div class="alert alert-danger resetpasswordtokenexpired-error-alert" role="alert">
                    <p>you reset password token is expired , try again to reset password </p>
                    <i class="material-icons" onClick={() => this.closeAlert("forgotpassword-success-alert")} >close</i>
                </div>
                <ResetPasswordModal triggerResetPasswordTokenExpired={this.triggerResetPasswordTokenExpired} resetPasswordModalVisibility={this.state.resetPasswordModalVisibility} close={this.closeResetPasswordModal} openForgotPasswordModal={this.openForgotPasswordModal} openLoginModal={this.openLoginModal} />
                <ForgotPasswordModal forgotPasswordModalVisibility={this.state.forgotPasswordModalVisibility} close={this.closeForgotPasswordModal} />
                <LoginModal openConfirmEmailModal={this.openConfirmEmailModal} openForgotPasswordModal={this.openForgotPasswordModal} loginModalVisibility={this.state.loginModalVisibility} close={this.closeLoginModal} />
                <RegisterModal registerModalVisibility={this.state.registerModalVisibility} close={this.closeRegisterModal} openConfirmEmailModal={this.openConfirmEmailModal} />
                <ConfirmEmailModal confirmEmailModalVisibility={this.state.confirmEmailModalVisibility} close={this.closeConfirmEmailModal} openLoginModal={this.openLoginModal} />
                <div class="landingpage-img" style={{ backgroundImage: `url(${backImg})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', margin: "0px", padding: "0px" }} >
                    <AnyNavbarStudent openLoginModal={this.openLoginModal} openRegisterModal={this.openRegisterModal} />
                    <div class="landingpage-calltoaction">
                        <p>Passez maintenant la certificat "Belkhayate Method" en ligne avec une maniére innovante et confortable</p>
                        <button onClick={this.openRegisterModal}>commencez</button>
                    </div>
                    <div class="landingpage-layer"></div>
                </div>
                <div class="landingpage-content">
                    <HowItWork />
                    <BelkhayateJourney />
                </div>
                <Footer />
            </div>
        )
    }
}
export default LandingPage;