import React from 'react'
import skillsBadgesArray from './SkillsBadgesData'

const Skills = () => {

    // console.log(SkillsBadgesArray)

    const mappedBadges = skillsBadgesArray.map( (badge, i ) => {
        let imageClass = 'skill-badge-image'
        
        if(i < 5) imageClass = 'skill-badge-image-long'

        return (
            <img className={imageClass} src={badge} alt='skill-badge' />
        )
    })

    return(
        <div className='skills-wrapper'>
            {/* <h2 className='work-card-title'>  This is the Skills Container </h2> */}
            {mappedBadges}
        </div>
    )
}

export default Skills