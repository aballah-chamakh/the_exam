import React from 'react';
import Modal from 'react-bootstrap/Modal'
import ModalHeader from 'react-bootstrap/ModalHeader'
import ModalTitle from 'react-bootstrap/ModalTitle'
import ModalBody from 'react-bootstrap/ModalBody'
import ModalFooter from 'react-bootstrap/ModalFooter'
import './resultmodal-scss.scss';
import Button from 'react-bootstrap/Button'

class ResultModal extends React.Component {
    render() {
        return (

            <Modal show={true} onHide={this.props.handleResultModalClose} animation={true}>
                <div class="resultmodal-container">
                    <div class="resultmodal-container-header">
                        <p>New Exam</p>
                        <i class="material-icons" onClick={this.props.close} >close</i>
                    </div>
                    <div class="resultmodal-container-content" >
                        <i class="material-icons">warning</i>
                        <p>Are sure you want to send this result because you can't go back</p>
                    </div>
                    <div class="resultmodal-container-footer">
                        <button class="resultmodal-container-footer-no" onClick={this.props.handleResultModalClose} >No</button>
                        <button class="resultmodal-container-footer-yes" onClick={this.props.handlResutlModalYes}>Yes</button>
                    </div>
                </div>
            </Modal>

        )
    }
}
export default ResultModal;