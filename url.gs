/* チャットワークからメッセージ取得 */
  function fetchMessage(token,room_id){
    var params = {
      headers : {"X-ChatWorkToken" : token},
      method : "get"
    };   
    var url = "https://api.chatwork.com/v2/rooms/" + room_id + "/messages?force=0";
    var response = UrlFetchApp.fetch(url, params);
    if(response.getContentText()){
      return JSON.parse(response.getContentText());
    }else{
      return '';
    }
  }

/* main関数 */
function myFunction(test,count,subscript_count) {
  //変数の宣言
  var arr_test1=[]
  var flg=0
  var subscript_count=0
  for(let i = 0; i <count; i++) {
    if (i!=0){
      subscript_count=subscript_count+1
    }
    var matched = test[i]['body'].match(/(https?:\/\/[\w!?\/+_~=;.,*&@#$%()'[\]-]+)/m);
    var strMessage = matched ? matched[1] : "";
    arr_test1[subscript_count]=strMessage
    if (strMessage!=null){
      var text=test[i]['body']
      while(flg==0){
        if (subscript_count==0){
          text=text.replace(strMessage, "");
        }
        var matched1 = text.match(/(https?:\/\/[\w!?\/+_~=;.,*&@#$%()'[\]-]+)/m);
        if(matched1==null){
          flg=1
        }else{
          strMessage1 = matched1 ? matched1[1] : "";
          subscript_count=subscript_count+1
          arr_test1[subscript_count]=strMessage1
          text=text.replace(strMessage1, "");
        }
      }
    }
  }
  Logger.log(arr_test1)
  let mySheet = SpreadsheetApp.getActiveSheet();
  let lastRow = mySheet.getLastRow();
  for (i=0;i<arr_test1.length;i++){
    lastRow=lastRow+1
    mySheet.getRange(lastRow,1).setValue(arr_test1[i]);
  }
}
var token=""
var room_id=""
var test=fetchMessage(token,room_id)
if (test.length==0){
  Logger.log('投稿がありませんでした')
}else{
  Logger.log(test.length+'件の投稿がありました')
  count=test.length
  myFunction(test,count)
}


