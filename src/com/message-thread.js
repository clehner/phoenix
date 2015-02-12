'use strict'
var h = require('hyperscript')
var com = require('./index')

var messageOpts = { mustRender: false, topmost: true }
module.exports = function (app, thread, opts) {
  opts = opts || messageOpts
  var r = replies(app, thread)
  opts.mustRender = true//!!r // always render if there are replies
  opts.topmost = true // always topmost
  var m = com.message(app, thread, opts)
  return (m) ? h('.message-thread', [m, r]) : ''
}

function replies (app, thread) {
  // collect replies
  var r = []
  ;(thread.related || thread.replies || []).forEach(function(reply) {
    r.unshift(replies(app, reply))
    r.unshift(com.message(app, reply, { mustRender: true }))
  })

  if (r.length)
    return h('.message-replies', r)
  return ''
}
