$(function (){
	// course select - dropdown
	var SubjectList = Backbone.Collection.extend({

		url: 'https://api.uwaterloo.ca/v2/terms/1159/courses.json?key=138ff53a6ec91e06bc52ff9cfedb2780',

		parse: function (response) {
			return response.data;
		}

	});

	// course select - select table
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

	// course schedule - schedule table
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

	// course list - list of name
	var ListOfName = Backbone.Collection.extend({
		localStorage: new Backbone.LocalStorage("listOfName")
	});

	// course select - dropdown option
	var SubjectView = Backbone.View.extend({

		tagName: "option",

		render: function () {
			this.$el.html(this.model.subject);
			return this;
		}
	});

	// course select - dropdownlist
	var SubjectListView = Backbone.View.extend({

		el: "#dropdown",

		events: {
			"change" : "showCourses"
		},

		initialize: function () {
			this.collection.bind("reset", this.render, this);
		},

		render: function () {
			var array = _.uniq(this.collection.models, function (model) {
				return model.attributes.subject; 
			});

			var els = [];
			_.each(array, function (item) {
				var itemView= new SubjectView({model:item.attributes});
				els.push(itemView.render().el);
			});

			this.$el.append(els);
		},

		showCourses: function (e) {
			var courseList = new CourseList([], {subject: e.target.value});
			var courseListView = new CourseListView({collection: courseList});
			courseList.fetch({
				reset:true,
				error: function () {
					alert("Failed to load courses");
				}
			});
		}

	});

	// course select - select table row
	var CourseView = Backbone.View.extend({

		tagName: "tr",

		template: _.template($('#courseAdd-template').html()),

		events: {
			"click #courseName" : "showSchedule",
			"click #btnAdd" : "addToList"
		},

		render: function () {
			this.$el.html(this.template(this.model.attributes));
			return this;
		},

		showSchedule: function () {
			$("#courseInfo").html(_.template('<%=subject%> <%=catalog_number%> - <%=title%>', this.model.attributes));
			var courseSchedule = new CourseSchedule([], {subject: this.model.attributes.subject, catalog_number: this.model.attributes.catalog_number});
			var courseScheduleView = new CourseScheduleView({collection: courseSchedule});
			courseSchedule.fetch({
				reset:true,
				error: function () {
					alert("Failed to load schedule");
				}
			});
		},

		addToList: function() {
			customList.add(this.model);
		}

	});

	// course select - select table
	var CourseListView = Backbone.View.extend({

		el: "#selectTable",

		initialize: function() {
			this.collection.bind("reset", this.render,this);
		},

		render: function () {
			var array = _.uniq(this.collection.models, function (model) {
				return model.attributes.catalog_number; 
			});
			array = _.sortBy(array, function(model){
				return model.attributes.catalog_number;
			});

			var els = [];
			_.each(array, function (item) {
				var itemView= new CourseView({model:item});
				els.push(itemView.render().el);
			});

			this.$el.html(els);
			this.$el.addClass("table table-hover");
		}

	});

	// course schedule - course section
	var SectionView = Backbone.View.extend({

		tagName: "table",
		
		render: function () {
			var headerTemplate = $("#scheduleHeader-template").html();
			var dataTemplate = $("#scheduleData-template").html();
			
			var els = []
			els.push(_.template(headerTemplate, this.model)); // add header

			_.each(this.model.classes, function (item) {
				els.push(_.template(dataTemplate, item));
			});
		
			this.$el.html(els);
			this.$el.addClass("table table-striped");
			return this;
		}

	});

	// course schedule - schedule table
	var CourseScheduleView = Backbone.View.extend({

		tagName: "tr",
		
		initialize: function() {
			this.collection.bind("reset", this.render,this);
		},
		
		render: function () {
			var els = [];
			this.collection.each(function (item) {
				var itemView = new SectionView({model:item.attributes});
				els.push(itemView.render().el);
			});
			this.$el.html(els);
			$("#scheduleTable").html(this.el);
		}

	});

	// course list - item
	var ItemView = Backbone.View.extend({

		tagName: "tr",

		template: _.template($('#courseRemove-template').html()),

		events: {
			"click #courseName" : "showSchedule",
			"click #btnRemove" : "removeFromList"
		},

		render: function () {
			this.$el.html(this.template(this.model.attributes));
			return this;
		},

		showSchedule: function () {
			$("#courseInfo").html(_.template('<%=subject%> <%=catalog_number%> - <%=title%>', this.model.attributes));
			var courseSchedule = new CourseSchedule([], {subject: this.model.attributes.subject, catalog_number: this.model.attributes.catalog_number});
			var courseScheduleView = new CourseScheduleView({collection: courseSchedule});
			courseSchedule.fetch({
				reset:true,
				error: function () {
					alert("Failed to load schedule");
				}
			});
		},

		removeFromList: function() {
			customList.remove(this.model);
		}

	});

	// course list - list
	var ListView = Backbone.View.extend({
		
		el: "#listTable",

		initialize: function() {
			this.collection.bind("reset", this.render,this);
			this.collection.bind("add", this.render,this);
			this.collection.bind("remove", this.render,this);
		},

		render: function () {
			var els = [];
			this.collection.each(function (item) {
				var itemView = new ItemView({model:item});
				els.push(itemView.render().el);
			});

			this.$el.html(els);
			this.$el.addClass("table table-hover");
		}

	});

	// course list - load item
	LoadItemView = Backbone.View.extend({

		tagName: "li",

		events: {
			"click #listName" : "loadList"
		},

		render: function () {
			this.$el.html(_.template('<a href="#" id="listName"><%=name%></a>', this.model.attributes));
			return this;
		},

		loadList: function () {
			customList.reset();
			var List = Backbone.Collection.extend({
					localStorage: new Backbone.LocalStorage(this.model.attributes.name)
				});
			var list = new List;
			list.fetch({
				success: function (){
					list.each(function (item){
						customList.add(item.attributes.model);
					});
				}
			});
		}

	});

	// course list - list nav 
	NavView = Backbone.View.extend({

		el: "#listNav",

		events: {
			"click #btnSave" : "saveList",
		},

		initialize: function () {
			this.collection.bind("reset", this.render, this);
			this.collection.bind("add", this.render, this);
		},

		render: function () {
			var els = [];
			_.each(this.collection.models, function (item) {
				var itemView= new LoadItemView({model:item});
				els.push(itemView.render().el);
			});

			$('#nameList').append(els);
		},

		saveList: function() {
			var value = $("#listName").val();
			if (value === "") {
				alert("please enter a name");
			}
			else {
				var List = Backbone.Collection.extend({
					localStorage: new Backbone.LocalStorage(value)
				});
				var list = new List;

				customList.each(function (item) {
					list.create({model: item});
				});

				//this.collection.create({name: value});
			}
		}

	});

	// app 
	var AppView = Backbone.Collection.extend({

		el: "#content",

		initialize: function () {
			// course select - dropdown
			var subjectList = new SubjectList;
			var subjectListView = new SubjectListView({collection: subjectList});
			subjectList.fetch({
				reset:true,
				error: function () {
					alert("Failed to load the page");
				}
			});

			// list to load
			var navView = new NavView({collection: listOfName});
			listOfName.fetch({
				reset:true,
				error: function () {
					alert("Failed to load the page");
				}
			});

			var listView = new ListView({collection: customList});
		}

	});

	var customList = new Backbone.Collection; // save current list
	var listOfName = new ListOfName; // save list of name
	var app = new AppView();
});
