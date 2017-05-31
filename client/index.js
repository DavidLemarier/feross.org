var $ = require('jquery')
var addCommas = require('add-commas')
var hljs = require('highlight.js')

// The global jQuery instance is used by some posts
window.$ = window.jQuery = $

function isRetina () {
  var mediaQuery = '(-webkit-min-device-pixel-ratio: 1.5), (min--moz-device-pixel-ratio: 1.5), (-o-min-device-pixel-ratio: 3/2), (min-resolution: 1.5dppx)'
  if (window.devicePixelRatio > 1) { return true }
  if (window.matchMedia && window.matchMedia(mediaQuery).matches) { return true }
  return false
};

function retina () {
  if (!isRetina()) { return }

  $('img.2x').map(function (i, image) {
    var path = $(image).attr('src')

    path = path.replace('.png', '@2x.png')
    path = path.replace('.jpg', '@2x.jpg')

    $(image).attr('src', path)
  })

  // Switch avatar as we use gravatar.com
  var avatar = $('#avatar').attr('src')
  avatar = avatar.replace('s=80', 's=160')
  $('#avatar').attr('src', avatar)
};

$(document).ready(function () {
  // If this is homepage, get view count for all posts
  if ($('body').hasClass('page-home')) {
    $.ajax({
      type: 'GET',
      url: '/views/total',
      dataType: 'json',
      success: function (data) {
        var views = addCommas(data.views)
        $('.views').text(views)
      },
      error: function (data) {
        $('.views').text('Lots of')
      }
    })
  }

  // If this is a post, get post view count
  if ($('body').hasClass('page-post')) {
    var slug = $('.views').data('slug')
    if (!slug) return console.error('missing view slug')
    if (slug[slug.length - 1] === '/') slug = slug.slice(0, slug.length - 1)
    $.ajax({
      type: 'POST',
      url: '/views',
      data: { slug: slug },
      dataType: 'json',
      success: function (data) {
        var views = addCommas(data.views)
        $('.views').text(views + ' views')
      },
      error: function (data) {
        $('.views').text('Lots of views')
      }
    })
  }

  if ($('body').hasClass('page-about')) {
    var ageInDays = Math.floor((new Date() - new Date('1987-08-29T00:00:01.000Z')) / 1000 / 60 / 60 / 24)
    var ageInYears = Math.floor(ageInDays / 365)
    $('#ageInDays').html(' &mdash; that\'s ' + ageInDays + ' days to be exact!')
    $('#ageInYears').text(ageInYears)
  }

  retina()
})
hljs.initHighlightingOnLoad()
