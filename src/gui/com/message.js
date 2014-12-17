var h = require('hyperscript')
var com = require('./index')
var util = require('../../lib/util')

module.exports = function(state, msg) {
  return messageRaw(state, msg)
}

function messageRaw(state, msg) {
  var json = util.escapePlain(JSON.stringify(msg.value.content, null, 2))

  // turn feed references into links
  json = json.replace(/\"feed\": \"([^\"]+)\"/g, function($0, $1) {
    var nick = nicknameMap[$1] || $1
    return '"feed": "<a class="user-link" href="/#/profile/'+$1+'">'+nick+'</a>"'
  })

  // turn message references into links
  json = json.replace(/\"msg\": \"([^\"]+)\"/g, function($0, $1) {
    return '"msg": "<a href="/#/msg/'+$1+'">'+$1+'</a>"'
  })

  var content = h('.message-raw', { innerHTML: json })
  return renderMsgShell(state, msg, content)
}

// renders message with the header and footer
function renderMsgShell(state, msg, content) {
  return h('.panel.panel-default', [
    h('.panel-body', [
      renderMsgHeader(state, msg),
      content,
    ]),
  ])
}

// message header
function renderMsgHeader(state, msg) {
  return h('p', [
    com.userlink(msg.value.author, state.nicknames[msg.value.author]),
    ' ', h('span', { innerHTML: com.toEmoji(msg.value.author.slice(0,16), 16) }),
    h('small.message-ctrls', [
      ' - ',
      com.a('#/msg/'+msg.id, util.prettydate(new Date(msg.value.timestamp), true), { title: 'View message thread' })
    ])
  ])
}