//=============================================================//
// Assignment Details page for an individual Assignment Object //
//=============================================================//

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuthenticationContext } from "../hooks/useAuthenticationContext";
import { useAssignmentContext } from "../hooks/useAssignmentContext";
import { useGetAllUsers } from '../hooks/useGetAllUsers'
import { useGetAllProjects } from "../hooks/useGetAllProjects";
import { useUpdateEmployees } from '../hooks/useUpdateAssnEmployees'
import { useUpdateProjects } from "../hooks/useUpdateAssnProjects";
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

const AssignmentDetails = () => {
    const { user } = useAuthenticationContext()
    const { assignment, dispatch: setAssignment } = useAssignmentContext()
    const { getAllUsers, allUsers } = useGetAllUsers() // get the getAllUsers function from the context
    const { getAllProjects, allProjects} = useGetAllProjects() // getAllProjects from context
    const [selectedInfo, setSelectedInfo] = useState(''); 
    const [EmployeesForm, setShowEmployeesForm] = useState(false);
    const [ProjectsForm, setShowProjectsForm] = useState(false);
    const { updateEmployees, updateEmployeesError, updateEmployeesIsLoading } = useUpdateEmployees()
    const { updateProjects } = useUpdateProjects()

    const { id } = useParams()

    var allUsersArray = []
    var organisationUsersArray = []
    var allProjectsArray = []
    var organisationProjectsArray = []

    // Assignment array of employees and projects  
    const [tempAssignmentProjectsArr, setTempAssignmentProjects] = useState([]);
    const [tempAssignmentEmployeesArr, setTempAssignmentEmployees] = useState([]);
    const [addEmployeeArr, setAddEmployeeArr ] = useState([]);
    const [addProjectArr, setAddProjectArr ] = useState([]);

    var availEmployeesArray = []; // available list of employees for admin to select from
    var availProjectsArray = []; // available list of projects for the admin to select from
    
    
    // fires when the component is rendered
    useEffect(() => {

        // if there is an authenticated user
        if (user) {
            fetchAssignment()
        }
    }, [setAssignment, user, id])

    const fetchAssignment = async () => {
        const response = await fetch('/api/assignment/' + id, { // fetch the assignment based on the assignment's id
            headers: {
                'Authorization': `Bearer ${ user.token }` // sends authorisation header with the user's token -> backend will validate token -> if valid, grant access to API
            }
        }) // using fetch() api to fetch data and store in the variable

        const json = await response.json() // response object into json object

        // response OK
        if (response.ok) {
            setAssignment({ type: 'SET_ONE_ASSIGNMENT', payload: json})
        }
    }

    useEffect(() => {
        getAllUsers();
        getAllProjects(user);
    }, []) 

    //filter users to match with current organisation id
    const filterOrganisationUsers = () => {
        if (user.organisation_id !== undefined) {
            allUsersArray = allUsers
            if (user.role !== "Employee") {
                for (var i = 0; i < allUsersArray.length; i++) {
                    if (allUsersArray[i].role === "Employee" && allUsersArray[i].organisation_id === assignment.organisation_id) {
                        organisationUsersArray.push(allUsers[i])
                    }
                }
                setTempAssignmentEmployees(organisationUsersArray);
            }
        }
    }

    // DEFAULT AVAILABLE LIST OF EMPLOYEES
    // will change based on current list of added employees
    const initialiseAvailEmployeesArray = () => {
        var temp = [];
        temp.push({name: "0", label: "Select an Employee"});

        for (var i = 0; i < tempAssignmentEmployeesArr.length; i++) {
            temp.push({name: tempAssignmentEmployeesArr[i].name, email: tempAssignmentEmployeesArr[i].email  });
        }
 
        return temp;
    }

    availEmployeesArray = initialiseAvailEmployeesArray();
    
    // validate add employees list: should only have employees that are not already in array
    const validateAssignmentEmployeeArr = () => {
        var tempAssnEmployeesArr = availEmployeesArray; 

        for (var i = 0; i < addEmployeeArr.length; i++) {
            for (var j = 0; j < tempAssnEmployeesArr.length; j++) {
                if (addEmployeeArr[i].email === tempAssnEmployeesArr[j].email) {
                    tempAssnEmployeesArr.splice(j, 1);
                }
            }
        }
        availEmployeesArray = JSON.parse(JSON.stringify(tempAssnEmployeesArr));  
    }

    //filter projectss to match with current organisation id
    const filterOrganisationProjects = () => {
        if (user.organisation_id !== undefined) {
            allProjectsArray = allProjects
            if (user.role !== "Employee") {
                for (var i = 0; i < allProjectsArray.length; i++) {
                    if (allProjectsArray[i].organisation_id === assignment.organisation_id) {
                        organisationProjectsArray.push(allProjects[i].title)
                    }
                }
                setTempAssignmentProjects(organisationProjectsArray);
            }
        }
    }

    // DEFAULT AVAILABLE LIST OF PROJECTS
    // will change based on current list of added projects
    const initialiseAvailProjectsArray = () => {
        var temp = [];
        temp.push("Select a Project");

        for (var i = 0; i < tempAssignmentProjectsArr.length; i++) {
            temp.push(tempAssignmentProjectsArr[i]);
        }

        return temp;
    }

    availProjectsArray = initialiseAvailProjectsArray();

    // validate add projects list: should only have project that are not already in array
    const validateAssignmentProjectArr = () => {
        var tempAssnProjectsArr = availProjectsArray; 

        for (var i = 0; i < addProjectArr.length; i++) {
            for (var j = 0; j < tempAssnProjectsArr.length; j++) {
                if (addProjectArr[i] === tempAssnProjectsArr[j]) {
                   tempAssnProjectsArr.splice(j, 1);
                }
            }
        }
       availProjectsArray = JSON.parse(JSON.stringify(tempAssnProjectsArr));  
    }

    // EDIT EMPLOYEES LIST
    const editEmployees = () => {
        filterOrganisationUsers(); 
        validateAssignmentEmployeeArr();
        setAddEmployeeArr([...assignment.employees]);
        
        setShowEmployeesForm('editEmployees');
    }

    // CANCEL EDIT EMPLOYEES LIST
    const cancelEditEmployees = () => {
        setTempAssignmentEmployees([...assignment.employees]);  

        setShowEmployeesForm('showEmployees');
    }

    // ADD A NEW EMPLOYEE
    const addEmployees = (e) => { 
        let temp = ([...addEmployeeArr]); 
        let selectedOption = JSON.parse(e.target.value);
        let newEmployee = {name: selectedOption.name, email: selectedOption.email};
        temp.push(newEmployee); 
        setAddEmployeeArr([...temp]);
    } 

    // DELETE AN EMPLOYEE
    const deleteEmployees = (index) => { 
        let temp = [...addEmployeeArr]; 
        let deletedEmployee = temp.splice(index, 1);  
        setAddEmployeeArr([...temp]);
        //setTempAssignmentEmployees([...addEmployeeArr])    

        // Move the deleted employee back to the availEmployeesArray
        availEmployeesArray = availEmployeesArray.filter(employee => employee.name !== '0')
        availEmployeesArray.push(deletedEmployee[0])
        setTempAssignmentEmployees([...availEmployeesArray]);
    }

    // HANDLE SUBMITTING OF EMPLOYEES 
    const handleSubmitEmployees = async(e) => {
        e.preventDefault();    
        
        await updateEmployees(user, id, addEmployeeArr);  // to update employees
        fetchAssignment() // to fetch Assignments since it was updated

        setShowEmployeesForm('showEmployees');
    }
    
    // EDIT PROJECTS LIST
    const editProjects = () => {
        filterOrganisationProjects(); 
        validateAssignmentProjectArr();
        setAddProjectArr([...assignment.projects]);
        
        setShowProjectsForm('editProjects');
    }

    // CANCEL EDIT PROJECTS LIST
    const cancelEditProjects = () => {
        setTempAssignmentProjects([...assignment.projects]);  

        setShowProjectsForm('showProjects');
    }

    // ADD NEW PROJECTS
    const addProjects = (e) => { 
        let temp = ([...addProjectArr]); 
        let selectedOption = JSON.parse(e.target.value);
        let newProject = (selectedOption);
        temp.push(newProject); 
        setAddProjectArr([...temp]);
    } 

    // DELETE AN EMPLOYEE
    const deleteProjects = (index) => { 
        let temp = [...addProjectArr]; 
        let deletedProject = temp.splice(index, 1);  
        setAddProjectArr([...temp]);  

        // Move the deleted employee back to the availEmployeesArray
        availProjectsArray = availProjectsArray.filter(project => project !== 'Select a Project')
        availProjectsArray.push(deletedProject[0])
        setTempAssignmentProjects([...availProjectsArray]);
    }

    // HANDLE SUBMITTING OF EMPLOYEES 
    const handleSubmitProjects = async(e) => {
        e.preventDefault();    
        
        await updateProjects(user, id, addProjectArr);  // to update projects
        fetchAssignment() // to fetch Projects since it was updated

        setShowProjectsForm('showProjects');
    }

    // ========================================================================================================
    // PAGE CONTENT
    // ========================================================================================================

    // to render employees section
    const showEmployees = () => {  

        validateAssignmentEmployeeArr(); 

        // select Employees
        var showAvailEmployees = [...availEmployeesArray].map((datum, index) => {
            var availEmployee = datum;
            if (availEmployee.name === "0") {
                return (
                    <option key={ index } value={availEmployee.label}>{availEmployee.label} </option>
                )
            }
            else {
                return (
                    <option key={ index } value={JSON.stringify({name: availEmployee.name, email: availEmployee.email})}>{ availEmployee.name }, {availEmployee.email} </option>
                )
            }
           
        })

        // show Employees (current -> from assignment.employees)
        var showEmployeeRows = assignment.employees.map((employee, index) => {
            return (
                <p><li key={ index }>{ employee.name } - { employee.email }</li></p>
            )
        }) 

        // editing list of employees
        var editingEmployeeList = addEmployeeArr.map((employee, index) => {

            return (
                <li key={ index }>{ employee.name } - {employee.email}   
                    <span className="material-symbols-outlined" onClick={() => deleteEmployees(index)} style={{marginLeft:"20px"}}>delete</span> 
                 </li>
            )
        })

        switch (EmployeesForm) {
            case 'showEmployees': // show employees
                return (
                    <div>
                        { showEmployeeRows }
                        <button className="editEmployeesBtn" onClick={() => editEmployees()}>Edit Employees</button>
                    </div>
                ) 

            case 'editEmployees': // editing employees
                
                return (
                    <div>  
                        <form className='editEmployeesForm'>
                            <h3>Add New Employees</h3>
                            <div> 
                                <select className="employeeSelection" onChange={addEmployees} value="Select a user to be added"> 
                                    {showAvailEmployees}
                                </select>
                            </div>
                            <hr></hr>
                            <h3>Edit Employees List</h3>
                            { editingEmployeeList }
                            <br></br>

                            <button className="cancelBtn" style={{float:"left"}} onClick={() => cancelEditEmployees()}>Cancel</button>
                            <button className="submitBtn" onClick={handleSubmitEmployees}>Submit</button>
                            {/*updateEmployeesError && <p>{updateEmployeesError}</p>*/}
                        </form>
                    </div> 
                )
            default: // display assignment employees
                return (
                    <div>
                        { showEmployeeRows }
                        <button className="editEmployeesBtn" onClick={() => editEmployees()}>Edit Employees</button>
                    </div>
                )
        }
    }

    // To render projects section
    const showProjects = () => {
        validateAssignmentProjectArr();

        // select Projects
        var showAvailProjects = [...availProjectsArray].map((datum, index) => {
            var availProjects = datum;
            if (availProjects === "Select a Project") {
                return (
                    <option key={ index } value={availProjects}>{availProjects} </option>
                )
            }
            else {
                return (
                    <option key={ index } value={JSON.stringify(availProjects)}>{ availProjects } </option>
                )
            }
           
        })

        // show Projects (current -> from assignment.projects)
        var showProjectRows = assignment.projects.map((project, index) => {
            return (
                <p><li key={ index }>{ project }</li></p>
            )
        })

        // editing list of Projects
        var editingProjectList = addProjectArr.map((project, index) => {

            return (
                <li key={ index }>{ project }  
                    <span className="material-symbols-outlined" onClick={() => deleteProjects(index)} style={{marginLeft:"20px"}}>delete</span> 
                 </li>
            )
        })

        switch (ProjectsForm) {
            case 'showProjects': // show projects
                return (
                    <div>
                        { showProjectRows }
                        <button className="editProjectsBtn" onClick={() => editProjects()}>Edit Projects</button>
                    </div>
                ) 

            case 'editProjects': // editing projects
                
                return (
                    <div>  
                        <form className='editEmployeesForm'>
                            <h3>Add New Projects</h3>
                            <div> 
                                <select className="projectSelection" onChange={addProjects} value="Select a project to be added"> 
                                    {showAvailProjects}
                                </select>
                            </div>
                            <hr></hr>
                            <h3>Edit Projects List</h3>
                            { editingProjectList }
                            <br></br>

                            <button className="cancelBtn" style={{float:"left"}} onClick={() => cancelEditProjects()}>Cancel</button>
                            <button className="submitBtn" onClick={handleSubmitProjects}>Submit</button>
                            {/*updateEmployeesError && <p>{updateEmployeesError}</p>*/}
                        </form>
                    </div> 
                )
            default: // display assignment projects
                return (
                    <div>
                        { showProjectRows }
                        <button className="editProjectsBtn" onClick={() => editProjects()}>Edit Projects</button>
                    </div>
                )
        }
    }
    // LEFT DIVIDER: INFO PANEL
    // where user can select what info to view
    const infoPanel = () => {
                return (
                    <div className="selection-panel" style={{height:'150px'}}>
                        <button onClick={() => setSelectedInfo('showAssignmentDetails')}> Assignment Details </button>
                        <button onClick={() => setSelectedInfo('addProjects') }> Projects </button>
                        <button onClick={() => setSelectedInfo('addEmployees')} > Employees </button>
                    </div>
            )
        }

    // RIGHT DIVIDER: SHOWS USER INFORMATION
    // where user can view and edit their information
    const showSelectedInfo = () => {
        switch(selectedInfo) {
            case 'addProjects':
                return (
                    <div className="assignment-profile">
                        
                        <h2> Current List of Assignments </h2>  
                        {showProjects()}
                    </div> 
                )
            case 'addEmployees':
                return (
                    <div className="assignment-profile">
                        
                        <h2> Current List of Employees </h2>  
                        {showEmployees()}
                    </div> 
                ) 
            // DEFAULT: DISPLAY USER INFORMATION
            case 'showAssignmentDetails':
            default: 
                return (
                    <div className="assignment-profile">
                        { assignment && (
                            <article>
                                <h2>{ assignment.title }</h2>
                                <p>Created { formatDistanceToNow(new Date(assignment.createdAt), { addSuffix: true }) } by { assignment.created_by }</p>
                                    <div>
                                        <p><strong>Projects in this assignment: </strong></p>
                                        <p>{assignment && assignment.projects.map((projects, index) => { 
                                            // will only run when there is a project object
                                            if (user.organisation_id === assignment.organisation_id)
                                            return(<li key={index}>{projects}</li>)})}
                                        </p>
                                        <p><strong>Employees in this assignment by email: </strong></p>
                                        <p>{ assignment && assignment.employees
                                            .sort((a, b) => a.name.localeCompare(b.name))
                                            .map((employee, index) => { 
                                                if (user.organisation_id === assignment.organisation_id)
                                                return(<li key={index}>{employee.name} - {employee.email}</li>)})}
                                        </p>

                                    </div>
                            </article>
                         )}
                </div>
                )}}

    return (
    <div>
        {infoPanel()}
        {showSelectedInfo()}  
    </div>    
        
    );
}
 
export default AssignmentDetails;