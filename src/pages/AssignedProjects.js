// ============================ //
// Employee's current projects
// ============================ //

import { useEffect, useState } from 'react'
import { useAuthenticationContext } from '../hooks/useAuthenticationContext' 

const AssignedProjects = () => {
    var assignedProjectsArray = []

    const { user } = useAuthenticationContext() // get the user object from the context
    

    assignedProjectsArray = user.project_assigned
    console.log(assignedProjectsArray)

    // const showAssignedProjects = assignedProjectsArray.map((project) => {
    //     return (
    //         <div className="project-div" key={project._id}>
    //             <h3>{project.type}</h3>
    //             <p>Project ID: {project.projectId}</p>   
    //         </div>
    //     )
    // })

    return (
        <div className="assigned-projects">
            <h2>Assigned Projects</h2> 
        </div>
    )
}

export default AssignedProjects

