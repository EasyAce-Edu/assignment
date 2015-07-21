# assignment
Front-end web dev assignment

### Task
Use Backbone.js to create a simple single page web app that let users find all course offerings for next term (Fall 2015) by accessing data from UW Open Data API, and create persistent lists of selected courses that he/she is interested in for future reference.

### Goal
- Show that you can learn by yourself
- Show that you know how RESTful APIs work and are able to use them in your web app
- Show that you know how to work with GitHub
- Showcase your skills to work with HTML, CSS, and JavaScript
- Get your hands dirty with front-end MV* and JavaScript frameworks
- Have some basic understanding of the kind of front-end developing work we are doing at EasyAce

### Notes
- We don't really use Backbone.js at EasyAce, but it's simple, light weight, easy to learn, and has the basic tools/features of a front-end MV* framework. If you can use Backbone.js, learning a more complicated, full flavor framework becomes much easier.
- If you have questions, try to look them up on Backbone website first, Stackoverflow/Google second, and ask us on GitHub last. You want to prove you are good self learners, so we are no babysitters.
- But if you need clarification of this assignment, feel free to post it on GitHub, we will answer asap. One aspect of this assignment is to show you how to communicate in a team and on GitHub.
- You should be able to code your project locally without container, but it might be easier to serve your static files from a Nginx or Apache.

### Requirements
- You must use Backbone.js as the framework to build your single page web app
- You must use UW Open Data API as the only data source (If you don't have an API key, create one)
- You must use Backbone's collections and model to communicate with the API (e.g. no direct jQuery Ajax calls)
- You must use Backbone's views to render UI and display models
- You must use some sort of templating, although you are free to choose the template engine you like (the default underscore is fine, you can use something else e.g. mustache, handlebar, etc., too)
- You must handle events in your Backbone views, do not write jQuery code to bind event listener manually
- Your web app must support some sort of navigation to help users find a course easily (dropdowns of subjects, search, etc.)
- For the courses, your app must display some of their information, e.g. time, days, title, description, etc, that users have some understanding of what they are
- You must use some kind of local storage that a user can create a list, add courses to it, save it, and load it back in future browser sessions (close/reopen browser)
- Your web app must be able to store multiple lists, although you don't need to worry about security
- Feel free to use file/module loader, you may get a bonus for better structure of your code
- Feel free to use any 3rd party library/package you want
- Feel free to design your UI, you have the total authority, and of course the elegancy/beautifulness/usability of your UI will be evaluated
- Feel free to add extra features, this is an open end task, take advantage of your freedom
- You can either link all your resources locally, all from some online vendors, the testing machine will have internet access

### Resources
- [Backbone.js](http://www.backbonejs.org)
- [UW Open Data API](https://api.uwaterloo.ca)
- A simple sample of Backbone web app can be found inside the example folder of this repo
- A short video explains what we want for this app can be found [here](https://www.youtube.com/watch?v=MVD65pKzfiw)

### Submission
Once you finish this assignment, you must submit your code as a pull request to this repo. If you don't have GitHub account, please create one.


Note that your submission should only contain static files (html, css, js, templates), it will be tested by us hosting on a Nginx powered server.
