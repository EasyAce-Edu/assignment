require(['static/text!./template/home.html',
	'static/text!./template/courses.html',
	'static/text!./template/info.html',
	'static/text!./template/info_view.html',
	'static/text!./template/Credits.html',
	'static/text!./template/Resume.html',
	'static/text!./template/AboutMe.html',
	'static/text!./template/loading.html',
	'static/text!./template/error.html'],
 function (homeTpl,CorTpl,InfoTpl,InfoDtl,CdtTpl,ResTpl,AbtTpl,LodTpl,ErrTpl) {
	
	var ApplicationRouter = Backbone.Router.extend({
		routes: {
			"": "home",
			"Schedule":"schedule",
			"CourseInfo":"CourseInfo",
			"Credits":"Credits",
			"Resume":"Resume",
			"AboutMe":"AboutMe",
			"CourseInfo/:id":"CourseInfo_id"
		},
		initialize: function() {
			var ft = new FooterView({model:m,el:'#footer'})
			ft.render();
		},
		home: function() {
			this.homeView = new HomeView();
			this.homeView.render();
			var v = new FooterView({model:m,el:'#footer'})
			v.render();
		},
		schedule:function(){
			this.courseView = new CourseView();
			this.courseView.render();
			this.search_course= new Search_Course()
			this.search_course.render();
			course_history=new Course_History();
			course_history.render();
		},
		CourseInfo:function(){
			this.infoview = new InfoView();
			this.infoview.render();
			this.search_course_info = new Search_Course_info()
			this.search_course_info.render();
			this.favlst=new Fav_List();
			this.favlst.render();
		},
		Credits:function(){
			this.credits = new CreditsView();
			this.credits.render();
		},
		Resume:function(){
			this.me = new Resume();
			this.me.render();
		},
		AboutMe:function(){
			this.me = new AboutMe();
			this.me.render();
		},
		CourseInfo_id: function(id){
			this.infoview = new InfoView();
			this.infoview.render();
			this.search_course_info = new Search_Course_info()
			this.search_course_info.render();
			this.favlst=new Fav_List();
			this.favlst.render();
			if(this.searchinfoView) this.searchinfoView.close();
			this.searchinfoView = new Search_Info_View();
			this.searchinfoView.render(id);
		}
	});
	
	//course info view
	var InfoView = Backbone.View.extend({
		el: "#content",
		template: InfoTpl,
		render: function() {
			this.$el.html(_.template(this.template));
		}
	})

	//Course schedule
	var CourseView = Backbone.View.extend({
		el: "#content",
		template: CorTpl,
		render: function() {
			this.$el.html(_.template(this.template));
		}
	})

	//Credit
	var CreditsView = Backbone.View.extend({
		el: "#content",
		template: CdtTpl,
		render: function() {
			this.$el.html(_.template(this.template));
		}
	})
	//Resume
	var Resume = Backbone.View.extend({
		el: "#content",
		template: ResTpl,
		render: function() {
			this.$el.html(_.template(this.template));
		}
	})
	//About me
	var AboutMe = Backbone.View.extend({
		el: "#content",
		template: AbtTpl,
		render: function() {
			this.$el.html(_.template(this.template));
		}
	})

	//Home
	var HomeView = Backbone.View.extend({
		el: "#content",
		template: homeTpl,
		// initialize: function() {
		// },
		render: function() {
			$(this.el).html(_.template(this.template));
		}
	});

	//Course model
	var Course=Backbone.Model.extend({
		baseUrl:'https://api.uwaterloo.ca/v2/',
		key:'556997f0bd9d161743e85093b5475161',
		url:function(){
			return(this.baseUrl + this.get('fix').join('/') + '.json?key=' + this.key+'&term=1159');
		},
		parse: function(response) {
			return response.data;
		}
		
	});
	//get schedule search history
	function gethistory(){
		if (localStorage.getItem("course-history")) {
			history_lst=localStorage.getItem("course-history").split(",");
			if (history_lst.length=6) {history_lst.pop()};
			return history_lst
		}else{
			return [];
		}
	};

	function getNum (value){
		num = '';
		value.split('').forEach(function(e){
			if (!isNaN(parseFloat(e))){
				num = num + e;
			};
		});
		return num;
	};
	function getVal (value){
		val='';
		value.split('').forEach(function(e){
			if (isNaN(parseFloat(e))){
				val=val+e;
			};
		});
		return val;
	};

	//Course History View
	var Course_History = Backbone.View.extend({
		el:'#course-history',
		render:function(){
			tmp_html='</br><table><tr><td>Search History</td></tr></table><table><tr>'
			history_lst=gethistory();
			history_lst.forEach(function(e){
				tmp_html+='<td> '+e+', </td>';
			})
			tmp_html+='</tr></table>'
			this.$el.html(tmp_html);
		}
	})

	//Search Course Sechdule View
	var SearchView = Backbone.View.extend({
		el:"#search",
		render: function() {
			text = $("#Course-Id").val().toLowerCase().replace(/ /g, '');
			num = getNum(text);
			val = getVal(text);
			lst = ['courses',val,num,'schedule'];
			cs = new Course({fix:lst});
			$.when(result = cs.fetch()).then(function() {
				if(!$.isEmptyObject(result.responseJSON.data)){
					history_lst=gethistory();
					history_lst.unshift($("#Course-Id").val())
					localStorage.setItem("course-history", history_lst);
					course_history=new Course_History();
					course_history.render();
					obj=result.responseJSON.data;
					tmp_html='';
					obj.forEach(
						function(e){
							tmp_html=tmp_html+"<table class='table table-bordered'><tr><td>"+e.subject+e.catalog_number+"</td><td>"+e.title+"</td></tr><tr><td>section: </td><td>"+e.section+"</td></tr><tr><td>datetime</td><td>"+e.classes[0].date.weekdays+"  "+e.classes[0].date.start_time+"-"+e.classes[0].date.end_time+"</td></tr></table>"
						}
					);
					$('#search').html(tmp_html);
				}else{
					$('#search').html(_.template(ErrTpl));
				}
			},
			function(){
				$('#search').html(_.template(ErrTpl));
			}
			);
			$('#search').html(_.template(LodTpl));
		}
	});
	
	//Search Course Schedule button and controller
	var Search_Course = Backbone.View.extend({
		el:"#search_course",
		events:{
			'click #course-button':'handleClick'
		},
		render:function(){
			return this;
		},
		handleClick:function(event){
  			event && event.preventDefault();
			this.searchView = new SearchView();
			this.searchView.render();
		},
	})

	//footer view and controller
	var FooterView= Backbone.View.extend({
		initialize:function(){
			this.model.on('change',function(){
				this.render();
			},this);
		},
		render:function(){
			this.$el.html(this.model.get('text'))
		}
	});

	//search info button controller
	var Search_Course_info = Backbone.View.extend({
		el:"#search_info",
		events:{
			'click #info-button':'search_course_info'
		},
		render:function(){
			return this;
		},
		search_course_info:function(event){
   			event && event.preventDefault();
			if(this.searchinfoView) this.searchinfoView.close();
			this.searchinfoView = new Search_Info_View();
			this.searchinfoView.render($('#info-Course-Id').val().toLowerCase().replace(/ /g, ''));
		}
	});


	//Dropdown list Model
	function fav_list(){
		if (localStorage.getItem("fav")) {
			return localStorage.getItem("fav").split(",");
		}else{
			return [];
		}
	};
	function is_fav(id){
		if($.inArray(id, fav_list())===-1){
			return false;
		}else{
			return true;
		}
	};
	function add_fav(id){
		list=fav_list();
		if(!is_fav(id)) list.unshift(id);
		localStorage.setItem("fav", list);
	};
	function del_fav(id){
		array=fav_list()
		var index = array.indexOf(id);
		if (index > -1) {
		    array.splice(index, 1);
		}
		localStorage.setItem("fav", array);
	};

	//control search info result view
	var Search_Info_View = Backbone.View.extend({
		el:"#info-search",
		events:{
			'click #add2fav':'addfav',
			'click #del2fav':'delfav',
		},
		render: function(key) {
			num = getNum(key);
			val = getVal(key);
			this.id=val+num;
			lst = ['courses',val,num];
			cs = new Course({fix:lst});
			$.when(result = cs.fetch()).then(function() {
				if(!$.isEmptyObject(result.responseJSON.data)){
					obj=result.responseJSON.data;
					tmp_html='<p>'+result.responseText+'</p>';
					template= _.template(InfoDtl);
					$('#info-search').html(template({cid:val+num,des:obj.description,name:obj.title,url:obj.url,pre:obj.prerequisites,ant:obj.antirequisites,cor:obj.corequisites,al:obj.academic_level,nte:obj.note,unt:obj.units}));
					if(is_fav(key)){
						$('#add_fav').hide();
						$('#del_fav').show();
					}else{
						$('#add_fav').show();
						$('#del_fav').hide();
					}
				}else{
					$('#info-search').html(_.template(ErrTpl));
				}
			},
			function(){
				$('#info-search').html(_.template(ErrTpl));
			});
			$('#info-search').html(_.template(LodTpl));
		},
		addfav:function(event){
    		event && event.preventDefault();
			add_fav(this.id);
			$('#add_fav').hide();
			$('#del_fav').show();
			ApplicationRouter.favlst=new Fav_List();
			ApplicationRouter.favlst.render();
		},
		delfav:function(event) {
   			event && event.preventDefault();
			del_fav(this.id);
			$('#del_fav').hide();
			$('#add_fav').show();
			ApplicationRouter.favlst=new Fav_List();
			ApplicationRouter.favlst.render();
		},
		close:function(){
			$(this.el).off('click', '#add2fav');
			$(this.el).off('click', '#del2fav');
		}
	});


	//favourite course list view
	var Fav_List= Backbone.View.extend({
		el:'#favlist',
		render: function(){
			favourite_list=fav_list();
			html_tpl='<div class="dropdown"><button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">Favourites<span class="caret"></span></button><ul class="dropdown-menu">'
			favourite_list.forEach(function(id){
				html_tpl+='<li><a href="#CourseInfo/'+id+'">'+id+'</a></li>'
			})
			html_tpl+='</ul></div>';
			this.$el.html(html_tpl);
		},
	})

	var m = new Backbone.Model({text:'<footer  class="text-center" id="footer">&copy:Tao Jing <a href="https://uwaterloo.ca/" target="_blank">Uwaterloo.ca</a> </br>Current time: '+new Date().toString()+'</footer>'});
	setInterval(function(){
		m.set({text:'<footer  class="text-center" id="footer">&copy:Tao Jing <a href="https://uwaterloo.ca/" target="_blank">Uwaterloo.ca</a></br>Current time: '+new Date().toString()+'</footer>'});
	},1000)

	$(".material-icons").html("<i class='fa fa-bars'></i>")
	var app = new ApplicationRouter();
	Backbone.history.start();
});



