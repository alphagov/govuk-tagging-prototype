var taxonomy = "";
var branch = window.location.pathname.split('/')[2]

$(document).ready(function() {
  $.getJSON('/public/javascripts/'+branch+'-taxonomy.json', function(data) {
    taxonomy = data;
  });

  // hide tag explorer
  $('.add-tag').addClass('js-hidden')

  // set up tagging buttons
  $('.js-tag-item').on('click', function(e) {
    $(this).parents('.content-item').find('.add-tag').removeClass('js-hidden');
  })

  // set up tag explorer
  $(document).on('click', '.tag-explorer a', function(e){
    e.preventDefault()

    var $this = $(this)
    var id = $this.data('contentId')

    var $addTag = $this.parents('.add-tag')
    var $tagExplorer = $this.parents('.tag-explorer')
    var $column = $this.parents('.tag-explorer-column')
    var children = findObjectById(taxonomy, id).child_taxons;

    // remove old parent and active classes
    $column.find('.parent').removeClass('parent')
    $column.find('.active').removeClass('active')

    // highlight parent taxons
    $column.prevAll().find('.active').removeClass('active').addClass('parent')

    // make this one blue
    $this.addClass('active')

    // delete columns after this one
    $column.nextAll('.tag-explorer-column').remove()

    // add new column
    if (children.length > 0) {
      var list = buildList(children, this)

      $column.after(list)

      var $wrapper = $column.parent()
      $wrapper.width($wrapper.find('.tag-explorer-column').length * $wrapper.find('.tag-explorer-column').width())
      $tagExplorer.scrollLeft($wrapper.width())
    } else {
      // no children
    }

    var $tagActions = $addTag.find('.tag-actions')
    $tagActions.removeClass('js-hidden')
    var tagPath = [];
    $tagExplorer.find('.parent').each(function() { tagPath.push($(this).text()) })
    tagPath.push($tagExplorer.find('.active').text());
    $tagActions.find('.tag-path').text(tagPath.join(" > "))
  })

  // hide current-tags
  $('.current-tags').addClass('js-hidden')

  // set up tag actions
  $('.tag-actions').find('.js-cancel').on('click', function(e) {
    $(this).parents('.add-tag').addClass('js-hidden')
  })

  $('.tag-actions').find('.js-add-tag').on('click', function(e) {
    var $this = $(this)

    var $contentItem = $this.parents('.content-item')
    var $addTag = $this.parents('.add-tag')
    var $tagExplorer = $addTag.find('.tag-explorer')

    // get tag name & id
    var $activeTag = $tagExplorer.find('.active')
    var tagName = $activeTag.text()
    var tagId = $activeTag.data('contentId')

    // build tag
    var tag = '<li class="select2-selection__choice" title="'+tagName+'" data-content-id="'+tagId+'">'
    tag += '<span class="select2-selection__choice__remove" role="presentation">×</span>'+tagName+'</li>'

    var $currentTags = $contentItem.find('.current-tags')
    var $currentTagsList = $currentTags.find('ul')

    $currentTags.removeClass('js-hidden')

    // check tag doesn't exist
    var tagExists = false
    $currentTagsList.find('li').each(function(i, el) {
      if ($(this).data('contentId') === tagId) {
        tagExists = true
      }
    });

    if (!tagExists) $currentTagsList.append(tag)
  })

  // remove tag
  $(document).on('click', '.current-tags .select2-selection__choice__remove', function(e) {
    $(this).parents('li').remove()
  })

  function findObjectById(obj, id) {
    if(obj.content_id === id) { return obj; }
    for(var i=0; i<obj.child_taxons.length; i++) {
      var foundId = findObjectById(obj.child_taxons[i], id)
      if(foundId) { return foundId }
    }
    return null
  }

  function buildList(taxons, trigger) {
    var $trigger = $(trigger)
    var id = $trigger.data('contentId')

    var list = '<div class="tag-explorer-column" id="tag-exlorer-'+id+'">'
    list += '<div class="list-group">'
    for (var i in taxons) {
      var taxon = taxons[i]
      list += '<a class="list-group-item" '
      list += 'href="https://www.gov.uk/'+taxon.base_path+'" '
      list += 'data-content-id="'+taxon.content_id+'">'
      list += '<span class="name">'+taxon.name+'</span>'
      if (taxon.child_taxons.length > 0) list += ' <span class="glyphicon glyphicon-chevron-right pull-right"></span>'
      list += '</a>'
    }
    list += '</div></div>'

    return list
  }
})
