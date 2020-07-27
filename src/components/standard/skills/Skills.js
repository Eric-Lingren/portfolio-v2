import React from 'react'
import { Element } from 'react-scroll'
import skillsBadgesArray from './SkillsBadgesData'

const Skills = () => {

    const mappedBadges = skillsBadgesArray.map( (badge, i ) => {
        let imageClass = 'skill-badge-image'
        if(i < 5) imageClass = 'skill-badge-image-long'
        return (
            <img className={imageClass} src={badge} alt='skill-badge' key={i}/>
        )
    })

    return(
        <>
            <Element name='skills'>
                <div className='skills-wrapper'>
                    {mappedBadges}
                </div>
            </Element>
        </>
    )
}

export default Skills