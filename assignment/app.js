$(function(){
	var Subjects = Backbone.Collection.extend({
		url: 'https://api.uwaterloo.ca/v2/terms/1159/courses.json?key=138ff53a6ec91e06bc52ff9cfedb2780',
		parse: function (response) {
			return response.data;
		}
	});

	var Courses = Backbone.Collection.extend({
		initialize: function(models, options) {
			this.subject = options.subject;
		},
		url: function () {
			return 'https://api.uwaterloo.ca/v2/terms/1159/'+ this.subject + '/schedule.json?key=138ff53a6ec91e06bc52ff9cfedb2780';
		},
		parse: function (response) {
			return response.data;
		}
	});

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

	var List = Backbone.Collection.extend({
		localStorage: new Backbone.LocalStorage("todolist")
	});

	var SubjectListView = Backbone.View.extend({
		tagName: "select",
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
			this.$el.html(els);
			$("#dropdown").append(this.el);
		},
		showCourses: function (e) {
			var courseList = new Courses([], {subject: e.target.value});
			var coursesView = new CourseListView({collection: courseList});
			courseList.fetch({reset:true});
		}
	});

	var SubjectView = Backbone.View.extend({
		tagName: "option",
		render: function () {
			this.$el.html(this.model.attributes.subject);
			return this;
		},
	});

	var CourseListView = Backbone.View.extend({
		tagName: "table",
		className: "table table-striped",
		initialize: function() {
			this.collection.bind("reset", this.render,this);
		},
		render: function () {
			var courseList = _.uniq(this.collection.models, function (model) {
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

	var CourseView = Backbone.View.extend({
		tagName: "tr",
		events: {
			"click #detail" : "showDetails",
			"click #add" : "addToList"
		},
		render: function () {
			var template = $("#template").html();
			var compiled = _.template(template, this.model.attributes);
			this.$el.html(compiled);
			return this;
		},
		showDetails: function () {
			var courseDetail = new CourseSchedule([], {subject: this.model.attributes.subject, catalog_number: this.model.attributes.catalog_number});
			var courseDetailView = new CourseDetailView({collection: courseDetail});
			courseDetail.fetch({reset:true});
		},
		addToList: function() {
			todolist.create(this.model);
		}
	});

	var CourseDetailView = Backbone.View.extend({
		tagName: "table",
		className: "table table-striped",
		initialize: function() {
			this.collection.bind("reset", this.render,this);
		},
		render: function () {
			var els = [];
			this.collection.each(function (item) {
				var itemView = new DetailView({model:item});
				els.push(itemView.render().el);
			});
			this.$el.html(els);
			$("#details").html(this.el);
		}
	});

	var DetailView = Backbone.View.extend({
		tagName: "table",
		className: "table table-striped",
		render: function () {
			var template = $("#template1").html();
			var els = []
			_.each(this.model.attributes.classes, function (item) {
				var compiled = _.template(template, item);
				els.push(compiled);
			});
			this.$el.html(els);
			return this;
		}
	});

	var ListView = Backbone.View.extend({
		tagName: "table",
		className: "table table-striped",
		initialize: function() {
			this.collection.bind("reset", this.render,this);
			this.collection.bind("add", this.render,this);
			this.collection.bind("remove", this.render,this);
			this.collection.bind("all", this.render.this);
		},
		render: function () {
			var els = [];
			this.collection.each(function (item) {
				var view = new itemView({model:item});
				els.push(view.render().el);
			});
			this.$el.html(els);
			$("#list").append(this.el);
		}
	});

	var itemView = Backbone.View.extend({
		tagName: "tr",
		events: {
			"click #detail" : "showDetails",
			"click #delete" : "deleteFromList"
		},
		render: function () {
			var template = $("#template2").html();
			var compiled = _.template(template, this.model.attributes);
			this.$el.html(compiled);
			return this;
		},
		showDetails: function () {
			var courseDetail = new CourseSchedule([], {subject: this.model.attributes.subject, catalog_number: this.model.attributes.catalog_number});
			var courseDetailView = new CourseDetailView({collection: courseDetail});
			courseDetail.fetch({reset:true});
		},
		deleteFromList: function() {
			this.model.destroy();
			todolist.remove(this.model);
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
		},
		saveList: function() {
			var name = prompt("Please enter a name");
			localStorage.setItem(name, todolist);
		},
		loadList: function () {
			
		}
	})

	var todolist = new List;
	var AppView = Backbone.Collection.extend({
		initialize: function () {
			var subjects = new Subjects();
			var dropdownView = new SubjectListView({collection:subjects});
			subjects.fetch({reset:true});
			var listView = new ListView({collection: todolist});
			var btnView = new ButtonView();
		}
	});

	var appView = new AppView();
});

