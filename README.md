![TaskDone Logo](task-management-app/src/assets/taskdone-banner-logo.png)

# TaskDone

TaskDone is a **personal task management web app** built with Angular and MongoDB.  
It helps users track tasks, deadlines, and priorities with a clean and responsive interface.  
TaskDone ensures local datetime handling so your tasks always keep accurate times.

---

## Technologies

![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat-square&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)

---

## Features

- Create, edit, and delete personal tasks  
- Set start dates and deadlines with timezone-safe datetime handling  
- Assign priority levels (Low, Medium, High)  
- Form validation with Angular Reactive Forms  
- Responsive and clean UI for desktop and mobile  
- Tasks stored in MongoDB for persistent storage  

---

## Demo

Live demo: (https://task-done-g10.vercel.app/)

---

## Installation

**Prerequisites:**

- Node.js >= 18.x  
- npm >= 9.x  
- Angular CLI >= 16.x  
- MongoDB instance (local or cloud)  

**Steps:**

```bash
# Clone the repository
git clone https://github.com/githubbato/TaskDone.git
cd TaskDone

# Install dependencies
npm install

# Configure MongoDB connection (update backend with your MongoDB URI)

# Locate the backend folder and run the backend server
npm start

# Run the development server 
ng serve

# Open in browser
http://localhost:4200
