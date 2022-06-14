
class DOMHelper {
    static clearEventListeners(element){
        const clonedElement = element.cloneNode(true);
        element.replaceWith(clonedElement);
        return clonedElement;
    }

    static moveElement(elementId, newDestinationSelector){
        const element = document.getElementById(elementId);
        const destinationElement = document.querySelector(newDestinationSelector);
        destinationElement.append(element);

    }
}

class Component {
    constructor(hostElementId, insertBefore = false) {
        if (hostElementId){
            this.hostElement = document.getElementById(hostElementId);
        }else {
            this.hostElement = document.body;
        }
        this.insertBefore = insertBefore;
    }

    remove()
    {
        if (this.element){
            this.element.remove();
        }
    }

    show(){
      this.hostElement.insertAdjacentElement(this.insertBefore ?
          'afterbegin' : 'beforeend',
          this.element);
    }
}

class Tooltip extends Component{

constructor(closeNotifierFunction, text) {
    super();
    this.closeNotifier = closeNotifierFunction;
    this.text = text;
    this.create();
}
    closeToolTip =() => {
        this.remove();
        this.closeNotifier()
    }

    create() {
        const tooltipElement = document.createElement('div');
        tooltipElement.className = 'card';
        tooltipElement.textContent = this.text;
        tooltipElement.addEventListener('click', this.closeToolTip);
        this.element = tooltipElement;
    }

}

class ProjectItem {
    hasActiveTooltip = false;
        constructor(id, updateProjectListsFunction, type) {
            this.id = id;
            this.updateProjectListHandler = updateProjectListsFunction;
            this.connectMoreInfoButton();
            this.connectSwitchButton(type);
        }

        showMoreInfoHandler() {
            if (this.hasActiveTooltip){
                return;
            }
            const projectElement = document.getElementById(this.id);
            const tooltipText = projectElement.dataset.extraInfo;
            //Adding a new property inside, would be so easy, you just have to add a new property like the following line:
            // projectElement.dataset.someInfo = 'DUMMY INFO';
            const tooltip = new Tooltip(() =>{
                this.hasActiveTooltip = false;
            }, tooltipText);
            tooltip.show();
            this.hasActiveTooltip = true;
        }

        connectMoreInfoButton(){
            const projectItemElement = document.getElementById(this.id);
            const moreInfoBtn = projectItemElement.querySelector('button:first-of-type');
           moreInfoBtn.addEventListener('click', this.showMoreInfoHandler.bind(this))
        }

        connectSwitchButton(type){
            const projectItemElement = document.getElementById(this.id);
            let switchBtn = projectItemElement.querySelector('button:last-of-type');
            switchBtn = DOMHelper.clearEventListeners(switchBtn);
            switchBtn.textContent = type === 'active' ? 'Finish' : 'Activate';
            switchBtn.addEventListener('click',
                this.updateProjectListHandler.bind(
                    null,
                    this.id
                )
            );

        }

        update(updateProjectListFunction, type){
            this.updateProjectListHandler = updateProjectListFunction;
            this.connectSwitchButton(type);
        }
}

//create multiple instance of this class
class ProjectList {
        projects = [];

        constructor(type) {
            this.type = type;
            const prjItems = document.querySelectorAll(`#${type}-projects li`);
            for (const prjItem of prjItems) {
                this.projects.push(new ProjectItem(prjItem.id, this.switchProject.bind(this), this.type));
            }
        }

        setSwitchHandlerFunction (switchHandlerFunction) {
            this.switchHandler = switchHandlerFunction;
        }

        addProject(project){
         this.projects.push(project);
         DOMHelper.moveElement(project.id, `#${this.type}-projects ul`);
         project.update(this.switchProject.bind(this), this.type);
        }

        switchProject(projectId) {
            // const projectIndex = this.projects.findIndex(p => p.id === projectId);
            // this.projects.splice(projectIndex);
            this.switchHandler(this.projects.find(p => p.id === projectId));
            this.projects = this.projects.filter(p => p.id !== projectId);
        }
}

class App {
static project;

    static init() {
        const activeProjectList = new ProjectList('active');
        const finishedProjectList = new ProjectList('finished');
        activeProjectList.setSwitchHandlerFunction(finishedProjectList.addProject.bind(finishedProjectList));
        finishedProjectList.setSwitchHandlerFunction(activeProjectList.addProject.bind(activeProjectList));
    }

    // static addProjectToDone(project){
    //     this.project.addProject(project);
    // }
}

App.init();