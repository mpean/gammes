angular.module('gammesApp', [])
  .controller('gammesController', ['$scope', function($scope) {
	$scope.yourNote = yourNote;
	$scope.yourGamme = yourGamme;
	$scope.yourInstrument = yourIntrument;
	$scope.selectNotes = selectNotes;	
	$scope.selectGammes = selectGammes;
	$scope.selectIntruments = selectIntruments;

	$scope.rendergamme = function() {
		$scope.yourInstrument.renderCanvasPositions($scope.yourNote, $scope.yourGamme,10,100);
	};

	$scope.rendergamme();
}]);
