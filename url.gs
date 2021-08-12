/* チャットワークからメッセージ取得 */
  function get_chatwork_message(){
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

/* メッセージを取得してスプレットシートへ書き込み */
function spreadsheet_writing(messages_get,messages_count) {
  //変数の宣言
  //================//
  var arr_url=[]
  var arr_url_name=[]
  var arr_name=[]
  var flg=0
  var subscript_count=0
  var test='false'
  //================//
  //メッセージ数文ループを回す
  for(let i = 0; i <messages_count; i++) {
    if (i!=0){
      subscript_count=subscript_count+1
    }
    //URL以外を消す(正規表現)
    var matched = messages_get[i]['body'].match(/(https?:\/\/[\w!?\/+_~=;.,*&@#$%()'[\]-]+)/m);
    //URLだけを抽出する
    var strMessage = matched ? matched[1] : "";
    //urlを抽出して''の場合には弾く
    if (strMessage!=''){
    //配列にURLを書き込む（一回目）
    arr_url[subscript_count]=strMessage
    //配列に投稿者の名前を書き込む（一回目）
    arr_name[subscript_count]=messages_get[i]['account']['name']
    //URLが１つ以上あるとき
    if (strMessage!=null){
      //もう一度メッセージの全文を受け取る
      var text=messages_get[i]['body']
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
          //strMessage1!=null
          if (strMessage1!=null){
          //添字に+1する
          subscript_count=subscript_count+1
          //urlを配列に入れる
          arr_url[subscript_count]=strMessage1
          //アカウントの名前を入れる
          arr_name[subscript_count]=messages_get[i]['account']['name']
          //配列に入れたurlをメッセージから消す
          text=text.replace(strMessage1, "");
          }
        }//if文
      }//while文flg==0
    }//if文 strMessage!=null
    }//if文　strMessage!=''
  }//for文の最後
  for(i=0;i<arr_url.length;i++){
    //arr_url[i]==nullがnullの場合にはスプレイピングを実施しない
    if (arr_url[i]==null){
    }else{
    //スプレイピング
    try {
      //htmlファイルを抽出
      let html = UrlFetchApp.fetch(arr_url[i]).getContentText("UTF-8");
      //タイトル取得
      let titlelist = Parser.data(html).from("<title>").to("</title>").iterate();
      //タイトル配列に入れる
      arr_url_name[i]=titlelist
      }
      catch(error) {
        //URLからタイトルが抽出できない場合にはタイトル取得不可と入れる
        arr_url_name[i]='タイトル取得不可'
      } // catch(error)
  }// try文
  }// for文
  //スプレットシートを開く
  let mySheet = SpreadsheetApp.getActiveSheet();
  //スプレットシートの最後の行を取得
  let lastRow = mySheet.getLastRow();
  //配列文 for文を回す
  for (i=0;i<arr_url.length;i++){
    //どの配列にもnullが含まれていないとき
    if((arr_url_name[i]!=null)&(arr_url[i]!=null)&(arr_name[i]!=null)){
    lastRow=lastRow+1
    //urlのタイトルをスプレットシートに書き込み
    mySheet.getRange(lastRow,1).setValue(arr_url_name[i]);
    //urlスプレットシート書き込み
    mySheet.getRange(lastRow,2).setValue(arr_url[i]);
    //投稿者書き込み
    mySheet.getRange(lastRow,3).setValue(arr_name[i]);
    }//for文
  }//if文
}

function main(){
  //チャットワーク取得する関数を実行する(件数取得)
  var messages_get=get_chatwork_message()
  //投稿がない場合
  if (messages_get.length==0){
    Logger.log('投稿がありませんでした')
  //メッセージがある場合
  }else{
    Logger.log(messages_get.length+'件の投稿がありました')
    //件数
    messages_count=messages_get.length
    //URL抽出プログラムの実行
    spreadsheet_writing(messages_get,messages_count)
  }
}
main()
