import React from 'react'
import { Element } from 'react-scroll'
import profileRound from '../../../assets/about/profile-round.jpg'
import githubIcon from '../../../assets/about/github.png'
import linkedinIcon from '../../../assets/about/linkedin.png'
import emailIcon from '../../../assets/about/email.png'

const About = () => {

    return(
        <>
            <Element name='about'>
                <div className='about-container'>
                    <div className='about-content-container'>
                        <img className='profile-picture' src={profileRound} alt='profile' />
                        <div>
                            <div className='text-container'>
                                <p className='about-text'> I am passionate about learning new things, helping others achieve their full potential, solving challenging problems and telling stories through data. </p>
                                <p className='about-text'> In my free time I enjoy gardening, fishing, sailing and vintage video games. </p>
                                <p className='about-text'> I am also an avid traveler and have been to more than {' '}
                                    <a className='countries-link' target='_blank' rel="noopener noreferrer" href='https://www.google.com/maps/d/u/0/edit?mid=1YB7JYG2UK7EyiVxPEPE4YjJtZQ_y2cjL&ll=4.7542124741991785%2C0&z=2'>
                                        30 countries
                                    </a>. 
                                </p>

                            </div>
                            <div className='contact-icon-wrapper'>
                                <a target='_blank' rel="noopener noreferrer" href='https://www.github.com/Eric-Lingren'>
                                    <img className='about-contact-icon-github' src={githubIcon} alt='github' />
                                </a>
                                <div className='contact-icon-spacer'/>
                                <a target='_blank' rel="noopener noreferrer" href='https://www.linkedin.com/in/ericlingren/'>
                                    <img className='about-contact-icon-linkedin' src={linkedinIcon} alt='linkedin' />
                                </a>
                                <div className='contact-icon-spacer'/>
                                <a href='mailto:ericlingren@gmail.com'>
                                    <img className='about-contact-icon-email' src={emailIcon} alt='email' />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </Element>
        </>
    )
}

export default About