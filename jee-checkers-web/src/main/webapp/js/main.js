/**
 * Created by baptiste on 19/01/2017.
 */
$(document).ready(function(){
    // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
    $('.modal').modal();
});

var app = angular.module('AppChecker', []);

app.controller('mainController', function($scope, $location,$window, $http){
    $scope.range = function(min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) {
            input.push(i);
        }
        return input;
    };

    $scope.postConfToServer = function() {
        $http({
            method : 'POST',
            url : 'GameHelper',
            data : {
                Token : "NEWGAME",
                Player1 : $scope.Player1,
                Player2 : $scope.Player2
            },
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(success) {
            console.log(success);
            //$scope.board = success.data.board;
            //$scope.gameId = success.data.tokenGame;
            $scope.saveTokenToLocalStorage(success.data.tokenGame);
            $window.location.href = '?token=' + success.data.tokenGame;
        }),function(error) {
            console.log(error);
        };
    };

    $scope.postResetGame = function() {
        $http({
            method : 'POST',
            url : 'GameHelper',
            data : {
                Token : "RESET",
                GameId : $scope.gameId
            },
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(success) {
            console.log(success);
            $scope.board = success.data.board;
            $scope.gameId = null;
            $scope.emptyLocalToken();
        }),function(error) {
            console.log(error);
        };

    };

    $scope.postResumeGame = function() {

        var tokenToSend;

        if($scope.token){
            tokenToSend = $scope.token;
        }else if ($scope.getTokenFromLocalStorage() != null){
            tokenToSend = $scope.getTokenFromLocalStorage();
        }

        $http({
            method : 'POST',
            url : 'GameHelper',
            data : {
                Token : "RESUME",
                GameId : tokenToSend
            },
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(success) {
            // console.log(success);
            // $scope.board = success.data.board;
            // $scope.gameId = success.data.tokenGame;
            // $scope.saveTokenToLocalStorage(success.data.tokenGame);
            $scope.saveTokenToLocalStorage(success.data.tokenGame);
            $window.location.href = '?token=' + success.data.tokenGame;
        }),function(error) {
            console.log(error);
        };
    };

    $scope.postPlayToServer = function(destRow, destCol){

        $http({
            method : 'POST',
            url : 'GameHelper',
            data : {
                originRow : $scope.originRow,
                originCol : $scope.originCol,
                destRow : destRow,
                destCol : destCol,
                Token : "PLAY",
                GameId : $scope.gameId
            },
            headers: {
                'Content-Type' : 'application/json'
            }
        }).then(function (success){
            console.log(success);
            $scope.originRow = null;
            $scope.originCol = null;
            $scope.board = success.data.board;
        },function(error){
            //console.log(error);
            $scope.originRow = null;
            $scope.originCol = null;
        })
    }

    $scope.setCellColor = function(rowIndex, colIndex) {
        if(colIndex %2 == 0 && rowIndex %2 == 0){
            return {"backgroundColor": "white"};
        }
        if(colIndex %2 == 0 && rowIndex %2 == 1){
            return {"backgroundColor": "black"};
        }

        if(colIndex %2 == 1 && rowIndex %2 == 0){
            return {"backgroundColor": "black"};
        }

        if(colIndex %2 == 1 && rowIndex %2 == 1){
            return {"backgroundColor": "white"};
        }
    };

    $scope.setStyling = function(rowIndex, colIndex) {
        var cell = $scope.board.cells[rowIndex][colIndex];
        //console.log(cell.pawn);
        if(cell.pawn != undefined){
            if(cell.pawn.pawnColor == "WHITE" && cell.pawn.pawnType == "NORMAL"){
                return {"backgroundColor": "#81c784"};
            }
            if(cell.pawn.pawnColor == "BLACK" && cell.pawn.pawnType == "NORMAL"){
                return {"backgroundColor": "#ff8a65"};
            }
            if(cell.pawn.pawnColor == "WHITE" && cell.pawn.pawnType == "QUEEN"){
                return {"backgroundColor": "#4caf50"};
            }
            if(cell.pawn.pawnColor == "BLACK" && cell.pawn.pawnType == "QUEEN"){
                return {"backgroundColor": "#e65100"};
            }
        }
        else {
            return {"backgroundColor": "none"};
        }
    }

    $scope.play = function(rowIndex, colIndex) {
        if($scope.originRow == null && $scope.originCol == null){
            $scope.originRow = rowIndex;
            $scope.originCol = colIndex;
            //console.log("saving first click ", $scope.originRow, " ", $scope.originCol)
        }else{
            $scope.postPlayToServer(rowIndex, colIndex);
            setTimeout(function() {
                $scope.$apply(function () {
                    $scope.isGameFinished();
                });
            }, 1000);
        }
    };

    $scope.isGameFinished = function(){
        $scope.winner = null;
        if($scope.board != null){
            if($scope.board.playerWhite.isWinner == true){
                $scope.winner = $scope.board.playerWhite.name;
                $('#modal1').modal('open');
            }
            if($scope.board.playerBlack.isWinner == true){
                $scope.winner = $scope.board.playerBlack.name;
                $('#modal1').modal('open');
            }
        }
    }

    $scope.saveTokenToLocalStorage = function(tokenGame){
        localStorage.setItem("tokenGame", tokenGame)
    }

    $scope.getTokenFromLocalStorage = function () {
        return localStorage.getItem("tokenGame");
    }

    $scope.emptyLocalToken = function(){
        localStorage.removeItem("tokenGame");
    }

    $scope.firstLoadGame = function () {
        if(theData != undefined || theData != null){
            $scope.board = theData.board;
            $scope.gameId = theData.tokenGame;
            $scope.Player1 = theData.board.playerWhite.name;
            $scope.Player2 = theData.board.playerBlack.name;
            console.log(theData);
        }
    }

    $scope.firstLoadGame();
});