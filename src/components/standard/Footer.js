import React from 'react'
import githubIcon from '../../assets/about/github.png'
import linkedinIcon from '../../assets/about/linkedin.png'
import emailIcon from '../../assets/about/email.png'

const Footer = () => {



    return(
        <div className='footer-wrapper'>

            <h1>© 2020 Eric Lingren</h1>
            
            <div className='footer-contact-icon-wrapper'>
                <a target='_blank' rel="noopener noreferrer" href='https://www.github.com/Eric-Lingren'>
                    <img className='footer-contact-icon-github' src={githubIcon} alt='github' />
                </a>
                <a target='_blank' rel="noopener noreferrer" href='https://www.linkedin.com/in/ericlingren/'>
                    <img className='footer-contact-icon-linkedin' src={linkedinIcon} alt='linkedin' />
                </a>
                <a href='mailto:ericlingren@gmail.com'>
                    <img className='footer-contact-icon-email' src={emailIcon} alt='email' />
                </a>
            </div>

        </div>
    )
}

export default Footer