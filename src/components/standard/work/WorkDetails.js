import React, { useEffect } from 'react'
import "react-responsive-carousel/lib/styles/carousel.min.css"
import { Carousel } from 'react-responsive-carousel'
import WorkDetailsNavbar from './WorkDetailsNav'
import workData from './workData.js'

const WorkDetails = ({ match }) => {

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])


    let id = parseInt(match.params.id)
    let work = workData.filter(workItem => workItem.id === id)
    work = work[0]

    const liveLinkAvailable = work.liveLink.length > 0
    const liveLinkClass = liveLinkAvailable ? 'work-details-link-available' : 'work-details-link-not-available'
    const githubLinkAvailable = work.gitLink.length > 0
    const githubLinkClass = githubLinkAvailable ? 'work-details-link-available' : 'work-details-link-not-available'

    const mappedCarouselImages = work.images.map( (image, i) => {
        return <img src={image} key={i} alt='project' className='carousel-image'  />
    })

    const mappedLanguages = work.languages.map( (language, i) => {
        if( i < work.languages.length-1){
            return <span key={i} className=''> {language}, </span>
        }else{
            return <span key={i} className=''> {language} </span>
        }
    })

    const mappedAdditionalLinks = work.additionalAssets.length && work.additionalAssets.map( (resource, i) => {
        return(
            <a href={resource} target='_blank' rel='noopener noreferrer' className='additional-resources-link'>
                <span key={i} > Resource {i+1} </span>
            </a>
        )
    })

    const mappedTags = work.tags.map( (tag, i) => {
        if( i < work.tags.length-1){
            return <span key={i} className=''> {tag}, </span>
        }else{
            return <span key={i} className=''> {tag} </span>
        }
    })

    return(
        <div className='standard-site-wrapper'>
            <div className='standard-site-container'>
                <WorkDetailsNavbar />
                <div className='work-details-layout'>
                    <h1 className='work-details-title'> {work.title} </h1>
                    <div className='carousel-container-layout'>
                        <div className='carousel-container'>
                            <Carousel 
                                autoPlay 
                                infiniteLoop 
                                useKeyboardArrows
                                showThumbs={false}
                                showStatus={false}
                            >
                                {mappedCarouselImages}
                            </Carousel>
                        </div>
                    </div>

                    <div className='work-details-link-container'>
                        <a 
                            href={liveLinkAvailable ? work.liveLink : undefined}
                            className={liveLinkClass} 
                            target='blank' 
                        > 
                            <div> Live Site </div>
                            <div> {liveLinkAvailable > 0 ? 'Available Here' : 'Not Available'} </div>
                        </a>
                        <a 
                            href={githubLinkAvailable ? work.gitLink : undefined}
                            className={githubLinkClass} 
                            target='blank'> 
                            <div> Github Repo </div>
                            <div> {githubLinkAvailable > 0 ? 'Available Here' : 'Not Available'} </div>
                        </a>
                    </div>
                    {
                        work.additionalAssets.length > 0 &&
                        <div className='additional-assets-container'> 
                            <h3 className='additiona-assets-header'> Additional Resources: </h3>
                            <div className='additional-assets-link-container'>
                                {mappedAdditionalLinks} 
                            </div>
                        </div>
                    }
                    <div className='work-details-text-wrapper'>
                        <div className='work-details-text-container'>
                            <h1 className='work-details-text-header description'> Description </h1>
                            <p className='work-details-text'> {work.detailsDescription} </p>
                        </div>
                        <div className='work-details-text-container'>
                            <h1 className='work-details-text-header objective'> Objective </h1>
                            <p className='work-details-text'> {work.objective} </p>
                        </div>
                        <div className='work-details-text-container'>
                            <h1 className='work-details-text-header challenges'> Challenges </h1>
                            <p className='work-details-text'> {work.challenges} </p>
                        </div>
                        <div className='work-details-text-container'>
                            <h1 className='work-details-text-header learned'> Learned </h1>
                            <p className='work-details-text'> {work.learned} </p>
                        </div>
                        <div className='work-details-text-container'>
                            <h1 className='work-details-text-header languages'> Languages </h1>
                            <p className='work-details-text'> {mappedLanguages} </p>
                        </div>
                        <div className='work-details-text-container'>
                            <h1 className='work-details-text-header tags'> Tags </h1>
                            <p className='work-details-text'> {mappedTags} </p>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    )
}

export default WorkDetails