/* チャットワークからメッセージ取得 */
  function fetchMessage(token,room_id){
    //token
    var token = PropertiesService.getScriptProperties().getProperty("token");
    //room_id
    var room_id = PropertiesService.getScriptProperties().getProperty("room_id");  
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

function myFunction(test,count,subscript_count) {
  //変数の宣言
  //================//
  var arr_url=[]
  var arr_name=[]
  var flg=0
  var subscript_count=0
  //================//
  //メッセージ数文ループを回す
  for(let i = 0; i <count; i++) {
    if (i!=0){
      subscript_count=subscript_count+1
    }
    //URL以外を消す(正規表現)
    var matched = test[i]['body'].match(/(https?:\/\/[\w!?\/+_~=;.,*&@#$%()'[\]-]+)/m);
    //URLだけを抽出する
    var strMessage = matched ? matched[1] : "";
    //配列にURLを書き込む（一回目）
    arr_url[subscript_count]=strMessage
    //配列に投稿者の名前を書き込む（一回目）
    arr_name[subscript_count]=test[i]['account']['name']
    //URLが１つ以上あるとき
    if (strMessage!=null){
      //もう一度メッセージの全文を受け取る
      var text=test[i]['body']
      //whileでURLがなくなるまで処理を続ける
      while(flg==0){
        //メッセージから前のURLを消す
        if (subscript_count==0){
          text=text.replace(strMessage, "");
        }
        //一回目の処理を繰り返す
        var matched1 = text.match(/(https?:\/\/[\w!?\/+_~=;.,*&@#$%()'[\]-]+)/m);
        //URLがなくなったら書き込む
        if(matched1==null){
          flg=1
        }else{
          //URL抽出を書き込む処理を繰り返す
          strMessage1 = matched1 ? matched1[1] : "";
          subscript_count=subscript_count+1
          arr_url[subscript_count]=strMessage1
          arr_name[subscript_count]=test[i]['account']['name']
          text=text.replace(strMessage1, "");
        }
      }
    }
  }
  Logger.log(arr_url)
  Logger.log(arr_name)
  let mySheet = SpreadsheetApp.getActiveSheet();
  let lastRow = mySheet.getLastRow();
  for (i=0;i<arr_url.length;i++){
    lastRow=lastRow+1
    //urlスプレットシート書き込み
    mySheet.getRange(lastRow,1).setValue(arr_url[i]);
    //投稿者書き込み
    mySheet.getRange(lastRow,2).setValue(arr_name[i]);
  }
}
function main(){
  //チャットワーク取得する関数を実行する(件数取得)
  var test=fetchMessage()
  //投稿がない場合
  if (test.length==0){
    Logger.log('投稿がありませんでした')
  //メッセージがある場合
  }else{
    Logger.log(test.length+'件の投稿がありました')
    //件数
    count=test.length
    //URL抽出プログラムの実行
    myFunction(test,count)
  }
}
main()
