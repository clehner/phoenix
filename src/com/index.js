'use strict'
var h = require('hyperscript')
var baseEmoji = require('base-emoji')
var u = require('../lib/util')

var a =
exports.a = function (href, text, opts) {
  opts = opts || {}
  opts.href = href
  return h('a', opts, text)
}

var icon =
exports.icon = function (i) {
  return h('span.glyphicon.glyphicon-'+i)
}

var nameConfidence =
exports.nameConfidence = function (id, app) {
  if (app.users.nameTrustRanks[id] !== 1) {
    return [' ', h('a', 
      { title: 'This name was self-assigned and needs to be confirmed.', href: '#/profile/'+id },
      h('span.text-muted', icon('user'), '?')
    )]
  }
  return ''
}

var userlink =
exports.userlink = function (id, text, opts) {
  opts = opts || {}
  opts.className = (opts.className || '') + ' user-link'
  text = text || u.shortString(id)
  return h('span', a('#/profile/'+id, text, opts))
}

var user =
exports.user = function (app, id) {
  return [userlink(id, userName(app, id)), nameConfidence(id, app)]
}

var userName =
exports.userName = function (app, id) {
  return app.users.names[id] || u.shortString(id)
}

var profilePicUrl =
exports.profilePicUrl = function (app, id) {
  var url = '/img/default-prof-pic.png'
  var profile = app.users.profiles[id]
  if (profile) {
    if (profile.assignedBy[app.user.id] && profile.assignedBy[app.user.id].profilePic)
      url = '/ext/' + profile.assignedBy[app.user.id].profilePic.ext
    else if (profile.self.profilePic)
      url = '/ext/' + profile.self.profilePic.ext
  }
  return url
}

var userlinkThin =
exports.userlinkThin = function (id, text, opts) {
  opts = opts || {}
  opts.className = (opts.className || '') + 'thin'
  return userlink(id, text, opts)
}

var hexagon =
exports.hexagon = function (img, size) {
  img = img ? 'url('+img+')' : 'none'
  size = size || 30
  return h('.hexagon-'+size, { style: 'background-image: '+img },
    h('.hexTop'),
    h('.hexBottom'))
}

var userHexagon =
exports.userHexagon = function (app, id, size) {
  return h('a.user-hexagon', { href: '#/profile/'+id, title: userName(app, id) }, hexagon(profilePicUrl(app, id), size))
}

var userHexagrid =
exports.userHexagrid = function (app, uids, opts) {
  var nrow = (opts && opts.nrow) ? opts.nrow : 3
  var size = (opts && opts.size) ? opts.size : 60

  var els = [], row = []
  uids.forEach(function (uid) {
    row.push(userHexagon(app, uid, size))
    if (row.length >= nrow) {
      els.push(h('div', row))
      row = []
    }
  })
  if (row.length)
    els.push(h('div', row))
  return h('.user-hexagrid-'+size, els)
}

var friendsHexagrid =
exports.friendsHexagrid = function (app, opts) {
  var friends = []
  for (var k in app.users.profiles) {
    var p = app.users.profiles[k]
    if (p.assignedBy[app.user.id] && p.assignedBy[app.user.id].following)
      friends.push(p.id)
  }
  if (friends.length)
    return [h('h4.text-muted', 'Friends'), userHexagrid(app, friends, opts)]
}

var toEmoji =
exports.toEmoji = function (buf, size) {
  size = size || 20
  if (!buf)
    return ''
  if (typeof buf == 'string')
    buf = new Buffer(buf.slice(0, buf.indexOf('.')), 'base64')
  return baseEmoji.toCustom(buf, function(v, emoji) {
    return '<img class="emoji" width="'+size+'" height="'+size+'" src="/img/emoji/'+emoji.name+'.png" alt=":'+emoji.name+':" title="'+emoji.name+'"> '+emoji.name.replace(/_/g, ' ')+'<br>'
  })
}


var nav =
exports.nav = function (opts) {
  var items = opts.items.map(function (item) {
    var cls = '.navlink-'+item[0]
    if (item[0] == opts.current)
      cls += '.selected'
    if (typeof item[1] == 'function')
      return h('a'+cls, { href: '#', 'data-item': item[0], onclick: item[1] }, item[2])
    return h('a'+cls, { href: item[1] }, item[2])
  })
  return h('.navlinks', items)
}

var search =
exports.search = function (opts) {
  var searchInput = h('input.search', { type: 'text', name: 'search', placeholder: 'Search', value: opts.value })
  return h('form', { onsubmit: opts.onsearch }, searchInput)
}

var sidenav =
exports.sidenav = function (app) {
  var registryPages = app.getAll('page')
    .map(function(item) {
      if (item.config.label)
        return [item.config.id, item.config.id, item.config.label]
    })
    .filter(Boolean)

  var pages = [
  //[id, path, label],
    ['feed',         '',             'feed'],
    ['address-book', 'address-book', 'network']
  ].concat(registryPages).concat([
    ['programs',     'programs',     'plugins'],
    ['help',         'help',         'help']
  ])

  return h('.side-nav.full-height',
    pages.map(function (page) {
      if (page == '-')
        return h('hr')
      if (page[0] == app.page.id)
        return h('p.selected.side-nav-'+page[0], a('#/'+page[1], page[2]))
      return h('p.side-nav-'+page[0], a('#/'+page[1], page[2]))
    })
  )
}

var sidehelp =
exports.sidehelp = function (app, opts) {
  return h('ul.list-unstyled.sidehelp',
    h('li', h('button.btn.btn-link', { onclick: app.ui.showUserId }, 'Get your id')),
    h('li', h('button.btn.btn-link', { onclick: app.ui.followPrompt }, 'Add a contact')),
    h('li', h('button.btn.btn-link', { onclick: app.ui.followPrompt }, 'Use an invite')),
    (!opts || !opts.noMore) ? h('li', h('span', {style:'display: inline-block; padding: 6px 14px'}, a('#/help', 'More help'))) : ''
  )
}

exports.introhelp = function (app) {
  return h('.row',
    h('.col-xs-4',
      panel(h('span', 'Join a Pub Server ', h('small', 'recommended')),
        h('div',
          h('p', 'Ask the owner of a pub server for an ', a('#/help/pubs', 'invite code'), '.'),
          h('button.btn.btn-primary', { onclick: app.ui.followPrompt }, 'Use an invite')
        )
      )
    ),
    h('.col-xs-4',
      panel('Connect over WiFi',
        h('p', 'Open the ', a('#/address-book', 'address book'), ' and find peers on your WiFi in the ', h('strong', 'Network'), ' column.')
      )
    ),
    h('.col-xs-4',
      panel(h('span', 'Start a Pub Server ', h('small', 'advanced')),
        h('p',
          a('https://github.com/ssbc/scuttlebot#running-a-pub-server', 'Follow these instructions'),
          ' then hand out invite codes to friends.'
        )
      )
    )
  )
}

exports.paginator = function (base, start, count) {
  var prevBtn = h('a.btn.btn-primary', { href: base+((start - 30 > 0) ? start - 30 : 0) }, icon('chevron-left'))
  var nextBtn = h('a.btn.btn-primary', { href: base+(start+30) }, icon('chevron-right'))
  if (start <= 0) prevBtn.setAttribute('disabled', true)    
  if (start+30 > count) nextBtn.setAttribute('disabled', true)
  return h('p', prevBtn, (start + 1), ' - ', Math.min(count, (start + 30)), ' ('+count+')', nextBtn)
}

var panel =
exports.panel = function (title, content) {
  return h('.panel.panel-default', [
    (title) ? h('.panel-heading', h('h3.panel-title', title)) : '',
    h('.panel-body', content)
  ])
}

var page =
exports.page = function (app, id, content) {
  return h('#page.container-fluid.'+id+'-page', content)
}

exports.prettyRaw = require('./pretty-raw')
exports.messageVisuals = require('./message-visuals')
exports.messageFeed = require('./message-feed')
exports.message = require('./message')
exports.messageThread = require('./message-thread')
exports.messageSummary = require('./message-summary')
exports.messageAttachments = require('./message-attachments')
exports.messageStats = require('./message-stats')
exports.contactFeed = require('./contact-feed')
exports.contactSummary = require('./contact-summary')
exports.contactListing = require('./contact-listing')
exports.programFeed = require('./program-feed')
exports.programSummary = require('./program-summary')
exports.editorNav = require('./editor-nav')
exports.notifications = require('./notifications')
exports.peers = require('./peers')
exports.postForm = require('./post-form')
exports.composer = require('./composer')
exports.imageUploader = require('./image-uploader')