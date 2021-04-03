import React from 'react';
import { withRouter } from 'react-router-dom';
import $ from "jquery";
import './anynavbar-scss.scss';


class AnyNavbarStudent extends React.Component {
    state = {
        navBackgroundColor: "",
        sideBarOpened: false,
    }
    goTo = (path) => {
        this.props.history.push(path)
    }
    handleResize = () => {
        if (window.innerWidth > 900) {
            this.closeSideBar()
        }
    }
    componentDidMount() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 60) {
                this.setState({ navBackgroundColor: "#2E4053" })
            } else {
                this.setState({ navBackgroundColor: "" })
            }
        })
        window.addEventListener('resize', this.handleResize)
    }
    openSideBar = () => {
        $(".student-anynavbar-sidebar").css("left", "0px")
        this.setState({ sideBarOpened: true });
    }
    closeSideBar = () => {
        $(".student-anynavbar-sidebar").css("left", "-200px")
        this.setState({ sideBarOpened: false });
    }
    render() {
        let navBackgroundColor = this.state.navBackgroundColor
        let sideBarOpened = this.state.sideBarOpened;
        return (
            <div class="student-anynavbar">
                <div class="student-anynavbar-sidebar">
                    <ul class="anynavbar-items">
                        <li class="anynavbar-item">
                            <a href="#howitwork" >comment ça marche</a>
                        </li>
                        <li class="anynavbar-item">
                            <a href="#about" >à propos</a>
                        </li>
                        <li class="anynavbar-item" onClick={() => { this.props.openLoginModal() }}>
                            s'identifier
                        </li>
                        <li class="anynavbar-item" onClick={() => { this.props.openRegisterModal() }}>
                            S'inscrire
                        </li>
                    </ul>
                </div>
                <nav class="anynavbar-container" style={{ backgroundColor: navBackgroundColor }}>
                    <div class="anynavbar-menu" >
                        {!sideBarOpened ? <i onClick={this.openSideBar} class="material-icons">menu</i> : <i onClick={this.closeSideBar} class="material-icons">arrow_back</i>}
                    </div>
                    <div class="anynavbar-logo" onClick={() => { window.scrollTo(0, 0); this.goTo("/") }} >
                        <h3>mbk exam</h3>
                    </div>
                    <ul class="anynavbar-items">
                        <li class="anynavbar-item" href="/#howitwork">
                            <a href="#howitwork" >comment ça marche</a>
                        </li>
                        <li class="anynavbar-item" >
                            <a href="#about" >à propos</a>
                        </li>
                        <li class="anynavbar-item" onClick={() => { this.props.openLoginModal() }}>
                            s'identifier
                        </li>
                        <li class="anynavbar-item" onClick={() => { this.props.openRegisterModal() }}>
                            S'inscrire
                        </li>
                    </ul>
                </nav>
            </div>
        )
    }
}
export default withRouter(AnyNavbarStudent);