//==========================//
// Project Lisiting display //
//==========================//

// imports
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { useAuthenticationContext } from "../hooks/useAuthenticationContext"
import { Link } from "react-router-dom"


const ProjectList = ({ project }) => {
    const { user } = useAuthenticationContext()

    // if there is no user object - not logged in
    if (!user) {
        return
    }

    return (
        <div className="project-list" key={ project._id }>
            <Link to={ `/projects/${ project._id }` }>
                <h4>{ project.title }</h4>
                {/* <p><strong>Project Title: </strong>{ project.title }</p> */}
                {/* <p><strong>Project Description: </strong>{ project.description }</p> */}
                <p><strong>Skills needed: </strong>{ project.skills.map(s => s.skill).join(', ') }</p>
                { user.role === 'Admin' && <p><strong>Number of People Needed: </strong>{ project.threshold }</p> } {/* only display threshold for Admins */}
                <p>Created { formatDistanceToNow(new Date(project.createdAt), { addSuffix: true }) } by { project.created_by }</p>
            </Link>
        </div>
    )
}

export default ProjectList