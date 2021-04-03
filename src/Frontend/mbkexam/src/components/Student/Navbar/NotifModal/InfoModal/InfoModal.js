import React from 'react' ;
import Modal from 'react-awesome-modal';

class InfoModal extends React.Component{
    render(){
        return(
        <Modal visible={this.props.visible} width="400" height="300" effect="fadeInUp" onClickAway={() => this.closeModal()}>
            <div>
                <h1>Title</h1>
                <p>Some Contents</p>
                <a href="javascript:void(0);" onClick={() => this.props.closeModal()}>Close</a>
            </div>
        </Modal>
        )
    }
}
export default InfoModal ;