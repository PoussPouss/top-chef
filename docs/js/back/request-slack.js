var http = require('https')

token = "xoxp-314209434214-313337735044-314412164823-f39cbb57b346dfa388286fead2ee60f4"
channel = "D98C3MTEK"

function createLinkSendMessage(message,token,channel){
  var url = "https://slack.com/api/chat.postMessage?"
  url += "token="+token
  url += "&channel="+channel
  url += "&username=HomeBotMichelin"
  url += "&mrkdwn=true"
  url += "&icon_url=https%3A%2F%2Fdatadome.co%2Fwp-content%2Fuploads%2F2016%2F02%2Frobocog-1.png"
  message= message.replace(/ /g,'%20')
  url += "&text="+message
  return url
}

var link = createLinkSendMessage("*Salut* -les tocards-",token,channel)
http.get(link, function callback(response) {})
