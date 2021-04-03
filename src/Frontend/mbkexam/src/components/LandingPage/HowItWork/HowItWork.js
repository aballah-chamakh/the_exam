import React from 'react';
import { HOST_URL } from '../../../config';
import "./howitwork-scss.scss";



class HowItWork extends React.Component {
    downloadMbkExam = () => {
        this.downloadAnchor.click()
    }
    render() {
        return (
            <div class="howitwork-container" id="howitwork">
                <h2 class="howitwork-container-title">Comment fonctionne en 3 étapes</h2>
                <div class="howitwork-first-step">
                    <div class="howitwork-first-step-description">
                        <h3 class="howitwork-first-step-description-title">créer un compte sur MBKEXAM </h3>
                        <div class="howitwork-first-step-description-hiddenimg">
                            <img src={HOST_URL + "/media/BelkhayateNinja.png"} />
                        </div>
                        <p>
                            en haut dans la navbar cliquer sur la boutton "REGISTER" pour avoir une popup ou vous
                            remplissez toutes les champs pour vous aurez un compte sur mbkexam.com pour avoir
                            un interface ou vous allez creer un examen et voyez votre trade en temp réél
                        </p>
                        <a style={{ display: "none" }} ref={(downloadAnchor) => this.downloadAnchor = downloadAnchor} href={HOST_URL + '/media/MbkExamNT8.zip'} target="_blank" rel="noopener noreferrer" download>Click to download</a>
                        <button class="howitwork-first-step-description-downlaod-button" onClick={this.downloadMbkExam}>donwload</button>
                    </div>
                    <div class="howitwork-first-step-img">
                        <img src={HOST_URL + "/media/BelkhayateNinja.png"} />
                    </div>
                </div>
                <div class="howitwork-second-step">
                    <div class="howitwork-first-step-img">
                        <img src={HOST_URL + "/media/mbkexam_account.png"} />
                    </div>
                    <div class="howitwork-first-step-description">
                        <h3 class="howitwork-second-step-description-title">installer l'extension MBKEXAM </h3>
                        <div class="howitwork-second-step-description-hiddenimg">
                            <img src={HOST_URL + "/media/mbkexam_account.png"} />
                        </div>
                        <p>
                            installer l'extension mbkexam et s'identifier avec l'email et le mot de passe avec qui vous
                            avez créer votre compte sur mbkexam.com cette platforme vous permet de envoyez toutes les
                            information trades que vous etes entrain de faire à la plateforme web en temp réel et d'une
                            maniére automatique
                        </p>

                    </div>
                </div>
                <div class="howitwork-third-step">
                    <div class="howitwork-first-step-description">
                        <h3 class="howitwork-second-step-description-title">Créer un nouveau examen</h3>
                        <div class="howitwork-third-step-description-hiddenimg">
                            <img src={HOST_URL + "/media/belkhayatechampion.jpg"} />
                        </div>
                        <p>
                            apres que vous avez créér un compte sur mbkexam.com et installez l'extension MBKEXAM
                            sur ninjatrader c'est le temp du passez votre examen pou cela il faut que vous s'identidfier
                            dans la plateforme en cliquant sur la button Login et en entrant vos information par la
                            suite vous allez en face du votre interface là il faut cliquer sur la button nouveau examen,
                            une popup va s'afficher ou vous allez nommé votre examen par la suite vous etre redirectioné
                            vers une page ou toutes les detail du votre examen qui s'affiche en temps réel (les trades, les
                            kpis ...) et dés que la duréedu votres examen va finir Mr Belkhayate va analyser vos trades
                            et vous donnez les resultat du votre examen
                    </p>
                    </div>
                    <div class="howitwork-first-step-img">
                        <img src={HOST_URL + "/media/belkhayatechampion.jpg"} />
                    </div>
                </div>
            </div>
        )
    }
}
export default HowItWork;