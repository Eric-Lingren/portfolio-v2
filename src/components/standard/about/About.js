import React from 'react'
import profileRound from '../../../assets/about/profile-round.png'
import githubIcon from '../../../assets/about/github.png'
import linkedinIcon from '../../../assets/about/linkedin.png'
import emailIcon from '../../../assets/about/email.png'

const About = () => {

    return(
        <div className='about-container'>
            <div className='about-content-container'>
                <img className='profile-picture' src={profileRound} alt='profile-picture' />
                <div>
                    <div className='text-container'>
                        <p className='about-text'> I am an avid traveler and have been to more than 
                            <a className='countries-link' target='_blank' href='https://www.google.com/maps/d/u/0/edit?mid=1YB7JYG2UK7EyiVxPEPE4YjJtZQ_y2cjL&ll=4.7542124741991785%2C0&z=2'>
                                30 countries
                            </a>. 
                        </p>
                        <p className='about-text'> In my free time I enjoy gardening, fishing and vintage video games. </p>
                        <p className='about-text'> I am passionate about learning new things, helping others achieve their full potential and solving challenging problems. </p>
                    </div>
                    <div className='contact-icon-wrapper'>
                        <a target='_blank' href='https://www.github.com/Eric-Lingren'>
                            <img className='about-contact-icon-github' src={githubIcon} alt='github-picture' />
                        </a>
                        <a target='_blank' href='https://www.linkedin.com/in/ericlingren/'>
                            <img className='about-contact-icon-linkedin' src={linkedinIcon} alt='linkedin-picture' />
                        </a>
                        <a href='mailto:ericlingren@gmail.com'>
                            <img className='about-contact-icon-email' src={emailIcon} alt='email-picture' />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default About