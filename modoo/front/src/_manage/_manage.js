$(function(){
  manager = new MarkupManager();
});

function MarkupManager(){
  this._url = null;
  this._themePanel = null;
  this.init();
  this.initEvent();
}

// Init
MarkupManager.prototype.init = function(){
  this._ua = navigator.userAgent.toLowerCase(); //console.log(ua);
  this._url = decodeURIComponent(decodeURIComponent(location.href));
  this._body = $("body");
  this._device = this.getDevice();
  this._mode = this.getMode();
  this._param = this.getParams(this._url);

  // init themeSelect
  this._etc = this._param['etc'];
  this._layout = this._param['layout'];
  this._theme = this._param['theme'];
  this._btnType = this._param['btnType'];
  this._btnSkin = this._param['btnSkin'];
  this._components = this._param['components'] || "";
  this._functional_pages = this._param['functional_pages'] || "";

  this.includeLayout();
  this.includeComponents();
  this.setBodyClass();
  this.createThemePanel();
};

// Init event
MarkupManager.prototype.initEvent = function() {
  var $this = this;
  this._themePanel.on("click", ".btn_set_theme,.btn_close", function() {
    $this._themePanel.toggleClass("active");
  });
  this._themePanel.on("change", "select", function() {
    var etc = $("#etc").val();
    var layoutType = $("#layout").val();
    var themeNum = $("#theme").val() || 1;
    var btnType = $("#btn_type").val() || "c";
    var btnSkinNum = $("#btn_set").val() || 1;
    $this.changeLocation(etc, layoutType, themeNum, btnType, btnSkinNum);
  });
};

// Change location
MarkupManager.prototype.changeLocation = function(etc, layoutType, themeNum, btnType, btnSkinNum) {
  if ( this._url.indexOf("?functional_pages=") == -1 ) {
    location.href = "?etc=" + etc + "&layout=" + layoutType + "&theme=" + themeNum + "&btnType=" + btnType + "&btnSkin=" + btnSkinNum + "&components=" + this._components;
  } else {
    location.href = "?etc=" + etc + "&layout=" + layoutType + "&theme=" + themeNum + "&btnType=" + btnType + "&btnSkin=" + btnSkinNum + "&functional_pages=" + this._functional_pages;
  }
};

// Create theme panel
MarkupManager.prototype.createThemePanel = function() {
  var $this = this;
  this._body.append("<div id='setThemePanel'></div>");
  this._themePanel = $("#setThemePanel");
  this._themePanel.load("../_manage/_manage.html", function(){
    $this.initThemePanel();
  });
};

// Init theme panel
MarkupManager.prototype.initThemePanel = function() {
  $("#etc").val(this._etc);
  $("#layout").val(this._layout);
  $("#theme").val(this._theme);
  $("#btn_type").val(this._btnType);
  $("#btn_set").val(this._btnSkin);

  if ( this._device === "pc" ) {
    $("._group_layout,._group_theme").hide();
  } else {
    if ( this._mode === "front" ) {

    } else {
     //$("._group_layout,._group_btn_type,._group_theme,._group_etc").hide();
    }
  }
};

// Set body classes
MarkupManager.prototype.setBodyClass = function() {
  var className = this.getBodyClass().join(" ");
  this._body.addClass(className);
};

// Get body classes
MarkupManager.prototype.getBodyClass = function() {
  var classes = [];
  var etc = this._param['etc'];
  var layout = this._param['layout'] || "basic";
  var theme = "theme" + (this._param['theme'] || 1);
  var btnType = "btn_type_" + (this._param['btnType'] || "c");
  var btnSkin;
  if ( btnType === "btn_type_c" ) {
    btnSkin = "btn_set" + (this._param['btnSkin'] || 1);
  } else {
    btnSkin = "btn_line" + (this._param['btnSkin'] || 1);
  }
  classes.push(etc, layout, theme, btnType, btnSkin);
  if ( this._ua.indexOf("msie 8") != -1 ) classes.push("ie8");
  if ( this._ua.indexOf("android") != -1 ) classes.push("android");
  if ( this._ua.indexOf("iphone") != -1 || this._ua.indexOf("ipod") != -1 || this._ua.indexOf("ipad") != -1 ) classes.push("ios");
  if ( this._device === "mobile" && layout === "c" ) {
    if ( $(window).width() > 320 ) {
      classes.push("wide");
    } else {
      classes.push("narrow");
    }
  }
  //if ( ua.indexOf("windows") != 1 ) classes.push("windows");
  return classes;
};

// Get mode
MarkupManager.prototype.getMode = function() {
  var mode;
  if ( this._url.indexOf("/editor/") == -1 ) {
    mode = "front";
  } else {
    mode = "editor";
  }
  return mode;
};

// Get device
MarkupManager.prototype.getDevice = function() {
  var device;
  if ( this._url.indexOf("/front/pc.html") != -1 ) {
    device = "pc";
  } else {
    device = "mobile";
  }
  return device;
};

// Get url parameters
MarkupManager.prototype.getParams = function(url) {
  var param = [];
  var params;
  params = url.substring(url.indexOf('?')+1, url.length);
  params = params.split("&");
  var key, value;
  for ( var i = 0; i < params.length; i++ ) {
    key = params[i].split("=")[0];
    value = params[i].split("=")[1];
    param[key] = value;
  }
  return param;
};

// Include layout
MarkupManager.prototype.includeLayout = function() {
  var includeArea = $('[data-include]');
  var self, url;
  $.each(includeArea, function() {
    self = $(this);
    url = self.data("include");
    self.load(url, function() {
      self.removeAttr("data-include");
    });
  });
  attachEvent.init();
};

// Include components
MarkupManager.prototype.includeComponents = function() {
  var insertArea = $("#components");
  if ( this._functional_pages !== "" ) {
    $.ajax({
      url: "../functional_pages/" + this._functional_pages + ".html",
      success: function(data) {
        insertArea.html(data);
      }
    });
    if ( this._components !== "" ) {
      alert("구성요소와 기능페이지를 함께 load 할 수 없습니다.\n기능페이지만 load합니다.");
    }
  }
  if ( this._components !== "" ) {
    this._components = this._components.split("+"); //console.log(components);
    $.each(this._components, function(index, value) {
      $.ajax({
        url: "../components/" + value + ".html",
        async: false,
        success: function(data) {
          insertArea.append(data);
        }
      });
    });
  }
};

var attachEvent = {
  init: function() {
    this.header();
    this.footer();
    this.aside();
  },
  header: function() {
    //console.log("header event attachment!");
    var header = $(".fc_header");
    var aside = $(".fc_aside");
    var layer_dim = $(".layer_dim");
    // header btn
    header.on("click", ".aside", function() {
      aside.css({
        "overflow": "auto",
        "height": $(window).height() + "px",
        "-webkit-transform": "translate3d(0, 0, 0)",
        "-webkit-transition": "all 0.25 ease"
      });
      layer_dim.fadeIn(100);
      $("body").css({"overflow":"hidden"});
    });

    header.on("click", ".other", function() {
    });

    layer_dim.on("click, touchstart", function(event) {
      event.preventDefault();
      aside.css({
        "-webkit-transform": "translate3d(-270px, 0, 0)",
        "-webkit-transition": "all 0.25 ease"
      });
      $("body").css({"overflow":"visible"});
      $(this).fadeOut(100);
    });
  },
  footer: function() {
    //console.log("footer event attachment!");
  },
  aside: function() {
    //console.log("aside event attachment!");
    var aside = $(".fc_aside");
    // snb
    aside.on("click", ".navigate_box .s_m .depth > a", function(event) {
      $(this).closest(".depth").addClass("on selected").siblings(".depth").removeClass("on selected");
      $(this).closest(".depth").find(".sub_menu").show().end().siblings(".depth").find(".sub_menu").hide();
      event.preventDefault();
    });
    // snb sub
    aside.on("click", ".sub_menu li a", function(event) {
      $(this).closest("li").addClass("selected").siblings("li").removeClass("selected");
      event.preventDefault();
    });
  },
  content: function() {
    //
  }
};

// load layer
function layer(file) {
  var response = getLayerHTML(file);
  $("body").append(response);
  if ( file === "layer_set_theme" ) {
    $(".edit_layer.color_set").show();
    $(".layer_dim").show();
  } else if ( file === "layer_add_page" ) {
    $(".edit_layer.page_set").show();
    $(".layer_dim").show();
  } else if ( file === "layer_recommend_template" ) {
    $(".edit_layer.template_set").show();
    $(".layer_dim").show();
  } else if(file === "layer_maincard_edit" || file === "layer_link_section"){
    $(".layer_dim").show();
  } else {
    $("#wrap").hide();
  }
}

// get layer html
function getLayerHTML(file) {
  return $.ajax({
    url: "layer/" + file + ".html",
    async: false
  }).responseText;
}