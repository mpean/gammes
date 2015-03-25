angular.module('gammesApp', [])
  .controller('gammesController', ['$scope', function($scope) {
    $scope.yourNote = yourNote;	
	$scope.yourGamme = mixolydien;	
	$scope.selectNotes = selectNotes;	
	$scope.selectGammes = selectGammes;
 
   rendergamme = function() {
     guitare.renderRaphaelPositions($scope.yourNote, $scope.yourGamme,10,100);
    };
	  
	rendergamme();
}]);