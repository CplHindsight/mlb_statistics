/*
Created by: Darren Laser
Date: October 11th, 2017
*/

var app = angular.module('kgBaseball', []);

app.controller('mainCtrl', function($scope, gameListFactory, gameViewFactory){
	//Variable Declaration
	$scope.gameListDataSet = "";
	$scope.gameViewDataSet = "";
	$scope.yArray = [];
	$scope.mArray = [];
	$scope.dArray = [];
	$scope.listOfGames = [];
	$scope.selectedDate = "";
	$scope.currDate = "";
	$scope.homeTeamPlayers = [];
	$scope.awayTeamPlayers = [];
	$scope.teamPlayers = [];
	$scope.teams = {};
	$scope.gameLinescores = {};
	$scope.gameInningsTotal = 0;
	$scope.favouriteTeam = "";
	$scope.player = "";

	var months = ["January", "February", "March", "April", 
		"May", "June", "July", "August", "September", "October", 
		"November", "December"];

	$scope.teamList = ["Angels", "Astros", "Athletics", "Blue Jays", "Braves", "Brewers", 
		"Cardinals", "Cubs", "Dodgers", "D-backs", "Giants", "Indians", "Mariners", 
		"Marlins", "Mets", "Nationals", "Orioles", "Padres", "Phillies", "Pirates", 
		"Rangers", "Rays", "Red Sox", "Reds", "Rockies", "Royals", "Tigers", 
		"Twins", "White Sox", "Yankees"];

	//Error display variables
	$scope.gamesList = false;
	$scope.gameView = false;

	//View display variables
	$scope.gameListView = false;
	$scope.monthLoaded = false;
	$scope.dayLoaded = false;
	$scope.daySelected = false;
	$scope.gameListButton = false;

	//Load pulldown menus for year and month
	for(var i = 2012; i <= 2017; i++){
		$scope.yArray.push(i);
	}
	for(var i = 0; i <= 11; i++){
		$scope.mArray.push(months[i]); 
	}

	//Method selects new data set based on date chosen from MLB API
	$scope.getGameListDataSet = (y, m, d)=> {
		if(y && m && d){
			//Required to provide correct date from month string
			for(var i = 0; i < months.length; i++){
				if(m === months[i]){
					m = i + 1;
				}
			}
			//Assign correct string values for dynamic API call
			m = m < 10 ? "0" + m.toString() : m.toString();
			d = d < 10 ? "0" + d.toString() : d.toString();
			y = y.toString();
			gameListFactory.getData(y, m, d).then(function(response){
				$scope.gameListDataSet = response;
				$scope.setDate(y, m, d);
				//No data available for specific date
				if($scope.gameListDataSet == "No game list data available"){
					$scope.gamesList = false;
					$scope.gameListView = true;
				}
				else{
					$scope.gameListDataSet = response.data.games.game;
					//No existing games for specific date
					if($scope.gameListDataSet == undefined){
						$scope.gamesList = false;
						$scope.gameListView = true;
					}
					else{
						$scope.setGameListData($scope.gameListDataSet);
					}
				}
			}, function(msg){
				console.log(msg);
			});
		}
	};
	
	//Method sets the home and away team and linescore objects and favourite team order
	$scope.setGameListData = (data)=> {
		//function to determine if there is a length of an object
		function lengthObj(o){
			return Object.keys(o).length;
		}

		if(data){
			var game = {};
			$scope.listOfGames = [];
			//if data is a single object
			if(data.length == undefined){
				//ensure there is at least a single game
				if(lengthObj(data.game_type) == 1){
					game.home_team_name = data.home_team_name;
					game.away_team_name = data.away_team_name;
					game.status = data.status;
					game.linescore = data.linescore;
					game.game_data_directory = data.game_data_directory;
					$scope.listOfGames.push(game);
				}
			}
			//if data is an array
			else if(data.length >= 2){
				for(var i = 0; i < data.length; i++){
					game.home_team_name = data[i].home_team_name;
					game.away_team_name = data[i].away_team_name;
					game.status = data[i].status;
					game.linescore = data[i].linescore;
					game.game_data_directory = data[i].game_data_directory;
					$scope.listOfGames.push(game);
					game = {};
				}
			}

			//Bold winning team
			for(var i = 0; i < $scope.listOfGames.length; i++){
				if($scope.listOfGames[i].linescore){
					if(parseInt($scope.listOfGames[i].linescore.r.away) > parseInt($scope.listOfGames[i].linescore.r.home)){
						$scope.listOfGames[i].winner = 'a';
					}
					else if(parseInt($scope.listOfGames[i].linescore.r.away) < parseInt($scope.listOfGames[i].linescore.r.home)){
						$scope.listOfGames[i].winner = 'h';
					}
				}
				else{
					$scope.listOfGames[i].winner = 'u';
				}
			}

			$scope.orderByTeam();
			$scope.gameListView = true;
			$scope.gamesList = true;
		}
	};

	//Method orders list of games by favourite team dynamically
	$scope.orderByTeam = ()=> {
		for(var i = 0; i < $scope.listOfGames.length; i++){
				//Set Blue Jays as the favourite team to appear at the 
				//front of the games list array
				if($scope.favouriteTeam == "" || $scope.favouriteTeam == undefined){
					$scope.favouriteTeam = "Blue Jays";
				}
				if($scope.listOfGames[i].home_team_name == $scope.favouriteTeam 
					|| $scope.listOfGames[i].away_team_name == $scope.favouriteTeam){
					var temp = $scope.listOfGames[i];
					$scope.listOfGames.splice(i, 1);
					$scope.listOfGames.splice(0, 0, temp);
				}				
			}
	};

	//Method uses individual game view factory with MLB API to pull data
	$scope.getGameStatsDataSet = (url)=> {
		if(url !== undefined || url !== ""){
			gameViewFactory.getData(url).then(function(response){
				$scope.gameViewDataSet = response;
				
				//No data available for specific date
				if($scope.gameViewDataSet == "No individual game view data available"){
					$scope.gameView = false;
					$scope.gameListButton = false;
				}
				else{
					$scope.gameViewDataSet = response.data.boxscore;
					//No existing games for specific date
					if($scope.gameViewDataSet == undefined){
						$scope.gameView = false;
						$scope.gameListButton = false;
					}
					else{
						$scope.setIndividualGameData($scope.gameViewDataSet);
					}
				}
			}, function(msg){
				console.log(msg);
			});
			//Change view boolean
			$scope.gameListView = false;
		}
	};

	//Method populates home and away team player and linescore objects
	$scope.setIndividualGameData = (data)=> {
		if(data){
			var i = 0;
			var j = 0;
			//Team Players
			var playerObj = [];
			for(i = 0; i < data.batting.length; i++){
				for(j = 0; j < data.batting[i].batter.length; j++){
					var player = {};
					player.name = data.batting[i].batter[j].name;
					player.ab = data.batting[i].batter[j].ab;
					player.r = data.batting[i].batter[j].r;
					player.h = data.batting[i].batter[j].h;
					player.rbi = data.batting[i].batter[j].rbi;
					player.bb = data.batting[i].batter[j].bb;
					player.so = data.batting[i].batter[j].so;
					player.avg = data.batting[i].batter[j].avg;
					player.fullName = data.batting[i].batter[j].name_display_first_last;
					player.position = data.batting[i].batter[j].pos;
					player.season_stats = {
						walks: data.batting[i].batter[j].s_bb,
						hits: data.batting[i].batter[j].s_h,
						homeruns: data.batting[i].batter[j].s_hr,
						rbi: data.batting[i].batter[j].s_rbi,
						strikeouts: data.batting[i].batter[j].s_so
					};
					playerObj.push(player);
				}
				if(i < 1){
					$scope.homeTeamPlayers = playerObj;
					playerObj = [];
				}
				else{
					$scope.awayTeamPlayers = playerObj;
					playerObj = [];
				}
			}
			$scope.teamPlayers = $scope.awayTeamPlayers;

			//Linescores
			var linescore = [];
			var line = {};
			for(i = 0; i < data.linescore.inning_line_score.length; i++){
				line.away = data.linescore.inning_line_score[i].away;
				line.inning = data.linescore.inning_line_score[i].inning;
				line.home = data.linescore.inning_line_score[i].home;
				linescore.push(line);
				line = {};
			}
			$scope.gameLinescores.linescore = linescore;
			$scope.gameLinescores.away_team_errors = data.linescore.away_team_errors;
			$scope.gameLinescores.away_team_hits = data.linescore.away_team_hits;
			$scope.gameLinescores.away_team_runs = data.linescore.away_team_runs;
			$scope.gameLinescores.home_team_errors = data.linescore.home_team_errors;
			$scope.gameLinescores.home_team_hits = data.linescore.home_team_hits;
			$scope.gameLinescores.home_team_runs = data.linescore.home_team_runs;

			//Total Innings
			$scope.gameInningsTotal = data.linescore.inning_line_score.length;

			//Team Names
			$scope.teams.away_sname = data.away_sname;
			$scope.teams.away_team_code = data.away_team_code.toUpperCase();
			$scope.teams.home_sname = data.home_sname;
			$scope.teams.home_team_code = data.home_team_code.toUpperCase();

			$scope.gameListView = false;
			$scope.gameListButton = false;
			$scope.gameView = true;
		}
	};

	//Method determines which team players to display
	$scope.showTeamPlayers = (val)=> {
		switch(val){
			case "away":
				$scope.teamPlayers = $scope.awayTeamPlayers;
				break;
			case "home":
				$scope.teamPlayers = $scope.homeTeamPlayers;
				break;
		}
	};

	//Method sets player value for modal display
	$scope.playerStats = (player)=> {
		$scope.player = player;
	};

	//Method for game display view changes
	$scope.viewGameList = ()=> {
		$scope.gameListView = true;
		$scope.gameListButton = true;
		$scope.gameView = false;
	};

	//Method displays View Statistics button
	$scope.dispSearch = ()=> {
		$scope.daySelected = true;
		$scope.gameListButton = true;
	};

	//Method populates date pulldown menu objects
	$scope.loadDate = (val)=> {
		if(val === 'month'){
			$scope.monthLoaded = true;
		}
		else{
			$scope.dArray = [];
			if($scope.year && $scope.month){
				var month = "";
				for(var i = 0; i < months.length; i++){
					if($scope.month === months[i]){
						month = i + 1;
					}
				}
				$scope.dayLoaded = true;
				//Determine the number of days in the month
				//Find the last day of the previous month by subtracting an hour
				var days = new Date($scope.year, month, 1, -1).getDate();
				for(var i = 1; i <= days; i++){
					$scope.dArray.push(i);
				}
			}
		}
	};

	//Method handles the changing of the date through side arrows, ensuring dates roll over correctly.
	$scope.changeDate = (val)=> {
		if(val == 1){
			var day = $scope.currDate.getDate() + 1;
			var month = $scope.currDate.getMonth() + 1;
			var year = $scope.currDate.getFullYear();
			var daysInMonth = new Date(year, month, 1, -1).getDate();
			//Ensure that if the day rolls past the end of the month or year, 
			//the date rolls to the correct date
			if(day > daysInMonth){
				day = 1;
				month++;
				if(month > 12){
					month = 1;
					year++;
				}
			}
			$scope.getGameListDataSet(year, month, day);
		}
		else{
			var day = $scope.currDate.getDate() - 1;
			var month = $scope.currDate.getMonth() + 1;
			var year = $scope.currDate.getFullYear();
			var daysInMonth = new Date(year, month, 1, -1).getDate();
			//Ensure that if the day rolls past the beginning of the month or year, 
			//the date rolls to the correct date
			if(day < 1){
				month--;
				if(month < 1){
					month = 12;
					year--;
				}
				daysInMonth = new Date(year, month, 1, -1).getDate();
				day = daysInMonth;	
			}
			$scope.getGameListDataSet(year, month, day);
		}
	};

	//Method sets current date display
	$scope.setDate = (y, m, d)=> {
		$scope.currDate = new Date(m.toString() + '/' + d.toString() + '/' + y.toString());
		var options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'};
		$scope.selectedDate = $scope.currDate.toLocaleDateString('en-US', options);
	};
});

//Factory created to handle dynamic data loading for game list
app.factory('gameListFactory', function($http){
	var factory = {
		baseballListData: false,
		getData: function(y, m, d){
			return $http.get('http://gd2.mlb.com/components/game/mlb/year_' 
		+ y + '/month_' + m + '/day_' + d + '/master_scoreboard.json')
			.then(function(response){
				var data = response.data;
				factory.baseballListData = data;
				//resolve promise
				return data;
			}, function(error){
				return "No game list data available";
			});
		}
	};
	return factory;
});

//Factory created to handle dynamic data loading for individal game data
app.factory('gameViewFactory', function($http){
	var factory = {
		baseballGameData: false,
		getData: function(url){
			return $http.get('http://gd2.mlb.com' + url.toString() + '/boxscore.json')
			.then(function(response){
				var data = response.data;
				factory.baseballGameData = data;
				//resolve promise
				return data;
			}, function(error){
				return "No individual game view data available"
			});
		}
	};
	return factory;
});

