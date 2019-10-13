var express = require('express');
var router = express.Router();
var database = require('../routes/database');
var fs = require('fs'); // required for file serving

const POINTS_PER_QUESTION = 1000;

module.exports = {
  /*
    Params: 
      func: function to be executed after getting data from database done
      rfunc: function to be executed if data from database is empty
      questionPacksId: questions-pack ID
      questionNumber: the question number 
  */
  getQuestion : function(func, rfunc, info){
    var questionsPackId = info.questionsPackId;
    var questionNumber = info.questionNumber;

    database.ref('/QuestionPacks/q' + questionsPackId + '/questions/question' + questionNumber).once('value').then(function (snapshot) {
      var result = snapshot.val();
      console.log('[] GET QUESTION', result);
      if(result){
        func(result,{questionNumber:questionNumber});
      }else{
        rfunc();
      }
    });
  },

  setStatusRoom : function(func, info){
    var roomID = info.roomID;
    var questionNumber = info.questionNumber;
    var status = info.status;
    
    database.ref('/Rooms/r' + roomID+'/status').set({
      questionNumber:questionNumber,
      status:status
    });

  },

  getAnswerAndTopScores : function(func, info){
    var roomID= info.roomID;
    var questionsPackId = info.questionsPackId;
    var questionNumber = info.questionNumber;
    var numTop = info.numTop || 4

    console.log('[] ', '/QuestionPacks/q' + questionsPackId + '/questions/question' + questionNumber)

    database.ref('/QuestionPacks/q' + questionsPackId + '/questions/question' + questionNumber).once('value').then(function (snapshot) {
      var result = snapshot.val();
      if(result){
        answer = result.answer;
        database.ref('/Rooms/r'+roomID+'/players').once('value').then(function(snapshot){
          var players = snapshot.val();
          var result = {};

          var top = [];
          var countAnswers = {a:0, b:0, c:0, d:0};

          for (var player in players) {
            let answers = players[player].answers;
            if(answers){
              let currQuestion = answers['question'+questionNumber.toString()];
              if(currQuestion){
                var playerAnswer = currQuestion.choice;
                countAnswers[playerAnswer]++;
                if(playerAnswer == answer){
                  var pointsAdding = POINTS_PER_QUESTION;
                  result[player] = {answerStatus:'correct', points:pointsAdding};
                  players[player].score += pointsAdding;
                  database.ref('/Rooms/r' + roomID+'/players/'+player+'/score').set(players[player].score);
                }else{
                  result[player] = {answerStatus:'incorrect', points:0};
                }
              }else{
                result[player] = {answerStatus:'incorrect', points:0};
              }
            }else{
              result[player] = {answerStatus:'incorrect', points:0};
            }
            top.push([player, players[player].score]);
          }

          top.sort(function(a, b) {
              return b[1]-a[1];
          });

          for (var player in players) {
            let ind=0;
            for(i of top){
              ind++;
              if(i[0] == player){
                result[player].rank = ind;
                break;
              }
            }
          }

          top = top.slice(0,numTop);

          for(i of top){
            i[0] = players[i[0]].name;
          }

          // Check if there still a next question
          var nextQuestionId = (parseInt(questionNumber)+1).toString();
          console.log('[]', '/QuestionPacks/q' + questionsPackId + '/questions/question' + nextQuestionId);
          database.ref('/QuestionPacks/q' + questionsPackId + '/questions/question' + nextQuestionId).once('value').then(function (snapshot) {
            if(snapshot.val()){
              state = 2;
            }else{
              state = 3;
            }
            
            // do
            func(
              {
                roomID:roomID,
                countAnswers:countAnswers,
                state:state,
                answer:answer,
                top: top,
                numTop: numTop
              },
              {
                roomID:roomID,
                players:result,
                state:state
              }
            );

          });
        });
      }
    });
  },

  getPlayers : function(func, rfunc, info){
    var roomID = info.roomID;

    database.ref('/Rooms/r'+roomID + '/players').once('value').then(function (snapshot) {
      var result = snapshot.val();
      if(result){
        func(result,{});
      }else{
        rfunc();
      }
    });
  },

  answeringQuestion : function(func, info){
    var roomID = info.roomID;
    var answer = info.answer;
    var player = info.player;
    var questionNumber = info.questionNumber;

    // check valid roomID and questionNumber 
    database.ref('/Rooms/r'+roomID + '/status').once('value').then(function (snapshot) {
      var statusRoom = snapshot.val();
      if(statusRoom){
        if(statusRoom.status=='playing' && statusRoom.questionNumber == questionNumber){
          database.ref('/Rooms/r' + roomID+'/players/' + player + '/answers/question'+questionNumber.toString()).set({
            choice:answer
          });
        }
      }
    });
  },

  checkOwnerLobby : function(rfunc, info){
    var roomID = info.roomID;
    var uid = info.uid;

    var notOwnerMessage={roomID:roomID, uid:uid};

    console.log(notOwnerMessage);

    // check valid roomID and questionNumber 
    database.ref('/Rooms/r'+roomID + '/authorId').once('value').then(function (snapshot) {
      var authorId = snapshot.val();
      if(authorId){
        if(authorId != uid){
          rfunc(notOwnerMessage);
        }
      }else{
        rfunc(notOwnerMessage);
      }
    });
  },

  getQuestionsPackData : function(func, info){

    var uid = info.uid;
    var roomID = info.roomID;

    if (uid) {
      database.ref('/QuestionPacks').once('value').then(function (snapshot) {
        var questionPacks = snapshot.val();
        if (questionPacks) {
          var result = {};
          for(var pack in questionPacks){
            var authors = questionPacks[pack].authors;
            for(var authorId in authors){
              if(authors[authorId]== uid){
                var quesPack = questionPacks[pack];
                result[pack] = {
                  description: quesPack.description,
                  title: quesPack.title,
                  imageURL: quesPack.imageURL
                };
                break;
              }
            }
          }
          func({questionPacks:result, roomID:roomID});
        } else {
          func({});
        }
      });
    } else {
      func({});
    }
  },

  getPlayers : function(func, info){
    var roomID = info.roomID;
    if (roomID) {
      // roomID is required ! If roomID is undefined, redirect to home page
      database.ref('/Rooms/r' + roomID+'/players').once('value').then(function (snapshot) {
        var players = snapshot.val();
        if (snapshot.val()) {
          // Room existed ! Render page to enter nick name 
          func({players:players, roomID:roomID});
        } else {
          func({});
        }
      });
    } else {
      // roomID is undefined
      func({});
    }
  },

  router: router,


};

