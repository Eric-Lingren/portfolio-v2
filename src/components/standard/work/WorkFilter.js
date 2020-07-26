import React from 'react'

const WorkFilter = () => {


    return(
        <div className='work-filter-layout'>
            <div className='work-filter-container'>
                <div className='work-filter-input-group'>
                    <label className="work-input-container">
                        <span className='work-input-label'>Back End</span>
                        <input type="checkbox" />
                        <span className="checkmark"></span>
                    </label>
                    <label className="work-input-container">
                        <span className='work-input-label'>Front End</span>
                        <input type="checkbox" />
                        <span className="checkmark"></span>
                    </label>
                    <label className="work-input-container">
                        <span className='work-input-label'>Full Stack</span>
                        <input type="checkbox" />
                        <span className="checkmark"></span>
                    </label>
                    <label className="work-input-container">
                        <span className='work-input-label'>Database</span>
                        <input type="checkbox" />
                        <span className="checkmark"></span>
                    </label>
                </div>
                <div className='work-filter-input-group'>
                    <label className="work-input-container">
                        <span className='work-input-label'>Security</span>
                        <input type="checkbox" />
                        <span className="checkmark"></span>
                    </label>
                    <label className="work-input-container">
                        <span className='work-input-label'>Linux</span>
                        <input type="checkbox" />
                        <span className="checkmark"></span>
                    </label>
                    <label className="work-input-container">
                        <span className='work-input-label'>Challenges</span>
                        <input type="checkbox" />
                        <span className="checkmark"></span>
                    </label>
                    <label className="work-input-container">
                        <span className='work-input-label'>Teaching</span>
                        <input type="checkbox" />
                        <span className="checkmark"></span>
                    </label>
                </div>
            </div>
        </div>
    )
}

export default WorkFilter