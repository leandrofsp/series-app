var app = angular.module('seriesApp', ['ui.router']); //Criamos um módulo de nome seriesApp injetando o módulo ui.router como dependência.

//vamos adicionar nosso service "series" que tem como dependência o service $http para fazer requisições HTTP para nossa API
app.factory('series', ['$http', function($http) {

	var service = {
		series: []
	};

	service.getSeries = function() {
		return $http.get('/series').success(function(data) {
			angular.copy(data, service.series);
		});
	};	

	service.getSerie = function(id) {
		return $http.get('/series/' + id).then(function(res) {
			return res.data;
		});
	};

	service.adicionaSerie = function(serie) {
		return $http.post('/series', serie).success(function(data) {
			service.series.push(data);
		});
	};

	service.apagaSerie = function(id) {
		return $http.delete('/series/'+id);
	};

	service.atualizaSerie = function(serie) {
		return $http.put('/series/'+serie._id, serie);
	};

	return service;

}]);

/*Este controller recebe como dependências $scope, $location e o service recém criado, series.
	Ele é responsável por carregar a lista de séries do banco de dados através do service series 
	colocando-as no $scope para que esta lista seja exibida na nossa view, e também, adicionar 
	uma nova série através do método adicionaSerie.*/

app.controller('MainCtrl', ['$scope', '$location', 'series', function($scope, $location, series) {
	
	$scope.series = series.series;
	
	$scope.adicionaSerie = function() {
		if(!$scope.titulo || $scope.titulo === '')
			return;

		series.adicionaSerie({
			titulo: $scope.titulo,
			genero: $scope.genero,
			trailerURL: $scope.trailerURL
		});

		$location.path('/home');

	};


}]);

/* Este controller é responsável por apagar/atualizar uma série 
	baseado na série carregada em $scope injetada como dependência. */

app.controller('SeriesCtrl', ['$scope', '$location', 'series', 'serie', function($scope, $location, series, serie) {
	
	$scope.serie = serie;

	$scope.apagaSerie = function() {
		series.apagaSerie($scope.serie._id).success(function(data) {
			$location.path('/home');
		});
	};

	$scope.atualizaSerie = function() {
		series.atualizaSerie($scope.serie).success(function(data) {
			console.log(data.message);
			$location.path('/home');
		});
	};

}]);

/* Criaremos também uma diretiva para exibição de um vídeo do youtube (o trailer da série) embutido em um iframe: */
app.directive('youtube', function() {
	return {
		restrict: 'E',
		scope: {
			src: '='
		},
		templateUrl: 'views/youtube.html'
	}
});

app.filter('trusted', function ($sce) {
  return function(url) {
    return $sce.trustAsResourceUrl(url);
  };
});

//Vamos criar os estados da nossa aplicação utilizando $stateProvider de ui-router:
app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
	
	$stateProvider.state('home', {
		url: '/home',
		templateUrl: 'views/home.html',
		controller: 'MainCtrl',
		resolve: {
			seriePromisse: ['series', function(series) {
				return series.getSeries();
			}]
		}
	}).state('series', {
		url: '/series/{id}',
		templateUrl: 'views/serie.html',
		controller: 'SeriesCtrl',
		resolve: {
			serie: ['$stateParams', 'series', function($stateParams, series) {
				return series.getSerie($stateParams.id);
			}]
		}
	}).state('adiciona', {
		url: '/adiciona',
		templateUrl: 'views/adiciona.html',
		controller: 'MainCtrl'
	}).state('delete', {
		url: '/delete/{id}',
		templateUrl: 'views/apaga.html',
		controller: 'SeriesCtrl',
		resolve: {
			serie: ['$stateParams', 'series', function($stateParams, series) {
				return series.getSerie($stateParams.id);
			}]
		}
	}).state('update', {
		url: '/update/{id}',
		templateUrl: 'views/atualiza.html',
		controller: 'SeriesCtrl',
		resolve: {
			serie: ['$stateParams', 'series', function($stateParams, series) {
				return series.getSerie($stateParams.id);
			}]
		}
	});

	$urlRouterProvider.otherwise('home');

}]);

