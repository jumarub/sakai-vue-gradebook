export default class Assignment {
	constructor(id, title, maxPoints, isGroup, submissionList) {
	  this.id = id; // Define the entity with an id property
	  this.title = title;
	  this.maxPoints = maxPoints;
	  this.isGroup = isGroup;
	  this.submissionList = submissionList;
	}
}