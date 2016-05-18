
$(document).ready(function(){
	$('.header').on('click','.btn_search',function(){
		$('.wrap').addClass('header_search');
	})
	
	$('.header').on('click','.btn_menu',function(){
		$('.lnb').addClass('lnb_show');
	})
	
	$('.scroll_cover').on('click','.list_edit',function(){
		$('.wrap').addClass('list_edit_mode');
	})
	
	$('.scroll_cover').on('click','.btn_close',function(){
		$('.wrap').removeClass('list_edit_mode');
	})
	
	$('.lnb').on('click','.btn_close',function(){
		close_side_menu()
	})
	$('.lnb').on('click','.dimmed',function(){
		close_side_menu()
	})
	
	$('.lnb').on('click','.btn_toggle',function(){
		$('.group_list').toggleClass('tree_fold');
	})
	
	
	function close_side_menu(){
		$('.lnb').removeClass('lnb_show');
	}
	
	var fix_position
	
	$('.wrap').scroll(function(){		
		var scroll = $(this).scrollTop();		
		fix_position = $('.header').height();
		
		if (scroll >= fix_position) {
			$('.wrap').addClass('fix_head');
		} else {
			$('.wrap').removeClass('fix_head');
		}
	});

});



/**
 * IBJS : Include By JS
 * Created by SJong on 2014-10-16.
 */

(function(){
    this.IBJS = {};

    /**
     * IBJS ERROR 처리
     * @type {number}
     */
    this.IBJS._err = {
        ERR_WRONG_PATH: 0,
        ERR_WRONG_SEL: 1,
        ERR_WRONG_SEL_BY_CURRENT_DOM: 2,
        ERR_NOT_UNIQUE_SEL: 3
    };
    this.IBJS._state = {
        STATE_BEFORE_GET_HTML: 0,
        STATE_AFTER_GET_HTML: 1
    };

    var ibjs = this.IBJS,
        ibjserr = ibjs._err,
        ibjsstate = ibjs._state,
        fExceptionThrower = function(type, oParams){
            var sThrowMsg = '';

            switch(type){
                case ibjserr.ERR_WRONG_PATH:
                    sThrowMsg = "\nERROR!! Can't find File!!!\nWrong path: " + oParams.path + "\n";
                    break;
                case ibjserr.ERR_WRONG_SEL:
                    if(oParams.path){sThrowMsg = "\nFile path: " + oParams.path;}
                    sThrowMsg += "\nERROR!! Can't find element!!!\nWrong selector: " + oParams.sel + "\n";
                    break;
                case ibjserr.ERR_WRONG_SEL_BY_CURRENT_DOM:
                    sThrowMsg = "\nERROR!! Can't find element!!! in current DOM!!\nWrong selector: " + oParams.sel + "\n";
                    break;
                case ibjserr.ERR_NOT_UNIQUE_SEL:
                    if(oParams.path){sThrowMsg = "\nFile path: " + oParams.path;}
                    sThrowMsg = "\nERROR!! Not Unique selector!!!\nNot Unique selector: " + oParams.sel + "\n";
                    break;
                default:
                    sThrowMsg = '\nUnknown Err!!\n';
            }

            throw sThrowMsg;
        },
        fOriginExTh = fExceptionThrower,
        fExceptionCatchAndAlert = function(){
            try{
                fOriginExTh.apply(this, arguments);
            }catch(e){
                alert(e);
                throw e;
            }
        },
        fSelectorValidator = function(state, path, wElement){
            var fIsEmpty = function(wElement){
                    return wElement.length === 0;
                },
                fIsNotUnique = function(wElement){
                    return wElement.length > 1;
                },
                fIsUnique = function(wElement){
                    return wElement.length === 1;
                };

            switch(state){
                case ibjsstate.STATE_BEFORE_GET_HTML:
                    if(fIsUnique(wElement)){
                        return;
                    }else if(fIsEmpty(wElement)){
                        fExceptionThrower(ibjserr.ERR_WRONG_SEL_BY_CURRENT_DOM, {sel: wElement.selector});
                    }else if(fIsNotUnique(wElement)){
                        return;
                    }
                    break;
                case ibjsstate.STATE_AFTER_GET_HTML:
                    if(fIsUnique(wElement)){
                        return;
                    }else if(fIsEmpty(wElement)){
                        fExceptionThrower(ibjserr.ERR_WRONG_SEL, {path: path, sel: wElement.selector});
                    }else if(fIsNotUnique(wElement)){
                        fExceptionThrower(ibjserr.ERR_NOT_UNIQUE_SEL, {path: path, sel: wElement.selector});
                    }
                    break;
            }

            fExceptionThrower();
        },
        /**
         * @param path
         * @param sel
         * @param option
         */
        fIncludeByPathAndSel = function(path, sel, option){
            var sRemoveClass = option ? option.removeClass : '',
                callback = option ? option.callback : function(){};

            fSelectorValidator(ibjsstate.STATE_BEFORE_GET_HTML, path, $(sel));

            var fInsert = function(data){
                var wResultHTML = $(document.createElement('div')),
                    aSel = $(sel),
                    findHTML;

                wResultHTML.html(data);
                findHTML = wResultHTML.find(sel);

                fSelectorValidator(ibjsstate.STATE_AFTER_GET_HTML, path, findHTML);

                aSel.each(function(index, element){
                    $(element).html(findHTML.html());
                    aSel.removeClass(sRemoveClass);
                    callback();
                });
            };

            $.get(path, fInsert)
                .done(fSuccessCallback)
                .fail(function(){
                    fExceptionThrower(ibjserr.ERR_WRONG_PATH, {path: path});
                });
        },
        fSuccessCallback = function(){};

    /**
     * include function
     * @param param
     */
    ibjs.include = function(param){
        if(arguments.length >= 2 && arguments.length <= 3 && $.type(arguments[0]) === 'string'){
            if($.type(arguments[2]) === 'string'){
                arguments[2] = {removeClass:arguments[2]};
            }
            fIncludeByPathAndSel.apply(this, arguments);
        } else if($.isArray(param)){
            $(param).each(function(index, value){
                fIncludeByPathAndSel.call(this, value.path, value.sel, {
                    removeClass: value.removeClass,
                    callback: value.callback ? value.callback : function(){}
                });
            });
        }
    };

    /**
     * exception -> alert
     */
    ibjs.alertOn = function(){
        fExceptionThrower = fExceptionCatchAndAlert;
    };

    /**
     * alert -> exception
     */
    ibjs.alertOff = function(){
        fExceptionThrower = fOriginExTh;
    };

    ibjs.done = function(callback){
        fSuccessCallback = callback;
    };

})();