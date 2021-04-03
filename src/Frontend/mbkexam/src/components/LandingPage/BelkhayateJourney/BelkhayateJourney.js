import React from 'react';
import { HOST_URL } from "../../../config";
import "./belkhayatejourney-scss.scss";

class BelkhayateJourney extends React.Component {

    render() {
        return (
            <div class="belkhayatejourney-container" id="about">
                <p class="belkhayatejourney-hiddentitle">Mr. El Mostapha Belkhayate</p>
                <div class="belkhayatejourney-img">
                    <img src={HOST_URL + "/media/mbkjourney.jpg"} />
                </div>
                <div class="belkhayatejourney-description">
                    <p class="belkhayatejourney-description-title">Mr. El Mostapha Belkhayate</p>
                    <ul>
                        <li>1999 : Champion du monde de Trading.</li>
                        <li>2005 : 4% par mois sur 36 mois en gérant un fonds canadien d’or physique.</li>
                        <li>2006 : Classé par Bloomberg meilleur gérant de fonds sur matières premières sur plus de 6000 fonds</li>
                        <li>2009 : Trophée d’Or de l’Analyse Technique et Graphique à Paris</li>
                        <li>2012 : Belkhayate  System remporte à Los Angeles  la compétition internationale des algorithmes de trading automatiques.</li>
                        <li>2018  : Laboratoire de Recherche pour faire tourner ses algorithmes sur l’Intelligence Artificielle</li>
                    </ul>
                </div>
            </div>
        )
    }
}
export default BelkhayateJourney;