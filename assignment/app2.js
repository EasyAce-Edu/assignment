$(function (){
	// collection for dropdownlist
	var SubjectList = Backbone.Collection.extend({
		url: 'https://api.uwaterloo.ca/v2/terms/1159/courses.json?key=138ff53a6ec91e06bc52ff9cfedb2780',
		parse: function (response) {
			return response.data;
		}
	});

	// collection for course list
	var CourseList = Backbone.Collection.extend({
		initialize: function (models, options) {
			this.subject = options.subject;
		},
		url: function () {
			return 'https://api.uwaterloo.ca/v2/terms/1159/'+ this.subject + '/schedule.json?key=138ff53a6ec91e06bc52ff9cfedb2780';
		},
		parse: function (response) {
			return response.data;
		}
	});

	// collection for course details
	var CourseSchedule = Backbone.Collection.extend({
		initialize: function(models, options) {
			this.subject = options.subject;
			this.catalog_number = options.catalog_number;
		},
		url: function () {
			return "https://api.uwaterloo.ca/v2/courses/" + this.subject + "/" + this.catalog_number +"/schedule.json?key=138ff53a6ec91e06bc52ff9cfedb2780";
		},
		parse: function (response) {
			return response.data;
		}
	});

	var CustomList = Backbone.Collection.extend({
		localStorage: new Backbone.LocalStorage("customList")
	});
	var customList = new CustomList();
	var SubjectView = Backbone.View.extend({
		tagName: "option",
		render: function () {
			this.$el.html(this.model.attributes.subject);
			return this;
		},
	});

	var SubjectListView = Backbone.View.extend({
		el: "#dropdown",
		events: {
			"change" : "showCourses"
		},
		initialize: function () {
			this.collection.bind("reset", this.render, this);
		},
		render: function () {
			var subjectList = _.uniq(this.collection.models, function (model) {
				return model.attributes.subject; 
			});
			var els = [];
			_.each(subjectList, function (item) {
				var itemView= new SubjectView({model:item});
				els.push(itemView.render().el);
			});
			this.$el.append(els);
			$("#dropdown").append(this.el);
		},
		showCourses: function (e) {
			var courseList = new CourseList([], {subject: e.target.value});
			var courseListView = new CourseListView({collection: courseList});
			courseList.fetch({reset:true});
		}
	});

	var CourseView = Backbone.View.extend({
		tagName: "tr",
		events: {
			"click #detail" : "showDetails",
			"click #add" : "addToList"
		},
		render: function () {
			var template = $("#template-course").html();
			var compiled = _.template(template, this.model.attributes);
			this.$el.html(compiled);
			return this;
		},

		showDetails: function () {
			$("#courseInfo").html(this.model.attributes.subject + this.model.attributes.catalog_number + this.model.attributes.title);
			var courseSchedule = new CourseSchedule([], {subject: this.model.attributes.subject, catalog_number: this.model.attributes.catalog_number});
			var courseScheduleView = new CourseScheduleView({collection: courseSchedule});
			courseSchedule.fetch({reset:true});
		},
		addToList: function() {
			customList.add(this.model);
		}
	});

	var CourseListView = Backbone.View.extend({
		tagName: "table",
		className: "table table-hover",
		initialize: function() {
			this.collection.bind("reset", this.render,this);
		},
		render: function () {
			var courseList = _.uniq(this.collection.models, function (model) {
				return model.attributes.catalog_number; 
			});
			courseList = _.sortBy(courseList, function(model){
				return model.attributes.catalog_number;
			});
			var els = [];
			_.each(courseList, function (item) {
				var itemView= new CourseView({model:item});
				els.push(itemView.render().el);
			});
			this.$el.html(els);
			$("#courses").html(this.el);
		}
	});

	var ClassView = Backbone.View.extend({
		tagName: "table",
		className: "table table-striped",
		render: function () {
			var headerTemplate = $("#template-detailheader").html();
			var dataTemplate = $("#template-detaildata").html();
			var els = []
			var compiled = _.template(headerTemplate, this.model.attributes);
			els.push(compiled);
			_.each(this.model.attributes.classes, function (item) {
				var compiled = _.template(dataTemplate, item);
				els.push(compiled);
			});
		
			this.$el.html(els);
			return this;
		}
	});

	var CourseScheduleView = Backbone.View.extend({
		tagName: "tr",
		initialize: function() {
			this.collection.bind("reset", this.render,this);
		},
		render: function () {
			var els = [];
			this.collection.each(function (item) {
				var itemView = new ClassView({model:item});
				els.push(itemView.render().el);
			});
			this.$el.html(els);
			$("#scheduleTable").html(this.el);
		}
	});

	var ItemView = Backbone.View.extend({
		tagName: "tr",
		events: {
			"click #detail" : "showDetails",
			"click #delete" : "deleteFromList"
		},
		render: function () {
			var template = $("#template-item").html();
			var compiled = _.template(template, this.model.attributes);
			this.$el.html(compiled);
			return this;
		},
		showDetails: function () {
			$("#courseName").html(this.model.attributes.subject + this.model.attributes.catalog_number);
			$("#courseTitle").html(this.model.attributes.title);
			var courseSchedule = new CourseSchedule([], {subject: this.model.attributes.subject, catalog_number: this.model.attributes.catalog_number});
			var courseScheduleView = new CourseScheduleView({collection: courseSchedule});
			courseSchedule.fetch({reset:true});
		},
		deleteFromList: function() {
			//this.model.destroy();
			customList.remove(this.model);
		}
	});

	var ListView = Backbone.View.extend({
		tagName: "table",
		className: "table table-hover",
		initialize: function() {
			this.collection.bind("reset", this.render,this);
			this.collection.bind("add", this.render,this);
			this.collection.bind("remove", this.render,this);
			this.collection.bind("all", this.render.this);
		},
		render: function () {
			var els = [];
			this.collection.each(function (item) {
				var itemView = new ItemView({model:item});
				els.push(itemView.render().el);
			});
			this.$el.html(els);
			$("#list").append(this.el);
		}
	});

	ButtonView = Backbone.View.extend({
		el: "#midContent",
		events: {
			"click #btnSave" : "saveList",
			"click #btnLoad" : "loadList"
		},
		initialize: function () {
			this.render();
		},
		render: function () {
			this.$el.append('<button class="btn btn-primary" id="btnSave">Save</button>');
			this.$el.append('<button class="btn btn-primary" id="btnLoad">Load</button>');
		},
		saveList: function() {
			var name = prompt("Please enter a name");
			var Lt = Backbone.Collection.extend({
				localStorage: new Backbone.LocalStorage(name)
			});
			var lt = new Lt;
			customList.each(function (item) {
				lt.create({subject:item.attributes.subject, catalog_number:item.attributes.catalog_number, title: item.attributes.title});
			});
			localStorage.setItem("listofname", [name]);

		},
		loadList: function () {
			var name = prompt("Please enter a name");
			var Lt = Backbone.Collection.extend({
				localStorage: new Backbone.LocalStorage(name)
			});
			customList.reset();
			var lt = new Lt;
			lt.fetch({
				success: function(){
					lt.each(function (item) {
						customList.add(item);
					});
				}
			});
		}
	})

	
	var AppView = Backbone.Collection.extend({
		initialize: function () {
			var subjectList = new SubjectList();
			var subjectListView = new SubjectListView({collection:subjectList});
			subjectList.fetch({reset:true});
			var listView = new ListView({collection: customList});
			var btnView = new ButtonView;
		},
		events: {
			"click #btnSave": "saveToList"
		},
		saveToList: function () {
			alert("yes!!");
		}
	});

	var appView = new AppView();
});