var com = require('../com')
var util = require('../../lib/util')
var markdown = require('../../lib/markdown')

exports.submit = function(state, el, e) {
  var form = (el.tagName == 'FORM') ? el : el.form
  var text = form.text.value
  var parent = form.dataset.parent

  if (parent) state.apis.feed.postReply(text, parent, done)
  else state.apis.feed.postText(text, done)
  function done(err) {
    if (err) swal('Error While Publishing', err.message, 'error')
    else {
      form.text.value = ''
      var previewEl = form.querySelector('.preview')
      previewEl.innerHTML = ''
      state.sync()
    }
  }
}

exports.preview = function(state, el, e) {
  var form = (el.tagName == 'FORM') ? el : el.form
  var text = form.text.value

  var previewEl = form.querySelector('.preview')
  previewEl.innerHTML = markdown.block(util.escapePlain(text), state.names)
}

exports.newpost = function(state, el, e) {
  var form = el.parentNode.parentNode
  form.classList.add('opened')
}

exports.cancelNewpost = function(state, el, e) {
  var form = el.parentNode.parentNode.parentNode
  form.reset()
  form.querySelector('.preview').innerHTML = ''
  form.classList.remove('opened')
}

exports.reply = function(state, el, e) {
  var messageEl = el.parentNode.parentNode
  if (!messageEl.nextSibling || !messageEl.nextSibling.classList || !messageEl.nextSibling.classList.contains('reply-form')) {
    var formEl = com.postForm(state, el.dataset.msgid)
    if (messageEl.nextSibling)
      messageEl.parentNode.insertBefore(formEl, messageEl.nextSibling)
    else
      messageEl.parentNode.appendChild(formEl)
  }
}

exports.cancelReply = function(state, el, e) {
  var form = el.parentNode.parentNode.parentNode
  form.parentNode.removeChild(form)
}