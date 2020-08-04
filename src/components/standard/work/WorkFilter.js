import React, { useState } from 'react'

const WorkFilter = ({filterWork}) => {
    
    const [isBackendChecked, setIsBackendChecked] = useState(true)
    const [isFrontendChecked, setIsFrontendChecked] = useState(true)
    const [isFullstackChecked, setIsFullstackChecked] = useState(true)
    const [isDatabaseChecked, setIsDatabaseChecked] = useState(true)
    const [isSecurityChecked, setIsSecurityChecked] = useState(true)
    const [isLinuxChecked, setIsLinuxChecked] = useState(true)
    const [isChallengesChecked, setIsChallengesChecked] = useState(true)
    const [isTeachingChecked, setIsTeachingChecked] = useState(true)

    const applyFilters = (e) => {
        filterWork(e)
    }

    return(
        <div className='work-filter-layout'>
            <div className='work-filter-container'>
                <div className='work-filter-input-group'>
                    <label className="work-input-container">
                        <span className='work-input-label'>Back End</span>
                        <input 
                            type="checkbox" 
                            name="Back End"
                            checked={isBackendChecked}
                            onChange={(e) => { setIsBackendChecked(!isBackendChecked); applyFilters(e) }}
                        />
                        <span className="checkmark"></span>
                    </label>
                    <label className="work-input-container">
                        <span className='work-input-label'>Front End</span>
                        <input 
                            type="checkbox" 
                            name="Front End"
                            checked={isFrontendChecked}
                            onChange={(e) => { setIsFrontendChecked(!isFrontendChecked); applyFilters(e) }}
                        />
                        <span className="checkmark"></span>
                    </label>
                    <label className="work-input-container">
                        <span className='work-input-label'>Full Stack</span>
                        <input 
                            type="checkbox" 
                            name="Full Stack"
                            checked={isFullstackChecked}
                            onChange={(e) => { setIsFullstackChecked(!isFullstackChecked); applyFilters(e) }}
                        />
                        <span className="checkmark"></span>
                    </label>
                    <label className="work-input-container">
                        <span className='work-input-label'>Database</span>
                        <input 
                            type="checkbox" 
                            name="Database"
                            checked={isDatabaseChecked}
                            onChange={(e) => { setIsDatabaseChecked(!isDatabaseChecked); applyFilters(e) }}
                        />
                        <span className="checkmark"></span>
                    </label>
                </div>
                <div className='work-filter-input-group'>
                    <label className="work-input-container">
                        <span className='work-input-label'>Security</span>
                        <input 
                            type="checkbox" 
                            name="Security"
                            checked={isSecurityChecked}
                            onChange={(e) => { setIsSecurityChecked(!isSecurityChecked); applyFilters(e) }}
                        />
                        <span className="checkmark"></span>
                    </label>
                    <label className="work-input-container">
                        <span className='work-input-label'>Linux</span>
                        <input 
                            type="checkbox" 
                            name="Linux"
                            checked={isLinuxChecked}
                            onChange={(e) => { setIsLinuxChecked(!isLinuxChecked); applyFilters(e) }}
                        />
                        <span className="checkmark"></span>
                    </label>
                    <label className="work-input-container">
                        <span className='work-input-label'>Challenges</span>
                        <input 
                            type="checkbox" 
                            name="Challenges"
                            checked={isChallengesChecked}
                            onChange={(e) => { setIsChallengesChecked(!isChallengesChecked); applyFilters(e) }}
                        />
                        <span className="checkmark"></span>
                    </label>
                    <label className="work-input-container">
                        <span className='work-input-label'>Teaching</span>
                        <input 
                            type="checkbox" 
                            name="Teaching"
                            checked={isTeachingChecked}
                            onChange={(e) => { setIsTeachingChecked(!isTeachingChecked); applyFilters(e) }}
                        />
                        <span className="checkmark"></span>
                    </label>
                </div>
            </div>
        </div>
    )
}

export default WorkFilter