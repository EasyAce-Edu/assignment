$(function (){
	var term = 1159;
	var key = '138ff53a6ec91e06bc52ff9cfedb2780';
	// var Workspace = Backbone.Router.extend({
	// 	routes: {
	// 		"": "handleRoute1",
	// 		"view1": "handleRoute2",   
	// 	},

	// 	handleRoute2: function() {
	// 		console.log('calendar');
	// 	},
	// });
	// var router = new Workspace();
	// Backbone.history.start({});

	// course select - dropdown
	var SubjectList = Backbone.Collection.extend({
		url: `https://api.uwaterloo.ca/v2/terms/${term}/courses.json?key=${key}`,

		parse: function (response) {
			return response.data;
		}
	});

	// course select - course table
	var CourseList = Backbone.Collection.extend({
		initialize: function (models, options) {
			this.subject = options.subject;
		},

		url: function () {
			return `https://api.uwaterloo.ca/v2/terms/${term}/${this.subject}/schedule.json?key=${key}`;
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

		// has to a function, because it depends on this
		url: function () {
			return `https://api.uwaterloo.ca/v2/courses/${this.subject}/${this.catalog_number}/schedule.json?key=${key}`;
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
			this.$el.html(this.model.get("subject"));
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
				return model.get("subject"); 
			});

			var els = [];
			_.each(array, function (item) {
				var itemView= new SubjectView({model:item});
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

	// course select - course table row
	var CourseView = Backbone.View.extend({

		tagName: "tr",

		template: _.template($('#courseAdd-template').html()),

		events: {
			"click #courseName" : "showSchedule",
			"click #btnAdd" : "addToList"
		},

		render: function () {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},

		showSchedule: function () {
			$("#courseInfo").html(_.template('<%=subject%> <%=catalog_number%> - <%=title%>')(this.model.toJSON()));
			var courseSchedule = new CourseSchedule([], this.model.toJSON());
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
			$('#alert').text("Unsaved");
		}

	});

	// course select - course table
	var CourseListView = Backbone.View.extend({

		el: "#selectTable",

		initialize: function() {
			this.collection.bind("reset", this.render,this);
		},

		render: function () {
			var array = _.uniq(this.collection.models, function (model) {
				return model.get("catalog_number"); 
			});
			array = _.sortBy(array, function(model){
				return model.get("catalog_number");
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
		events: {
			"click #addSection" : "addToCalendar",
		},
		
		// addToCalendar: function () {
		// 	router.navigate('view1');
		// },
		
		render: function () {
			var headerTemplate = $("#scheduleHeader-template").html();
			var dataTemplate = $("#scheduleData-template").html();
			
			var els = []
			els.push(_.template(headerTemplate)(this.model)); // add header

			_.each(this.model.classes, function (item) {
				els.push(_.template(dataTemplate)(item));
			});
		
			this.$el.html(els);
			this.$el.addClass("table section");
			return this;
		}
	});

	// course schedule - schedule table
	var CourseScheduleView = Backbone.View.extend({

		tagName: "div",
		
		initialize: function() {
			this.collection.bind("reset", this.render,this);
		},
		
		render: function () {
			var els = [];
			_.each(this.collection.models, function (model) {
				var itemView = new SectionView({model:model.toJSON()});
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
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},

		showSchedule: function () {
			$("#courseInfo").html(_.template('<%=subject%> <%=catalog_number%> - <%=title%>')(this.model.toJSON()));
			var courseSchedule = new CourseSchedule([], this.model.toJSON());
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
			$('#alert').text("Unsaved");
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
			_.each(this.collection.models, function (model) {
				var itemView = new ItemView({model:model});
				els.push(itemView.render().el);
			});

			this.$el.html(els);
			this.$el.addClass("table table-hover");
		},
	});

	// course list - load item
	LoadItemView = Backbone.View.extend({

		tagName: "li",

		events: {
			"click #listName" : "loadList"
		},

		render: function () {
			this.$el.html(_.template('<a href="#" id="listName"><%=name%></a>')(this.model.toJSON()));
			return this;
		},

		loadList: function () {
			customList.reset();
			var List = Backbone.Collection.extend({
					localStorage: new Backbone.LocalStorage(this.model.get("name"))
				});
			var list = new List;
			list.fetch({
				success: function () {
					_.each(list.models, function (model){
						customList.add(model);
					});
				},
				error: function () {
					alert("Failed to load list");
				}
			});
			$('#listHeader').text(this.model.get("name"));
			$('#alert').text("Loaded");
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

			$('#nameList').html(els);
		},

		saveList: function() {
			var value = $("#listName").val();
			if (value === "") {
				alert("please enter a name");
			}
			else {
				var found = this.collection.find(function (model){
					return model.get("name") === value;
				});

				if(found === undefined){
					var List = Backbone.Collection.extend({
						localStorage: new Backbone.LocalStorage(value)
					});
					var list = new List;

					_.each(customList.models, function (model) {
						list.create(model.toJSON());
					});

					this.collection.create({name: value});
					$('#listHeader').text(value);
					$('#alert').text("Saved");
				}
				else {
					alert("name already exists!");
				}
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
